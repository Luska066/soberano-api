<?php

namespace App\Stripe\Webhoook;

use App\Models\Customer;
use App\Models\License;
use App\Models\User;
use App\Services\LicenseService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class InvoiceWebhookChannels extends ProductWebhookChannels implements Channels
{
    public function invoiceCreated(mixed $data = []) {}

    public function invoiceUpdated(mixed $data = []) {}

    public function invoiceSent(mixed $data = []) {}

    public function invoicePaymentSucceeded(mixed $data = [])
    {
        try {
            $invoice = $data['data']['object'] ?? [];
            $stripeCustomerId = $invoice['customer'] ?? null;
            $customerEmail = $invoice['customer_email'] ?? null;

            if (!$stripeCustomerId && !$customerEmail) {
                return;
            }

            // Busca o usuário via stripe_id ou email
            $user = User::where('stripe_id', $stripeCustomerId)
                ->orWhere('email', $customerEmail)
                ->first();

            if (!$user && $stripeCustomerId) {
                $customer = Customer::where('id_stripe', $stripeCustomerId)->first();
                if ($customer && $customer->id_user) {
                    $user = User::find($customer->id_user);
                }
            }

            // Identifica o plano pela descrição da linha ou interval do preço
            $planCode = '30D'; // Padrão mensal
            $lines = $invoice['lines']['data'] ?? [];
            if (!empty($lines)) {
                $firstLine = $lines[0];
                $interval = $firstLine['price']['recurring']['interval'] ?? null;
                $description = strtolower($firstLine['description'] ?? '');

                if (str_contains($description, 'vitalicio') || str_contains($description, 'life')) {
                    $planCode = 'LIFE';
                } elseif ($interval === 'year') {
                    $planCode = '365D';
                } elseif ($interval === 'week' || str_contains($description, '7 dias') || str_contains($description, 'semanal')) {
                    $planCode = '7D';
                } elseif ($interval === 'month') {
                    $planCode = '30D';
                }
            }

            // Verifica se o usuário já tem uma licença ativa
            $existingLicense = $user
                ? License::where('user_id', $user->id)->where('status', 'active')->first()
                : License::where('user_email', $customerEmail)->where('status', 'active')->first();

            if ($existingLicense) {
                // Renovação: adiciona mais dias
                $daysToAdd = LicenseService::PLANS[$planCode]['days'] ?? 30;
                $baseDate = ($existingLicense->expires_at && Carbon::now()->lessThan($existingLicense->expires_at))
                    ? $existingLicense->expires_at
                    : Carbon::now();

                $existingLicense->update([
                    'expires_at' => $existingLicense->plan === 'LIFE' ? $baseDate->copy()->addYears(100) : $baseDate->copy()->addDays($daysToAdd),
                    'status' => 'active',
                    'notes' => ($existingLicense->notes ?? '') . " | Renovada via Stripe Invoice {$invoice['id']}",
                ]);

                Log::channel('stripe')->info("Licença {$existingLicense->key} renovada com sucesso para {$customerEmail}.");
            } else {
                // Criação de nova chave Global
                $license = LicenseService::createLicense(
                    $planCode,
                    'GLOBAL',
                    $user,
                    "Gerada automaticamente via Stripe Invoice {$invoice['id']}"
                );

                if (!$user && $customerEmail) {
                    $license->update(['user_email' => $customerEmail]);
                }

                Log::channel('stripe')->info("Nova licença {$license->key} ({$planCode}) criada para {$customerEmail}.");
            }
        } catch (\Throwable $e) {
            Log::channel('stripe')->error("Erro ao processar invoicePaymentSucceeded: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    public function invoicePaymentFailed(mixed $data = []) {}
}
