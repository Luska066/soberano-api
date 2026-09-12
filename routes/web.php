<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use App\Stripe\Webhoook\CustomerWebhookChannels;

Route::get('/', function () {
    $models = \App\Models\AiModel::where('is_active', true)
        ->orderByDesc('soberano_score')
        ->take(12)
        ->get();

    return inertia('welcome', [
        'aiModels' => $models,
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        $license = null;
        if ($user) {
            $license = \App\Models\License::where('user_id', $user->id)
                ->orWhere('user_email', $user->email)
                ->latest()
                ->first();
        }

        $models = \App\Models\AiModel::where('is_active', true)
            ->orderByDesc('soberano_score')
            ->get();

        return inertia('dashboard', [
            'license' => $license ? [
                'key' => $license->key,
                'plan' => $license->plan,
                'plan_name' => $license->plan_name,
                'status' => $license->status,
                'hwid' => $license->hwid,
                'days_remaining' => $license->days_remaining,
                'expires_at' => $license->expires_at?->format('d/m/Y'),
                'activated_at' => $license->activated_at?->format('d/m/Y H:i'),
            ] : null,
            'aiModels' => $models,
        ]);
    })->name('dashboard');
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
