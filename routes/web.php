<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Http\Controllers\CustomerController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('customers', CustomerController::class);
});

Route::any('/stripe/webhook', function (Request $request) {
    Log::channel('stripe')->info($request->type, $request->all());

    return response()->json([
        'message' => 'Webhook Stripe funcionando',
        'request' => $request->all(),
    ]);
});

require __DIR__ . '/settings.php';
