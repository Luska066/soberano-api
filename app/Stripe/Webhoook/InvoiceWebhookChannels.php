<?php

namespace App\Stripe\Webhoook;

use App\Models\Customer;
use App\Models\License;
use App\Models\StripeWebhookEvent;
use App\Models\User;
use App\Services\LicenseService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Subscription;
use Stripe\StripeClient;

class InvoiceWebhookChannels extends ProductWebhookChannels implements Channels
{
    const InvoiceCreated              = "invoice.created";
    const InvoiceUpdated              = "invoice.updated";
    const InvoiceSent                 = "invoice.sent";
    const InvoicePaid                 = "invoice.paid";
    const InvoicePaymentPaid          = "invoice_payment.paid";
    const InvoicePaymentSucceeded     = "invoice.payment_succeeded";
    const InvoicePaymentFailed        = "invoice.payment_failed";
    const InvoicePaymentActionRequired = "invoice.payment_action_required";

    /**
     * Trata o evento invoice_payment.paid gerado quando um pagamento de fatura é concluído.
     */
    public function invoicePaymentPaid(mixed $data = []): void
    {
        $eventId  = $data['id'] ?? null;
        $type     = $data['type'] ?? self::InvoicePaymentPaid;
        $stripeObject = $data['data']['object'] ?? [];
        $invoiceId = $stripeObject['invoice'] ?? null;

        Log::channel('stripe')->info($type, ['data' => $stripeObject]);

        DB::beginTransaction();
        try {
            if ($eventId) {
                StripeWebhookEvent::firstOrCreate(
                    ['id_stripe_event' => $eventId, 'type' => $type],
                    ['data' => $data]
                );
            }

            if ($invoiceId) {
                $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
                if ($secret) {
                    $stripe  = new StripeClient($secret);
                    $invoice = $stripe->invoices->retrieve($invoiceId, [
                        'expand' => ['subscription', 'customer'],
                    ]);

                    $subscriptionId = is_string($invoice->subscription) ? $invoice->subscription : ($invoice->subscription?->id ?? null);
                    $customerId     = is_string($invoice->customer)     ? $invoice->customer     : ($invoice->customer?->id     ?? null);

                    if ($subscriptionId) {
                        $subscription = Subscription::where('stripe_id', $subscriptionId)->first();
                        if ($subscription) {
                            $subscription->stripe_status = 'active';
                            $subscription->save();
                        }
                    }

                    if ($customerId) {
                        $user = User::where('stripe_id', $customerId)->first();
                        if ($user) {
                            $user->unsetRelation('subscriptions');
                        }
                    }
                }
            }

            if ($eventId) {
                StripeWebhookEvent::where(['id_stripe_event' => $eventId, 'type' => $type])
                    ->update(['processed_at' => now(), 'data' => $data]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::channel('stripe')->error("Erro ao processar {$type}: " . $e->getMessage(), [
                'event_id'   => $eventId,
                'invoice_id' => $invoiceId,
            ]);

            if ($eventId) {
                StripeWebhookEvent::where(['id_stripe_event' => $eventId, 'type' => $type])
                    ->update(['last_error' => json_encode([
                        'error_message' => $e->getMessage(),
                        'error_line'    => $e->getLine(),
                        'error_file'    => $e->getFile(),
                    ]), 'data' => $data]);
            }
        }
    }

    /**
     * Trata invoice.payment_succeeded e invoice.paid.
     */
    public function invoicePaymentSucceeded(mixed $data = []): void
    {
        $this->handleInvoicePaidOrSucceeded($data, self::InvoicePaymentSucceeded);
    }

    public function invoicePaid(mixed $data = []): void
    {
        $this->handleInvoicePaidOrSucceeded($data, self::InvoicePaid);
    }

    /**
     * Lógica unificada de pagamento confirmado:
     * 1. Atualiza a Subscription no Cashier (código do Luska).
     * 2. Provisiona/renova a Licença Soberana no banco (código de licenciamento).
     */
    protected function handleInvoicePaidOrSucceeded(mixed $data, string $type): void
    {
        $eventId        = $data['id'] ?? null;
        $stripeObject   = $data['data']['object'] ?? [];
        $subscriptionId = is_string($stripeObject['subscription'] ?? null)
            ? $stripeObject['subscription']
            : ($stripeObject['subscription']['id'] ?? null);
        $customerId     = is_string($stripeObject['customer'] ?? null)
            ? $stripeObject['customer']
            : ($stripeObject['customer']['id'] ?? null);
        $customerEmail  = $stripeObject['customer_email'] ?? null;

        Log::channel('stripe')->info($type, ['data' => $stripeObject]);

        DB::beginTransaction();
        try {
            if ($eventId) {
                StripeWebhookEvent::firstOrCreate(
                    ['id_stripe_event' => $eventId, 'type' => $type],
                    ['data' => $data]
                );
            }

            // ── 1. Atualiza status da Subscription no Cashier (código do Luska)
            if ($subscriptionId) {
                $subscription = Subscription::where('stripe_id', $subscriptionId)->first();
                if ($subscription) {
                    $subscription->stripe_status = 'active';
                    $subscription->save();
                }
            }

            // ── 2. Resolve o usuário local
            $user = null;
            if ($customerId) {
                $user = User::where('stripe_id', $customerId)->first();
                if (!$user) {
                    $customer = Customer::where('id_stripe', $customerId)->first();
                    if ($customer?->id_user) {
                        $user = User::find($customer->id_user);
                    }
                }
                if ($user) {
                    $user->unsetRelation('subscriptions');
                }
            }
            if (!$user && $customerEmail) {
                $user = User::where('email', $customerEmail)->first();
            }

            // ── 3. Provisiona / Renova a Licença Soberana (código do Licenciamento)
            $planCode = $this->detectPlanCode($stripeObject);
            $existingLicense = $user
                ? License::where('user_id', $user->id)->where('status', 'active')->first()
                : License::where('user_email', $customerEmail)->where('status', 'active')->first();

            if ($existingLicense) {
                $daysToAdd = LicenseService::PLANS[$planCode]['days'] ?? 30;
                $baseDate  = ($existingLicense->expires_at && Carbon::now()->lessThan($existingLicense->expires_at))
                    ? $existingLicense->expires_at
                    : Carbon::now();

                $existingLicense->update([
                    'expires_at' => $existingLicense->plan === 'LIFE'
                        ? $baseDate->copy()->addYears(100)
                        : $baseDate->copy()->addDays($daysToAdd),
                    'status' => 'active',
                    'notes'  => ($existingLicense->notes ?? '') . " | Renovada via Stripe {$type} {$eventId}",
                ]);

                Log::channel('stripe')->info("Licença {$existingLicense->key} renovada para {$customerEmail}.");
            } else {
                $license = LicenseService::createLicense(
                    $planCode,
                    'GLOBAL',
                    $user,
                    "Gerada automaticamente via Stripe {$type} {$eventId}"
                );

                if (!$user && $customerEmail) {
                    $license->update(['user_email' => $customerEmail]);
                }

                Log::channel('stripe')->info("Nova licença {$license->key} ({$planCode}) criada para {$customerEmail}.");
            }

            if ($eventId) {
                StripeWebhookEvent::where(['id_stripe_event' => $eventId, 'type' => $type])
                    ->update(['processed_at' => now(), 'data' => $data]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::channel('stripe')->error("Erro ao processar {$type}: " . $e->getMessage(), [
                'event_id' => $eventId,
            ]);

            if ($eventId) {
                StripeWebhookEvent::where(['id_stripe_event' => $eventId, 'type' => $type])
                    ->update(['last_error' => json_encode([
                        'error_message' => $e->getMessage(),
                        'error_line'    => $e->getLine(),
                        'error_file'    => $e->getFile(),
                    ]), 'data' => $data]);
            }
        }
    }

    /**
     * Detecta o código do plano com base nos dados da invoice da Stripe.
     */
    protected function detectPlanCode(array $stripeObject): string
    {
        $lines = $stripeObject['lines']['data'] ?? [];
        if (empty($lines)) {
            return '30D';
        }

        $firstLine   = $lines[0];
        $interval    = $firstLine['price']['recurring']['interval'] ?? null;
        $description = strtolower($firstLine['description'] ?? '');

        if (str_contains($description, 'vitalicio') || str_contains($description, 'life')) {
            return 'LIFE';
        }
        if ($interval === 'year') {
            return '365D';
        }
        if ($interval === 'week' || str_contains($description, '7 dias') || str_contains($description, 'semanal')) {
            return '7D';
        }

        return '30D';
    }

    /**
     * Trata invoice.payment_failed — suspende a Subscription.
     */
    public function invoicePaymentFailed(mixed $data = []): void
    {
        $eventId        = $data['id'] ?? null;
        $type           = $data['type'] ?? self::InvoicePaymentFailed;
        $stripeObject   = $data['data']['object'] ?? [];
        $subscriptionId = is_string($stripeObject['subscription'] ?? null)
            ? $stripeObject['subscription']
            : ($stripeObject['subscription']['id'] ?? null);

        Log::channel('stripe')->warning($type, ['data' => $stripeObject]);

        DB::beginTransaction();
        try {
            if ($eventId) {
                StripeWebhookEvent::firstOrCreate(
                    ['id_stripe_event' => $eventId, 'type' => $type],
                    ['data' => $data]
                );
            }

            if ($subscriptionId) {
                $subscription = Subscription::where('stripe_id', $subscriptionId)->first();
                if ($subscription) {
                    $subscription->stripe_status = 'past_due';
                    $subscription->save();
                }
            }

            if ($eventId) {
                StripeWebhookEvent::where(['id_stripe_event' => $eventId, 'type' => $type])
                    ->update(['processed_at' => now(), 'data' => $data]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::channel('stripe')->error("Erro ao processar {$type}: " . $e->getMessage(), [
                'event_id' => $eventId,
            ]);

            if ($eventId) {
                StripeWebhookEvent::where(['id_stripe_event' => $eventId, 'type' => $type])
                    ->update(['last_error' => json_encode([
                        'error_message' => $e->getMessage(),
                        'error_line'    => $e->getLine(),
                        'error_file'    => $e->getFile(),
                    ]), 'data' => $data]);
            }
        }
    }

    public function invoiceCreated(mixed $data = []): void
    {
        $this->recordGenericInvoiceEvent($data, self::InvoiceCreated);
    }

    public function invoiceUpdated(mixed $data = []): void
    {
        $this->recordGenericInvoiceEvent($data, self::InvoiceUpdated);
    }

    public function invoiceSent(mixed $data = []): void
    {
        $this->recordGenericInvoiceEvent($data, self::InvoiceSent);
    }

    protected function recordGenericInvoiceEvent(mixed $data, string $type): void
    {
        $eventId = $data['id'] ?? null;
        if ($eventId) {
            try {
                StripeWebhookEvent::firstOrCreate(
                    ['id_stripe_event' => $eventId, 'type' => $type],
                    ['data' => $data, 'processed_at' => now()]
                );
            } catch (\Throwable $e) {
                Log::channel('stripe')->warning("Erro ao registrar {$type}: " . $e->getMessage());
            }
        }
    }
}
