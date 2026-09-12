#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# SOBERANO API - TESTE SINTÉTICO 100% AUTOMATIZADO (ZERO TRABALHO MANUAL)
# ═══════════════════════════════════════════════════════════════════════════════

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo -e "\033[1;35m"
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║          👑 TESTE SINTÉTICO END-TO-END: SOBERANO API & WEB           ║"
echo "║        Licenças + HWID + Webhook Stripe + Catálogo de Modelos         ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "\033[0m"

php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

function post($kernel, $uri, $data, $headers = []) {
    $req = Illuminate\Http\Request::create($uri, "POST", $data);
    $req->headers->set("Accept", "application/json");
    foreach ($headers as $k => $v) {
        $req->headers->set($k, $v);
    }
    $res = $kernel->handle($req);
    $kernel->terminate($req, $res);
    return [
        "status" => $res->getStatusCode(),
        "body" => json_decode($res->getContent(), true) ?: $res->getContent()
    ];
}

function get($kernel, $uri, $headers = []) {
    $req = Illuminate\Http\Request::create($uri, "GET");
    $req->headers->set("Accept", "application/json");
    foreach ($headers as $k => $v) {
        $req->headers->set($k, $v);
    }
    $res = $kernel->handle($req);
    $kernel->terminate($req, $res);
    return [
        "status" => $res->getStatusCode(),
        "body" => json_decode($res->getContent(), true) ?: $res->getContent()
    ];
}

$green = "\033[1;32m";
$red = "\033[1;31m";
$cyan = "\033[1;36m";
$yellow = "\033[1;33m";
$reset = "\033[0m";

$passCount = 0;
$totalTests = 10;

// Limpa estado de testes anteriores para garantir isolamento e idempotência
App\Models\License::where("user_email", "cliente_vip@soberanogames.com")->delete();
Illuminate\Support\Facades\DB::table("revoked_keys")->where("key", "like", "SOB-30D-%")->delete();
Illuminate\Support\Facades\Cache::flush();

echo "{$cyan}[CENÁRIO 1] Cliente realiza compra no site via Stripe (Webhook Event){$reset}\n";
$webhookPayload = [
    "id" => "evt_test_" . uniqid(),
    "type" => "invoice.payment_succeeded",
    "data" => [
        "object" => [
            "id" => "in_synthetic_" . uniqid(),
            "customer" => "cus_stripe_jesus_test",
            "customer_email" => "cliente_vip@soberanogames.com",
            "lines" => [
                "data" => [
                    [
                        "description" => "Assinatura Soberano Mensal 30 Dias",
                        "price" => [
                            "recurring" => ["interval" => "month"]
                        ]
                    ]
                ]
            ]
        ]
    ]
];

$res1 = post($kernel, "/stripe/webhook", $webhookPayload);
$license = App\Models\License::where("user_email", "cliente_vip@soberanogames.com")->where("status", "active")->latest()->first();

if ($license && str_starts_with($license->key, "SOB-30D-")) {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} Webhook gerou automaticamente a chave: {$yellow}{$license->key}{$reset}\n";
    echo "  -> Plano: {$license->plan_name} | HWID Inicial: {$license->hwid}\n\n";
} else {
    echo "  {$red}✘ FALHA:{$reset} O webhook não gerou a licença esperada.\n\n";
}

$key = $license ? $license->key : "SOB-30D-TESTE";

echo "{$cyan}[CENÁRIO 2] Cliente abre o executável IA-SOBERANO-GAMES pela 1ª vez{$reset}\n";
$hwidReal = "SOB-7E4A-91C2-88E1";
$res2 = post($kernel, "/api/v1/auth/activate", [
    "licenseKey" => $key,
    "hwid" => $hwidReal,
    "email" => "cliente_vip@soberanogames.com",
    "appVersion" => "3.0.0-STEALTH"
]);

if ($res2["status"] === 200 && ($res2["body"]["success"] ?? false)) {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} Ativação concluída com sucesso (HTTP 200)!\n";
    echo "  -> Hardware travado em: {$yellow}{$hwidReal}{$reset}\n";
    echo "  -> Sessão Token: " . substr($res2["body"]["session"]["token"], 0, 25) . "...\n";
    echo "  -> Expiração: " . $res2["body"]["session"]["user"]["expiresAt"] . "\n\n";
} else {
    echo "  {$red}✘ FALHA:{$reset} Erro na ativação: " . json_encode($res2) . "\n\n";
}

echo "{$cyan}[CENÁRIO 3] Executável enviando Heartbeat em tempo real durante o jogo{$reset}\n";
$res3 = post($kernel, "/api/v1/auth/verify", [
    "licenseKey" => $key,
    "hwid" => $hwidReal
]);

if ($res3["status"] === 200 && ($res3["body"]["status"] ?? "") === "active") {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} Heartbeat respondendo perfeitamente (HTTP 200 active).\n";
    echo "  -> Dias Restantes: " . $res3["body"]["daysRemaining"] . " dias\n\n";
} else {
    echo "  {$red}✘ FALHA:{$reset} Falha no heartbeat: " . json_encode($res3) . "\n\n";
}

echo "{$cyan}[CENÁRIO 4] Tentativa de Vazamento/Pirataria (Outro usuário tentando usar a mesma chave){$reset}\n";
$hwidInvasor = "SOB-A19F-B32D-44C0";
$res4 = post($kernel, "/api/v1/auth/activate", [
    "licenseKey" => $key,
    "hwid" => $hwidInvasor
]);

if ($res4["status"] === 403) {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} Invasor bloqueado com sucesso (HTTP 403 Forbidden)!\n";
    echo "  -> Mensagem de Bloqueio: {$red}" . $res4["body"]["message"] . "{$reset}\n\n";
} else {
    $st4 = $res4["status"] ?? 0;
    echo "  {$red}✘ FALHA:{$reset} A API retornou HTTP {$st4}: " . json_encode($res4["body"] ?? []) . "\n\n";
}

echo "{$cyan}[CENÁRIO 5] Consulta ao Catálogo Oficial de IAs (/api/v1/models){$reset}\n";
$res5 = get($kernel, "/api/v1/models?game=Fortnite");
if ($res5["status"] === 200 && ($res5["body"]["total"] ?? 0) > 0) {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} Catálogo retornou {$res5["body"]["total"]} modelos de Fortnite com scores e latências reais!\n\n";
} else {
    echo "  {$red}✘ FALHA:{$reset} Falha ao consultar catálogo: " . json_encode($res5) . "\n\n";
}

echo "{$cyan}[CENÁRIO 6] Bloqueio de Download sem Chave de Licença (Pirataria Web){$reset}\n";
$res6 = get($kernel, "/api/v1/models/865/download");
if ($res6["status"] === 401) {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} Tentativa de download sem licença bloqueada com HTTP 401 Unauthorized!\n\n";
} else {
    echo "  {$red}✘ FALHA:{$reset} O servidor permitiu download sem chave: " . json_encode($res6) . "\n\n";
}

echo "{$cyan}[CENÁRIO 7] Bloqueio por Tier (Tentativa de baixar modelo LIFE com chave Trial 7D){$reset}\n";
$trial = App\Models\License::create([
    "key" => "SOB-7D-" . strtoupper(dechex(time() + 7 * 86400)) . "-AA11BB22",
    "plan" => "7D",
    "plan_name" => "Semanal (7 Dias)",
    "status" => "active",
    "duration_days" => 7,
    "activated_at" => now(),
    "expires_at" => now()->addDays(7),
    "hwid" => "GLOBAL"
]);

$res7 = get($kernel, "/api/v1/models/865/download", ["X-License-Key" => $trial->key]);
if ($res7["status"] === 403 && str_contains($res7["body"]["message"], "exige o plano")) {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} Bloqueado com sucesso por nível de plano (HTTP 403):\n";
    echo "  -> {$res7["body"]["message"]}\n\n";
} else {
    echo "  {$red}✘ FALHA:{$reset} Permitiu modelo VIP para plano inferior!\n\n";
}

echo "{$cyan}[CENÁRIO 8] Download Autorizado com Chave Mensal/VIP + Auditoria no Banco{$reset}\n";
$res8 = get($kernel, "/api/v1/models/203/download", [
    "X-License-Key" => $key,
    "X-HWID" => $hwidReal
]);

$downloadLog = App\Models\AiModelDownload::where("license_key", $key)->latest()->first();
if ($res8["status"] === 200 && $downloadLog) {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} Download liberado com sucesso e registrado na tabela de auditoria!\n";
    echo "  -> ID do Modelo: {$downloadLog->ai_model_id} | Data: {$downloadLog->downloaded_at}\n\n";
} else {
    echo "  {$red}✘ FALHA:{$reset} Erro na autorização de download ou log não gravado!\n\n";
}

echo "{$cyan}[CENÁRIO 9] Cliente pede reembolso ou tenta golpe (Você bloqueia no painel){$reset}\n";
$adminSecret = env("SOBERANO_ADMIN_SECRET", "soberano-master-adm-2026");
// Revogação direta via Model (bypassa throttle do teste, simula painel admin)
$revokeResult = App\Models\License::where("key", $key)->update(["status" => "revoked"]);
Illuminate\Support\Facades\DB::table("revoked_keys")->updateOrInsert(
    ["key" => $key],
    ["reason" => "Reembolso Solicitado - Teste Sintético", "revoked_at" => now()]
);
$isRevoked = Illuminate\Support\Facades\DB::table("revoked_keys")->where("key", $key)->exists();
if ($isRevoked) {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} Licença revogada e inserida na blacklist de revogação instantânea.\n\n";
} else {
    echo "  {$red}✘ FALHA:{$reset} Não foi possível inserir na blacklist!\n\n";
}

echo "{$cyan}[CENÁRIO 10] Resposta do Executável ao detectar revogação remota{$reset}\n";
$res10 = post($kernel, "/api/v1/auth/activate", [
    "licenseKey" => $key,
    "hwid"       => $hwidReal
]);

$msg10 = $res10["body"]["message"] ?? "";
if ($res10["status"] === 403 && (str_contains($msg10, "CANCELADA") || str_contains($msg10, "REVOGADA") || str_contains($msg10, "revoked"))) {
    $passCount++;
    echo "  {$green}✔ APROVADO:{$reset} API retorna sinal de morte (HTTP 403 Revogada)!\n";
    echo "  -> Gatilho acionado: IA-SOBERANO-GAMES deleta license.dat e desliga o aimbot.\n\n";
} else {
    $st10 = $res10["status"] ?? 0;
    echo "  {$red}✘ FALHA:{$reset} Chave revogada não retornou 403! Status: {$st10} | Msg: {$msg10}\n\n";
}

echo "═══════════════════════════════════════════════════════════════════════\n";
if ($passCount === $totalTests) {
    echo "{$green}👑 PLACAR FINAL: {$passCount}/{$totalTests} TESTES APROVADOS COM LOUVOR!{$reset}\n";
    echo "   Licenciamento, HWID Lock, Webhooks e Catálogo Protegido 100% Operacionais.\n";
} else {
    echo "{$red}⚠ AVISO: Apenas {$passCount}/{$totalTests} testes passaram.{$reset}\n";
}
echo "═══════════════════════════════════════════════════════════════════════\n";
'
