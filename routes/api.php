<?php

use App\Http\Controllers\Api\LicenseApiController;
use Illuminate\Support\Facades\Route;

// ─── Rotas com prefixo v1 ──────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // ── Auth / Ativação (throttle: 10 tentativas por minuto por IP)
    // Protege contra brute force de chaves e enumeração de licenças.
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/auth/activate', [LicenseApiController::class, 'activate'])->name('api.v1.auth.activate');
        Route::post('/auth/login',    [LicenseApiController::class, 'activate'])->name('api.v1.auth.login');
        Route::post('/auth/verify',   [LicenseApiController::class, 'verify'])->name('api.v1.auth.verify');
    });

    // ── Admin (throttle: 5 por minuto) — qualquer tentativa excessiva é bloqueada
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('/licenses/generate',  [LicenseApiController::class, 'generate'])->name('api.v1.licenses.generate');
        Route::post('/licenses/revoke',    [LicenseApiController::class, 'revoke'])->name('api.v1.licenses.revoke');
        Route::post('/licenses/reset-hwid',[LicenseApiController::class, 'resetHwid'])->name('api.v1.licenses.reset-hwid');
    });

    // ── Catálogo público (throttle: 60 por minuto)
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/models',         [\App\Http\Controllers\Api\AiModelApiController::class, 'index'])->name('api.v1.models.index');
        Route::get('/models/{id}',    [\App\Http\Controllers\Api\AiModelApiController::class, 'show'])->name('api.v1.models.show');
    });

    // ── Download protegido (throttle: 20 por minuto + verificação de licença)
    Route::middleware(['throttle:20,1', 'license.active'])->group(function () {
        Route::get('/models/{id}/download', [\App\Http\Controllers\Api\AiModelApiController::class, 'download'])->name('api.v1.models.download');
    });
});

// ─── Aliases diretos (compatibilidade com app desktop legado) ──────────────────
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/auth/activate', [LicenseApiController::class, 'activate']);
    Route::post('/auth/login',    [LicenseApiController::class, 'activate']);
    Route::post('/auth/verify',   [LicenseApiController::class, 'verify']);
});

Route::middleware('throttle:60,1')->group(function () {
    Route::get('/models',      [\App\Http\Controllers\Api\AiModelApiController::class, 'index']);
    Route::get('/models/{id}', [\App\Http\Controllers\Api\AiModelApiController::class, 'show']);
});

Route::middleware(['throttle:20,1', 'license.active'])->group(function () {
    Route::get('/models/{id}/download', [\App\Http\Controllers\Api\AiModelApiController::class, 'download']);
});
