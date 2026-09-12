<?php

namespace App\Http\Middleware;

use App\Models\AiModel;
use App\Models\License;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveLicense
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Tenta extrair a chave de licença
        $licenseKey = $request->header('X-License-Key')
            ?? $request->input('license_key')
            ?? $request->input('licenseKey');

        // Se veio token Bearer (ex: native-jwt-SOB-30D-... ou soberano-token-...)
        $bearer = $request->bearerToken();
        if (!$licenseKey && $bearer && str_starts_with($bearer, 'native-jwt-')) {
            $licenseKey = str_replace('native-jwt-', '', $bearer);
        }

        // Se o usuário estiver logado na web session
        $user = $request->user();
        $license = null;

        if ($licenseKey) {
            $cleanKey = strtoupper(trim($licenseKey));
            $license = License::where('key', $cleanKey)->first();
        } elseif ($user) {
            $license = License::where('user_id', $user->id)
                ->orWhere('user_email', $user->email)
                ->where('status', 'active')
                ->latest()
                ->first();
        }

        if (!$license) {
            return response()->json([
                'success' => false,
                'status' => 401,
                'message' => '🔒 Acesso Negado: É necessária uma Chave de Licença ativa ou login no site para baixar modelos.',
            ], 401);
        }

        // 2. Verifica se a chave foi revogada
        if ($license->status === 'revoked' || $license->status === 'banned' || DB::table('revoked_keys')->where('key', $license->key)->exists()) {
            return response()->json([
                'success' => false,
                'status' => 403,
                'message' => '⛔ Esta chave de licença foi CANCELADA/REVOGADA pelo administrador!',
            ], 403);
        }

        // 3. Verifica expiração
        if ($license->expires_at && Carbon::now()->greaterThan($license->expires_at)) {
            return response()->json([
                'success' => false,
                'status' => 403,
                'message' => '⚠️ Sua assinatura expirou. Renove seu plano para continuar baixando modelos de IA.',
            ], 403);
        }

        // 4. Verificação de HWID (se informado)
        $clientHwid = $request->header('X-HWID') ?? $request->input('hwid');
        if ($clientHwid && $license->hwid && $license->hwid !== 'GLOBAL') {
            if (strtoupper(trim($clientHwid)) !== strtoupper(trim($license->hwid))) {
                return response()->json([
                    'success' => false,
                    'status' => 403,
                    'message' => '🔒 Trava de Hardware: Chave autorizada para outro computador.',
                ], 403);
            }
        }

        // 5. Verificação de Tier / Plano Mínimo do Modelo solicitado
        $modelId = $request->route('id') ?? $request->input('model_id');
        if ($modelId) {
            $model = is_numeric($modelId)
                ? AiModel::where('model_id', $modelId)->orWhere('id', $modelId)->first()
                : null;

            if ($model && !$model->isAccessibleByPlan($license->plan)) {
                return response()->json([
                    'success' => false,
                    'status' => 403,
                    'message' => "⭐ Este modelo exclusivo ({$model->tier}) exige o plano {$model->min_plan} ou superior. Seu plano atual é: {$license->plan_name}.",
                ], 403);
            }
        }

        // Anexa a licença aprovada aos atributos da requisição
        $request->attributes->set('authenticated_license', $license);

        return $next($request);
    }
}
