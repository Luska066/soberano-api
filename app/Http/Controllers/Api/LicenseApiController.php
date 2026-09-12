<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\License;
use App\Models\User;
use App\Services\LicenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LicenseApiController extends Controller
{
    /**
     * Endpoint Principal de Ativação / Login do Desktop App (IA-SOBERANO-GAMES)
     * POST /api/v1/auth/activate ou POST /v1/auth/activate
     */
    public function activate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'nullable|string|email|max:255',
            'password' => 'nullable|string',
            'licenseKey' => 'required|string',
            'hwid' => 'nullable|string',
            'appVersion' => 'nullable|string',
        ]);

        $licenseKey = trim($validated['licenseKey']);
        $clientHwid = trim($validated['hwid'] ?? 'SOB-HWID-UNKNOWN');
        $email = isset($validated['email']) ? trim(strtolower($validated['email'])) : null;
        $ip = $request->ip();
        $appVersion = $validated['appVersion'] ?? '3.0.0-STEALTH';

        // Opcional: se o usuário enviou email e senha, valida as credenciais
        if ($email && !empty($validated['password'])) {
            $user = User::where('email', $email)->first();
            if ($user && !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciais incorretas (senha inválida para esta conta).',
                ], 401);
            }
        }

        $result = LicenseService::activateOrValidate($licenseKey, $clientHwid, $email, $ip, $appVersion);

        return response()->json($result, $result['status'] ?? 200);
    }

    /**
     * Endpoint de Verificação de Integridade em Tempo Real da Licença
     * POST /api/v1/auth/verify ou POST /v1/auth/verify
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'licenseKey' => 'required|string',
            'hwid' => 'required|string',
        ]);

        $key = strtoupper(trim($request->input('licenseKey')));
        $hwid = strtoupper(trim($request->input('hwid')));

        // Checa se foi revogada
        if (DB::table('revoked_keys')->where('key', $key)->exists()) {
            return response()->json([
                'success' => false,
                'status' => 'revoked',
                'message' => '⛔ Licença revogada pelo administrador.',
            ], 403);
        }

        $license = License::where('key', $key)->first();
        if (!$license) {
            return response()->json([
                'success' => false,
                'status' => 'not_found',
                'message' => 'Licença não encontrada no banco.',
            ], 404);
        }

        if (!$license->isActive()) {
            return response()->json([
                'success' => false,
                'status' => $license->status,
                'message' => 'Licença inativa ou expirada.',
            ], 403);
        }

        if ($license->hwid !== 'GLOBAL' && $license->hwid !== $hwid) {
            return response()->json([
                'success' => false,
                'status' => 'hwid_mismatch',
                'message' => 'Conflito de HWID. Chave ativada em outro dispositivo.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'status' => 'active',
            'daysRemaining' => $license->days_remaining,
            'expiresAt' => $license->expires_at?->format('d/m/Y'),
        ]);
    }

    /**
     * Geração Administrativa de Licenças (Painel ou Webhooks)
     * POST /api/v1/licenses/generate
     */
    public function generate(Request $request): JsonResponse
    {
        // Validação de Chave Mestre de Admin via Bearer ou Header
        $adminSecret = config('services.soberano.admin_secret') ?: env('SOBERANO_ADMIN_SECRET');
        $token = $request->bearerToken() ?: $request->header('X-Admin-Secret');

        if (empty($adminSecret) || !$token || !hash_equals((string) $adminSecret, (string) $token)) {
            return response()->json(['error' => 'Acesso não autorizado ao Keygen Master.'], 403);
        }

        $validated = $request->validate([
            'plan' => 'required|string|in:7D,30D,365D,LIFE,7d,30d,365d,life',
            'hwid' => 'nullable|string',
            'email' => 'nullable|email',
            'notes' => 'nullable|string',
        ]);

        $plan = strtoupper($validated['plan']);
        $hwid = !empty($validated['hwid']) ? strtoupper(trim($validated['hwid'])) : 'GLOBAL';
        $user = !empty($validated['email']) ? User::where('email', $validated['email'])->first() : null;

        $license = LicenseService::createLicense($plan, $hwid, $user, $validated['notes'] ?? 'Criada via Admin API');

        return response()->json([
            'success' => true,
            'message' => 'Licença gerada com sucesso!',
            'license' => [
                'key' => $license->key,
                'plan' => $license->plan,
                'plan_name' => $license->plan_name,
                'duration_days' => $license->duration_days,
                'hwid' => $license->hwid,
                'status' => $license->status,
                'created_at' => $license->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Revogação Instantânea de Licença
     * POST /api/v1/licenses/revoke
     */
    public function revoke(Request $request): JsonResponse
    {
        $adminSecret = config('services.soberano.admin_secret') ?: env('SOBERANO_ADMIN_SECRET');
        $token = $request->bearerToken() ?: $request->header('X-Admin-Secret');

        if (empty($adminSecret) || !$token || !hash_equals((string) $adminSecret, (string) $token)) {
            return response()->json(['error' => 'Não autorizado.'], 403);
        }

        $request->validate([
            'key' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $key = strtoupper(trim($request->input('key')));
        $reason = $request->input('reason', 'Revogada pelo administrador');

        // Marca na tabela licenses
        License::where('key', $key)->update(['status' => 'revoked']);

        // Insere na tabela revoked_keys para consulta rápida
        DB::table('revoked_keys')->updateOrInsert(
            ['key' => $key],
            ['reason' => $reason, 'revoked_at' => Carbon::now()]
        );

        return response()->json([
            'success' => true,
            'message' => "Chave {$key} revogada e bloqueada com sucesso!",
        ]);
    }

    /**
     * Reset de HWID de Licença
     * POST /api/v1/licenses/reset-hwid
     */
    public function resetHwid(Request $request): JsonResponse
    {
        $adminSecret = config('services.soberano.admin_secret') ?: env('SOBERANO_ADMIN_SECRET');
        $token = $request->bearerToken() ?: $request->header('X-Admin-Secret');

        if (empty($adminSecret) || !$token || !hash_equals((string) $adminSecret, (string) $token)) {
            return response()->json(['error' => 'Não autorizado.'], 403);
        }

        $request->validate(['key' => 'required|string']);
        $key = strtoupper(trim($request->input('key')));

        $license = License::where('key', $key)->first();
        if (!$license) {
            return response()->json(['error' => 'Licença não encontrada.'], 404);
        }

        $license->update(['hwid' => 'GLOBAL']);

        return response()->json([
            'success' => true,
            'message' => "HWID da chave {$key} resetado com sucesso para GLOBAL!",
        ]);
    }
}
