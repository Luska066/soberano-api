<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\WebhookSignature;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware que verifica a assinatura criptográfica do Webhook da Stripe.
 *
 * A Stripe assina cada requisição com um HMAC-SHA256 usando o
 * STRIPE_WEBHOOK_SECRET do painel. Qualquer requisição sem essa
 * assinatura válida é rejeitada com 401 — impossibilitando
 * que atacantes simulem pagamentos falsos.
 *
 * Docs: https://stripe.com/docs/webhooks/signatures
 */
class VerifyStripeWebhookSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('cashier.webhook.secret') ?? env('STRIPE_WEBHOOK_SECRET');

        // Se não houver secret configurado, bloqueia em produção
        if (empty($secret)) {
            if (app()->environment('production')) {
                Log::channel('stripe')->critical('STRIPE_WEBHOOK_SECRET não configurado em produção! Requisição bloqueada.');
                return response()->json([
                    'error' => 'Webhook não configurado corretamente.',
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            // Em local/dev sem secret, loga aviso mas deixa passar
            Log::channel('stripe')->warning('STRIPE_WEBHOOK_SECRET ausente — verificação desativada (ambiente local).');
            return $next($request);
        }

        $signature = $request->header('Stripe-Signature');

        if (empty($signature)) {
            Log::channel('stripe')->warning('Requisição ao webhook sem header Stripe-Signature.', [
                'ip' => $request->ip(),
            ]);
            return response()->json([
                'error' => 'Assinatura Stripe ausente.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        try {
            // Verifica usando o payload RAW (obrigatório — JSON parseado invalida a assinatura)
            WebhookSignature::verifyHeader(
                $request->getContent(),
                $signature,
                $secret,
                300 // Tolerância de 5 minutos (padrão Stripe)
            );
        } catch (SignatureVerificationException $e) {
            Log::channel('stripe')->error('Assinatura Stripe inválida — possível ataque de replay ou requisição forjada.', [
                'ip'    => $request->ip(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Assinatura Stripe inválida.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
