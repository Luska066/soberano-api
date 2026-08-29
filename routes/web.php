<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use App\Stripe\Webhoook\CustomerWebhookChannels;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('customers', CustomerController::class);
    Route::post('customers/{customer}/sync', [CustomerController::class, 'syncStripe'])->name('customers.sync');
    Route::post('customers/{customer}/subscriptions', [CustomerController::class, 'createSubscription'])->name('customers.subscriptions.create');
    Route::post('customers/{customer}/subscriptions/{subscription}/cancel', [CustomerController::class, 'cancelSubscription'])->name('customers.subscriptions.cancel');
    Route::post('customers/{customer}/subscriptions/{subscription}/resume', [CustomerController::class, 'resumeSubscription'])->name('customers.subscriptions.resume');
    Route::get('customers/{customer}/invoices/{invoice}/download', [CustomerController::class, 'downloadInvoice'])->name('customers.invoices.download');
    Route::resource('products', ProductController::class);
    Route::post('products/{product}/prices', [ProductController::class, 'storePrice'])->name('products.prices.store');
    Route::patch('prices/{price}/toggle-active', [ProductController::class, 'togglePriceActive'])->name('prices.toggle-active')->withTrashed();
    Route::delete('prices/{price}', [ProductController::class, 'destroyPrice'])->name('prices.destroy')->withTrashed();
});

Route::any('/stripe/webhook', function (Request $request) {
    Log::channel('stripe')->info($request->type, $request->all());
    $webhooks = new CustomerWebhookChannels();
    $webhooks->resolve($request->type,$request->all());
    return response()->json([
        'message' => 'Webhook Stripe funcionando',
        'request' => $request->all(),
    ]);
});

require __DIR__ . '/settings.php';
