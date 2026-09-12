<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Http\Controllers\Customer\StepController;
use App\Http\Controllers\Customer\SubscriptionController;
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

    // Dashboard: injeta dados de licença e catálogo de modelos (API Soberana)
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
                'key'          => $license->key,
                'plan'         => $license->plan,
                'plan_name'    => $license->plan_name,
                'status'       => $license->status,
                'hwid'         => $license->hwid,
                'days_remaining' => $license->days_remaining,
                'expires_at'   => $license->expires_at?->format('d/m/Y'),
                'activated_at' => $license->activated_at?->format('d/m/Y H:i'),
            ] : null,
            'aiModels' => $models,
        ]);
    })->name('dashboard');

    // ── Rotas restritas para Clientes (filtrado por user->type = customer)
    Route::middleware(['customer'])->group(function () {
        Route::get('choose-plan', [StepController::class, 'choosePlan'])->name('steps.choose-plan');
        Route::get('choose-plan/success', [StepController::class, 'checkoutSuccess'])->name('steps.choose-plan.success');
        Route::post('choose-plan/checkout', [StepController::class, 'checkout'])->name('steps.choose-plan.checkout');
        Route::post('choose-plan', [StepController::class, 'storeChoosePlan'])->name('steps.choose-plan.store');

        // Assinatura e Faturas do Cliente
        Route::get('subscription', [SubscriptionController::class, 'index'])->name('customer.subscription');
        Route::post('subscription/swap', [SubscriptionController::class, 'swap'])->name('customer.subscription.swap');
        Route::post('subscription/cancel', [SubscriptionController::class, 'cancel'])->name('customer.subscription.cancel');
        Route::post('subscription/resume', [SubscriptionController::class, 'resume'])->name('customer.subscription.resume');
        Route::get('subscription/invoices/{invoice}/download', [SubscriptionController::class, 'downloadInvoice'])->name('customer.invoices.download');
    });

    // ── Rotas restritas para Administradores
    Route::middleware(['admin'])->group(function () {
        Route::resource('customers', CustomerController::class);
        Route::post('customers/{customer}/sync', [CustomerController::class, 'syncStripe'])->name('customers.sync');
        Route::post('customers/{customer}/subscriptions', [CustomerController::class, 'createSubscription'])->name('customers.subscriptions.create');
        Route::post('customers/{customer}/subscriptions/{subscription}/swap', [CustomerController::class, 'swapSubscription'])->name('customers.subscriptions.swap');
        Route::post('customers/{customer}/subscriptions/{subscription}/cancel', [CustomerController::class, 'cancelSubscription'])->name('customers.subscriptions.cancel');
        Route::post('customers/{customer}/subscriptions/{subscription}/resume', [CustomerController::class, 'resumeSubscription'])->name('customers.subscriptions.resume');
        Route::get('customers/{customer}/invoices/{invoice}/download', [CustomerController::class, 'downloadInvoice'])->name('customers.invoices.download');
        Route::resource('products', ProductController::class);
        Route::post('products/{product}/prices', [ProductController::class, 'storePrice'])->name('products.prices.store');
        Route::patch('prices/{price}/toggle-active', [ProductController::class, 'togglePriceActive'])->name('prices.toggle-active')->withTrashed();
        Route::delete('prices/{price}', [ProductController::class, 'destroyPrice'])->name('prices.destroy')->withTrashed();
    });
});

Route::post('/stripe/webhook', function (Request $request) {
    // Payload já verificado pelo middleware VerifyStripeWebhookSignature
    $payload = json_decode($request->getContent(), true);

    if (!$payload || !isset($payload['type'])) {
        Log::channel('stripe')->warning('Webhook com payload inválido.', ['ip' => $request->ip()]);
        return response()->json(['error' => 'Payload inválido.'], 400);
    }

    Log::channel('stripe')->info('Webhook recebido: ' . $payload['type']);

    $webhooks = new CustomerWebhookChannels();
    $webhooks->resolve($payload['type'], $payload);

    return response()->json(['received' => true]);
})->middleware('stripe.webhook');

require __DIR__ . '/settings.php';
