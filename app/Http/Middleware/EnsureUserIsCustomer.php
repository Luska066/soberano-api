<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCustomer
{
    /**
     * Handle an incoming request.
     *
     * Valida se o usuário é um cliente ativo e se sua assinatura está em dia
     * (respeitando períodos de teste/Trial e períodos de tolerância/Grace Period).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // 1. Valida se o usuário existe e se tem cadastro de cliente ativo
        if (! $user || ! $user->isCustomerActivated()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login');
        }

        // 2. Valida se o usuário possui assinatura ativa, trial ativo ou grace period vigente
        if (! $user->hasValidSubscription('default')) {
            $subscription = $user->subscription('default');

            // Caso NÃO possua nenhuma assinatura, ou a assinatura foi cancelada e o grace period já acabou:
            if (! $user->subscribed('default') || ($subscription && $subscription->canceled() && ! $subscription->onGracePeriod())) {
                if (! $request->routeIs('steps.*')) {
                    return redirect()->route('steps.choose-plan')->withErrors([
                        'general' => 'Sua assinatura foi cancelada ou expirou. Por favor, escolha um plano para reativar seu acesso.',
                    ]);
                }
            } else {
                // Caso POSSUA assinatura mas esteja com fatura pendente/inadimplente (past_due / incomplete):
                if (! $request->routeIs('customer.subscription*') && ! $request->routeIs('steps.*')) {
                    return redirect()->route('customer.subscription')->withErrors([
                        'general' => 'Sua assinatura possui uma fatura pendente de pagamento. Por favor, regularize para continuar utilizando o sistema.',
                    ]);
                }
            }
        }

        return $next($request);
    }
}
