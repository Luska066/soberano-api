<?php

use App\Http\Controllers\Api\LicenseApiController;
use Illuminate\Support\Facades\Route;

// Rotas com prefixo v1
Route::prefix('v1')->group(function () {
    // Autenticação e Ativação do Desktop App
    Route::post('/auth/activate', [LicenseApiController::class, 'activate'])->name('api.v1.auth.activate');
    Route::post('/auth/login', [LicenseApiController::class, 'activate'])->name('api.v1.auth.login');
    Route::post('/auth/verify', [LicenseApiController::class, 'verify'])->name('api.v1.auth.verify');

    // Gestão Administrativa de Licenças
    Route::post('/licenses/generate', [LicenseApiController::class, 'generate'])->name('api.v1.licenses.generate');
    Route::post('/licenses/revoke', [LicenseApiController::class, 'revoke'])->name('api.v1.licenses.revoke');
    Route::post('/licenses/reset-hwid', [LicenseApiController::class, 'resetHwid'])->name('api.v1.licenses.reset-hwid');

    // Catálogo Soberano de Modelos de IA
    Route::get('/models', [\App\Http\Controllers\Api\AiModelApiController::class, 'index'])->name('api.v1.models.index');
    Route::get('/models/{id}', [\App\Http\Controllers\Api\AiModelApiController::class, 'show'])->name('api.v1.models.show');
    Route::get('/models/{id}/download', [\App\Http\Controllers\Api\AiModelApiController::class, 'download'])
        ->middleware('license.active')
        ->name('api.v1.models.download');
});

// Aliases diretos para máxima compatibilidade com clientes antigos ou novos
Route::post('/auth/activate', [LicenseApiController::class, 'activate']);
Route::post('/auth/login', [LicenseApiController::class, 'activate']);
Route::post('/auth/verify', [LicenseApiController::class, 'verify']);

Route::get('/models', [\App\Http\Controllers\Api\AiModelApiController::class, 'index']);
Route::get('/models/{id}', [\App\Http\Controllers\Api\AiModelApiController::class, 'show']);
Route::get('/models/{id}/download', [\App\Http\Controllers\Api\AiModelApiController::class, 'download'])
    ->middleware('license.active');
