<?php

namespace App\Services\Subscription;

use App\Models\User;
use Illuminate\Support\Carbon;

class SubscriptionValidationService
{
    /**
     * Valida se o usuário possui uma assinatura ativa e está em dia com os pagamentos.
     *
     * Retorna true se:
     * - Possui assinatura do tipo informado (padrão 'default')
     * - O status é 'active' ou 'trialing' (ou em período de tolerância antes de ends_at)
     * - Não possui pagamentos incompletos ou em atraso (past_due, unpaid, incomplete_expired)
     *
     * Retorna false se:
     * - Não possui assinatura
     * - A assinatura expirou (ended)
     * - Está com pagamento recusado/atrasado (past_due, unpaid)
     * - Está com pagamento pendente de confirmação (hasIncompletePayment)
     */
    public function isValidAndActive(?User $user, string $type = 'default'): bool
    {
        if (!$user) {
            return false;
        }

        // 1. Verifica se possui a assinatura registrada no Cashier
        if (!$user->subscribed($type)) {
            return false;
        }

        $subscription = $user->subscription($type);
        if (!$subscription) {
            return false;
        }

        // 2. Se a assinatura já foi finalizada/expirou a data limite
        if ($subscription->ended()) {
            return false;
        }

        // 3. Verifica se possui pendências de pagamento na última fatura
        if ($user->hasIncompletePayment($type)) {
            return false;
        }

        $status = strtolower($subscription->stripe_status ?? '');

        // 4. Se a fatura foi recusada / inadimplente / não paga
        if (in_array($status, ['past_due', 'unpaid', 'incomplete', 'incomplete_expired'])) {
            return false;
        }

        // 5. Período de Teste Gratuito (Trial): se o trial está ativo e não expirou, acesso LIBERADO!
        if ($subscription->onTrial() || $status === 'trialing') {
            return true;
        }

        // 6. Período de Tolerância (Grace Period): se cancelou mas ainda tem dias pagos no futuro, acesso LIBERADO!
        if ($subscription->onGracePeriod()) {
            return true;
        }

        // 7. Se o status for 'canceled' e não estiver mais em grace period (já expirou)
        if ($status === 'canceled') {
            return false;
        }

        // 8. Se tem data de término e já expirou
        if ($subscription->ends_at && $subscription->ended()) {
            return false;
        }

        // 9. Assinatura ativa normalmente
        return $subscription->active();
    }

    /**
     * Retorna um diagnóstico detalhado do estado da assinatura do usuário.
     *
     * @return array{
     *     is_valid: bool,
     *     status: string,
     *     is_subscribed: bool,
     *     on_grace_period: bool,
     *     has_incomplete_payment: bool,
     *     ends_at: string|null,
     *     message: string
     * }
     */
    public function getStatusDetails(?User $user, string $type = 'default'): array
    {
        if (!$user) {
            return [
                'is_valid' => false,
                'status' => 'unauthenticated',
                'is_subscribed' => false,
                'on_grace_period' => false,
                'has_incomplete_payment' => false,
                'ends_at' => null,
                'message' => 'Usuário não autenticado.',
            ];
        }

        $subscription = $user->subscription($type);
        $isSubscribed = $user->subscribed($type);
        $hasIncompletePayment = $user->hasIncompletePayment($type);
        $isValid = $this->isValidAndActive($user, $type);

        $status = $subscription?->stripe_status ?? 'no_subscription';
        $onGracePeriod = (bool) ($subscription?->onGracePeriod() ?? false);
        $endsAt = $subscription?->ends_at ? $subscription->ends_at->format('d/m/Y H:i') : null;

        $message = 'Assinatura ativa e em dia.';

        if (!$isSubscribed || !$subscription) {
            $message = 'Nenhuma assinatura encontrada.';
        } elseif ($subscription->ended()) {
            $message = 'Assinatura expirada.';
        } elseif ($hasIncompletePayment) {
            $message = 'Existe uma fatura com pagamento pendente de confirmação.';
        } elseif ($status === 'past_due' || $status === 'unpaid') {
            $message = 'Pagamento em atraso ou recusado na renovação.';
        } elseif ($onGracePeriod) {
            $message = "Cancelamento agendado. Acesso permitido até {$endsAt}.";
        }

        return [
            'is_valid' => $isValid,
            'status' => $status,
            'is_subscribed' => $isSubscribed,
            'on_grace_period' => $onGracePeriod,
            'has_incomplete_payment' => $hasIncompletePayment,
            'ends_at' => $endsAt,
            'message' => $message,
        ];
    }
}
