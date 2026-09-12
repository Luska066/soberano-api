<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de Cabeçalhos de Segurança HTTP.
 *
 * Remove headers que revelam tecnologia do servidor e injeta
 * cabeçalhos defensivos recomendados pelo OWASP.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // ── Remove fingerprints do servidor
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        // ── Previne clickjacking (embed em iframe malicioso)
        $response->headers->set('X-Frame-Options', 'DENY');

        // ── Previne MIME sniffing (browser executar JS disfarçado de imagem)
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // ── Força HTTPS em browsers (só ativo em produção)
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // ── Controla quais informações o browser envia como Referer
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // ── Desativa funcionalidades perigosas do browser
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

        // ── Content Security Policy básica para rotas web
        if (!$request->is('api/*') && !$request->is('v1/*')) {
            $response->headers->set(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://js.stripe.com; connect-src 'self' https://api.stripe.com"
            );
        }

        return $response;
    }
}
