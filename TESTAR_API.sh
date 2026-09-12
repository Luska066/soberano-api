#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# SOBERANO API & LICENCIAMENTO - SUÍTE DE TESTES AUTOMATIZADOS
# ═══════════════════════════════════════════════════════════════════════════════

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "👑 EXECUTANDO SUÍTE DE TESTES DA API SOBERANA"
echo "=========================================================="

php -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

function testPost($kernel, $uri, $data, $headers = []) {
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

echo "\n[TESTE 1] Geração de Licença Mensal via Admin API...\n";
$res1 = testPost($kernel, "/api/v1/licenses/generate", [
    "plan" => "30D",
    "notes" => "Chave de Teste Automatizado"
], ["X-Admin-Secret" => "soberano-master-adm-2026"]);

if ($res1["status"] === 201 && !empty($res1["body"]["license"]["key"])) {
    $key = $res1["body"]["license"]["key"];
    echo "  -> SUCESSO! Chave gerada: " . $key . " (Status " . $res1["status"] . ")\n";
} else {
    echo "  -> FALHA ao gerar chave: " . json_encode($res1) . "\n";
    exit(1);
}

echo "\n[TESTE 2] Ativação da Licença pelo App Desktop (HWID Lock)...\n";
$hwidA = "SOB-HWID-GAMER-PC-ALPHA";
$res2 = testPost($kernel, "/api/v1/auth/activate", [
    "licenseKey" => $key,
    "hwid" => $hwidA,
    "email" => "alpha@soberanogames.com",
    "appVersion" => "3.0.0-STEALTH"
]);

if ($res2["status"] === 200 && $res2["body"]["success"] === true) {
    echo "  -> SUCESSO! Licença ativada para " . $hwidA . "\n";
    echo "  -> Expiração: " . $res2["body"]["session"]["user"]["expiresAt"] . "\n";
} else {
    echo "  -> FALHA na ativação: " . json_encode($res2) . "\n";
    exit(1);
}

echo "\n[TESTE 3] Verificação em Tempo Real (Heartbeat)...\n";
$res3 = testPost($kernel, "/api/v1/auth/verify", [
    "licenseKey" => $key,
    "hwid" => $hwidA
]);

if ($res3["status"] === 200 && $res3["body"]["status"] === "active") {
    echo "  -> SUCESSO! Heartbeat ativo. Dias restantes: " . $res3["body"]["daysRemaining"] . "\n";
} else {
    echo "  -> FALHA no heartbeat: " . json_encode($res3) . "\n";
    exit(1);
}

echo "\n[TESTE 4] Proteção contra Compartilhamento (Tentativa com HWID Diferente)...\n";
$hwidB = "SOB-HWID-PIRATA-PC-BETA";
$res4 = testPost($kernel, "/api/v1/auth/activate", [
    "licenseKey" => $key,
    "hwid" => $hwidB
]);

if ($res4["status"] === 403) {
    echo "  -> SUCESSO! Bloqueado com Trava de Hardware (Status 403): " . $res4["body"]["message"] . "\n";
} else {
    echo "  -> FALHA: O sistema deveria ter bloqueado o segundo HWID!\n";
    exit(1);
}

echo "\n[TESTE 5] Revogação Instantânea da Licença (Admin API)...\n";
$res5 = testPost($kernel, "/api/v1/licenses/revoke", [
    "key" => $key,
    "reason" => "Reembolso Solicitado"
], ["X-Admin-Secret" => "soberano-master-adm-2026"]);

if ($res5["status"] === 200) {
    echo "  -> SUCESSO! " . $res5["body"]["message"] . "\n";
} else {
    echo "  -> FALHA na revogação: " . json_encode($res5) . "\n";
    exit(1);
}

echo "\n[TESTE 6] Tentativa de Login com Chave Revogada (Gatilho Anti-Cheating)...\n";
$res6 = testPost($kernel, "/api/v1/auth/activate", [
    "licenseKey" => $key,
    "hwid" => $hwidA
]);

if ($res6["status"] === 403 && str_contains($res6["body"]["message"], "CANCELADA/REVOGADA")) {
    echo "  -> SUCESSO! Retornou 403 Revogada (Aciona auto-destruição do license.dat no cliente).\n";
} else {
    echo "  -> FALHA: Chave revogada não retornou 403!\n";
    exit(1);
}

echo "\n==========================================================\n";
echo "👑 TODOS OS 6 TESTES DA API FORAM APROVADOS COM 100% DE SUCESSO!\n";
echo "==========================================================\n";
'
