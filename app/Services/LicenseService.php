<?php

namespace App\Services;

use App\Models\License;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class LicenseService
{
    public const SECRET_SALT = 'SOBERANO-AI-KERNEL-PROTECT-SECRET-SALT-2026-v2.0';

    public const PLANS = [
        '7D' => [
            'name' => 'Semanal (7 Dias)',
            'days' => 7,
            'seconds' => 7 * 86400,
        ],
        '30D' => [
            'name' => 'Mensal (30 Dias)',
            'days' => 30,
            'seconds' => 30 * 86400,
        ],
        '365D' => [
            'name' => 'Anual (365 Dias)',
            'days' => 365,
            'seconds' => 365 * 86400,
        ],
        'LIFE' => [
            'name' => 'Vitalício (Soberano VIP)',
            'days' => 36500,
            'seconds' => 100 * 365 * 86400,
        ],
    ];

    /**
     * Gera uma chave criptográfica no padrão nativo do Kernel Soberano.
     * Formato: SOB-{PLANO}-{EXPIRACAO_HEX}-{ASSINATURA_HEX}
     */
    public static function generateKey(string $plan = '30D', string $hwid = 'GLOBAL', ?int $customExpTs = null): string
    {
        $plan = strtoupper(trim($plan));
        if (!isset(self::PLANS[$plan])) {
            $plan = '30D';
        }

        $duration = self::PLANS[$plan]['seconds'];
        $now = time();
        $expTs = $customExpTs ?? ($now + $duration);
        $expHex = strtoupper(str_pad(dechex($expTs), 8, '0', STR_PAD_LEFT));
        $targetHwid = !empty(trim($hwid)) ? strtoupper(trim($hwid)) : 'GLOBAL';

        $payload = self::SECRET_SALT . $plan . strtoupper(dechex($expTs)) . $targetHwid;
        $sig = strtoupper(substr(hash('sha256', $payload), 0, 8));

        return "SOB-{$plan}-{$expHex}-{$sig}";
    }

    /**
     * Valida matematicamente a assinatura criptográfica de uma chave.
     */
    public static function verifySignature(string $key, string $hwid = 'GLOBAL'): bool
    {
        $parts = explode('-', trim(strtoupper($key)));
        if (count($parts) !== 4 || $parts[0] !== 'SOB') {
            return false;
        }

        $plan = $parts[1];
        $expHex = $parts[2];
        $sig = $parts[3];

        $expTs = hexdec($expHex);
        $targetHwid = !empty(trim($hwid)) ? strtoupper(trim($hwid)) : 'GLOBAL';

        // Valida contra o HWID fornecido
        $payload = self::SECRET_SALT . $plan . strtoupper(dechex($expTs)) . $targetHwid;
        $expectedSig = strtoupper(substr(hash('sha256', $payload), 0, 8));

        if (hash_equals($expectedSig, $sig)) {
            return true;
        }

        // Se o HWID fornecido não bateu, confere se a chave foi assinada como GLOBAL
        if ($targetHwid !== 'GLOBAL') {
            $payloadGlobal = self::SECRET_SALT . $plan . strtoupper(dechex($expTs)) . 'GLOBAL';
            $expectedSigGlobal = strtoupper(substr(hash('sha256', $payloadGlobal), 0, 8));
            return hash_equals($expectedSigGlobal, $sig);
        }

        return false;
    }

    /**
     * Cria e registra uma nova licença no banco de dados.
     */
    public static function createLicense(
        string $plan = '30D',
        string $hwid = 'GLOBAL',
        ?User $user = null,
        ?string $notes = null
    ): License {
        $plan = strtoupper(trim($plan));
        if (!isset(self::PLANS[$plan])) {
            $plan = '30D';
        }

        $planConfig = self::PLANS[$plan];
        $key = self::generateKey($plan, $hwid);

        return License::create([
            'key' => $key,
            'plan' => $plan,
            'plan_name' => $planConfig['name'],
            'hwid' => strtoupper(trim($hwid)) ?: 'GLOBAL',
            'status' => 'active',
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'duration_days' => $planConfig['days'],
            'activated_at' => null,
            'expires_at' => null, // Será preenchido no primeiro login
            'notes' => $notes,
        ]);
    }

    /**
     * Ativa ou valida a licença vinda do cliente desktop (IA-SOBERANO-GAMES.exe).
     */
    public static function activateOrValidate(
        string $key,
        string $clientHwid,
        ?string $email = null,
        ?string $ip = null,
        ?string $appVersion = null
    ): array {
        $cleanKey = strtoupper(trim($key));
        $cleanHwid = strtoupper(trim($clientHwid));

        // 1. Verifica se a chave está na tabela de revogadas
        $isRevoked = DB::table('revoked_keys')->where('key', $cleanKey)->exists();
        if ($isRevoked) {
            return [
                'success' => false,
                'status' => 403,
                'message' => '⛔ Esta chave de licença foi CANCELADA/REVOGADA pelo administrador!',
            ];
        }

        // 2. Busca no banco de dados
        $license = License::where('key', $cleanKey)->first();

        // Se não existir no banco, valida criptograficamente (chave gerada offline pelo admin)
        if (!$license) {
            if (!self::verifySignature($cleanKey, $cleanHwid)) {
                return [
                    'success' => false,
                    'status' => 404,
                    'message' => 'Chave de licença inválida ou inexistente.',
                ];
            }

            // Chave matemática válida! Registra no banco para auditoria
            $parts = explode('-', $cleanKey);
            $plan = $parts[1];
            $planConfig = self::PLANS[$plan] ?? self::PLANS['30D'];

            $license = License::create([
                'key' => $cleanKey,
                'plan' => $plan,
                'plan_name' => $planConfig['name'],
                'hwid' => 'GLOBAL',
                'status' => 'active',
                'duration_days' => $planConfig['days'],
                'notes' => 'Ativada via validação matemática offline',
            ]);
        }

        // 3. Verifica status
        if ($license->status === 'revoked' || $license->status === 'banned') {
            return [
                'success' => false,
                'status' => 403,
                'message' => '⛔ Esta chave de licença foi CANCELADA/REVOGADA pelo administrador!',
            ];
        }

        // 4. Gerencia ativação e expiração
        $now = Carbon::now();

        if (!$license->activated_at) {
            // Primeiro login: trava o HWID e inicia o relógio da assinatura
            $duration = $license->duration_days ?: 30;
            $expiresAt = $license->plan === 'LIFE' ? $now->copy()->addYears(100) : $now->copy()->addDays($duration);

            $license->update([
                'activated_at' => $now,
                'expires_at' => $expiresAt,
                'hwid' => $cleanHwid ?: 'GLOBAL',
                'user_email' => $email ?: $license->user_email,
                'last_ip' => $ip,
                'app_version' => $appVersion,
            ]);
        } else {
            // Já ativada anteriormente: verifica expiração
            if ($license->expires_at && $now->greaterThan($license->expires_at)) {
                $license->update(['status' => 'expired']);
                return [
                    'success' => false,
                    'status' => 403,
                    'message' => "⚠️ Sua assinatura expirou em {$license->expires_at->format('d/m/Y')}. Renove seu plano para continuar jogando.",
                ];
            }

            // 5. Trava de Hardware (HWID Lock)
            if ($license->hwid && $license->hwid !== 'GLOBAL' && $license->hwid !== $cleanHwid) {
                return [
                    'success' => false,
                    'status' => 403,
                    'message' => '🔒 Trava de Hardware: Esta chave está vinculada a outro computador. Solicite o reset de HWID ao suporte.',
                ];
            }

            // Atualiza telemetria de acesso
            $license->update([
                'last_ip' => $ip,
                'app_version' => $appVersion ?: $license->app_version,
            ]);
        }

        $daysRemaining = $license->days_remaining;
        $expiresDisplay = ($license->plan === 'LIFE' || str_contains($license->plan_name, 'Vitalício'))
            ? 'Acesso Vitalício'
            : "{$daysRemaining} Dias Restantes ({$license->expires_at->format('d/m/Y')})";

        return [
            'success' => true,
            'status' => 200,
            'message' => "Licença {$license->plan_name} ativada com sucesso!",
            'session' => [
                'token' => 'soberano-token-' . bin2hex(random_bytes(24)),
                'licenseKey' => $license->key,
                'user' => [
                    'id' => 'usr_' . substr(md5($license->hwid ?: $license->key), 0, 8),
                    'username' => $email ? explode('@', $email)[0] : 'Cliente Soberano',
                    'email' => $email ?: ($license->user_email ?: 'cliente@soberano.com'),
                    'plan' => $license->plan_name,
                    'expiresAt' => $expiresDisplay,
                    'daysRemaining' => $daysRemaining,
                    'hwid' => $license->hwid,
                    'isMaster' => false,
                ],
            ],
        ];
    }
}
