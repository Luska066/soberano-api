<?php

namespace App\Http\Controllers\Customer;

use App\Enums\Stripe\v1\StripCountrieType;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class StepController extends Controller
{
    /**
     * Exibe a tela de seleção de planos com visual moderno e checkout integrado.
     */
    public function choosePlan(Request $request): Response
    {
        $user = $request->user();
        $customer = $user->customer;

        $products = Product::query()
            ->with([
                'prices' => function ($q) {
                    $q->whereNull('deleted_at');
                },
                'benefits',
            ])
            ->whereNotNull('id_stripe')
            ->get();

        return Inertia::render('customer/steps/choose-plan', [
            'customer' => $customer,
            'products' => $products,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'stripeCountries' => StripCountrieType::toSelectSorted(),
        ]);
    }

    /**
     * Inicia a sessão de pagamento (Stripe Checkout) para o plano selecionado.
     */
    public function checkout(Request $request): SymfonyResponse
    {
        $validated = $request->validate([
            'price_id' => ['required', 'string'],
        ]);

        $user = $request->user();
        $customer = $user->customer;
        $priceId = $validated['price_id'];

        try {
            if (!$user->hasStripeId()) {
                $user->createAsStripeCustomer([
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $customer?->phone,
                    'metadata' => [
                        'customer_id' => $customer?->uuid ?? '',
                        'user_id' => $user->id,
                    ],
                ]);

                if ($customer) {
                    $customer->id_stripe = $user->stripe_id;
                    $customer->saveQuietly();
                }
            }

            $checkout = $user->newSubscription('default', $priceId)
                ->allowPromotionCodes()
                ->checkout([
                    'success_url' => route('steps.choose-plan.success') . '?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => route('steps.choose-plan') . '?checkout=cancelled',
                ]);

            return Inertia::location($checkout->url);
        } catch (\Throwable $e) {
            Log::error('Erro ao iniciar Stripe Checkout: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'price_id' => $priceId,
            ]);

            return redirect()->back()->withErrors([
                'general' => 'Ocorreu um erro ao abrir a tela de pagamento: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Exibe a tela de confirmação de pagamento com sincronização completa do Stripe e redirecionamento.
     */
    public function checkoutSuccess(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $customer = $user->customer;
        $sessionId = $request->query('session_id');

        $sessionData = null;
        $secret = config('cashier.secret') ?? env('STRIPE_SECRET');

        if ($secret) {
            try {
                $stripe = new \Stripe\StripeClient($secret);
                $subObject = null;
                $subscriptionId = null;

                if (!empty($sessionId)) {
                    $session = $stripe->checkout->sessions->retrieve($sessionId, [
                        'expand' => ['subscription', 'customer'],
                    ]);

                    $stripeCustomerId = is_string($session->customer) ? $session->customer : ($session->customer?->id ?? null);

                    // Validação de Segurança (Prevenção contra IDOR / Session Hijacking):
                    // Garante que a sessão pertence ao usuário autenticado
                    $belongsToUser = false;
                    if (!empty($user->stripe_id) && $stripeCustomerId === $user->stripe_id) {
                        $belongsToUser = true;
                    } elseif (!empty($session->customer_details?->email) && strtolower($session->customer_details->email) === strtolower($user->email)) {
                        $belongsToUser = true;
                    } elseif (!empty($session->metadata?->user_id) && (string) $session->metadata->user_id === (string) $user->id) {
                        $belongsToUser = true;
                    }

                    if (!$belongsToUser) {
                        Log::warning('Tentativa de acesso a checkout session não autorizada', [
                            'session_id' => $sessionId,
                            'auth_user_id' => $user->id,
                            'session_customer' => $stripeCustomerId,
                        ]);

                        return redirect()->route('steps.choose-plan')->withErrors([
                            'general' => 'Sessão de pagamento inválida ou não pertence a esta conta.',
                        ]);
                    }

                    // Sincroniza customer ID no usuário caso tenha sido criado
                    if ($stripeCustomerId && empty($user->stripe_id)) {
                        $user->stripe_id = $stripeCustomerId;
                        $user->saveQuietly();
                    }
                    if ($stripeCustomerId && $customer && empty($customer->id_stripe)) {
                        $customer->id_stripe = $stripeCustomerId;
                        $customer->saveQuietly();
                    }

                    $subObject = $session->subscription;
                    $subscriptionId = is_string($subObject) ? $subObject : ($subObject?->id ?? null);

                    $sessionData = [
                        'id' => $session->id,
                        'customer_email' => $session->customer_details?->email ?? $user->email,
                        'customer_name' => $session->customer_details?->name ?? $user->name,
                        'amount_total' => $session->amount_total ? $session->amount_total / 100 : 0,
                        'currency' => strtoupper($session->currency ?? 'brl'),
                        'payment_status' => $session->payment_status,
                        'status' => $session->status,
                        'subscription_id' => $subscriptionId,
                    ];
                }

                // Se subscription for apenas o ID (string) ou nula, busca os dados completos no Stripe
                if (is_string($subObject) && !empty($subscriptionId)) {
                    $subObject = $stripe->subscriptions->retrieve($subscriptionId, [
                        'expand' => ['items.data.price'],
                    ]);
                }

                // Fallback: se não veio pela sessão, busca a assinatura mais recente do cliente no Stripe
                $stripeId = $user->stripe_id ?? ($customer?->id_stripe ?? null);
                if (!$subObject && $stripeId) {
                    $latestSubs = $stripe->subscriptions->all([
                        'customer' => $stripeId,
                        'limit' => 1,
                        'expand' => ['data.items.data.price'],
                    ]);
                    $subObject = $latestSubs->data[0] ?? null;
                    $subscriptionId = $subObject?->id ?? null;
                }

                // Sincroniza imediatamente na tabela subscriptions e subscription_items do Cashier
                if ($subObject && is_object($subObject)) {
                    $firstItem = $subObject->items->data[0] ?? null;
                    $priceId = $firstItem?->price?->id;
                    $quantity = $firstItem?->quantity ?? 1;

                    $subscription = \Laravel\Cashier\Subscription::updateOrCreate(
                        [
                            'stripe_id' => $subObject->id,
                        ],
                        [
                            'user_id' => $user->id,
                            'type' => $subObject->metadata->name ?? ($subObject->metadata->type ?? 'default'),
                            'stripe_status' => $subObject->status ?? 'active',
                            'stripe_price' => $priceId,
                            'quantity' => $quantity,
                            'trial_ends_at' => $subObject->trial_end ? \Illuminate\Support\Carbon::createFromTimestamp($subObject->trial_end) : null,
                            'ends_at' => $subObject->cancel_at ? \Illuminate\Support\Carbon::createFromTimestamp($subObject->cancel_at) : (isset($subObject->ended_at) && $subObject->ended_at ? \Illuminate\Support\Carbon::createFromTimestamp($subObject->ended_at) : null),
                        ]
                    );

                    if ($firstItem) {
                        \Laravel\Cashier\SubscriptionItem::updateOrCreate(
                            [
                                'subscription_id' => $subscription->id,
                                'stripe_id' => $firstItem->id,
                            ],
                            [
                                'stripe_product' => is_string($firstItem->price?->product ?? null) ? $firstItem->price->product : ($firstItem->price?->product?->id ?? ''),
                                'stripe_price' => $priceId,
                                'quantity' => $quantity,
                            ]
                        );
                    }

                    // Limpa cache de relações no modelo para que $user->subscribed('default') retorne true na hora
                    $user->unsetRelation('subscriptions');
                }
            } catch (\Throwable $e) {
                Log::error('Erro ao sincronizar assinatura no checkoutSuccess: ' . $e->getMessage(), [
                    'user_id' => $user->id,
                    'session_id' => $sessionId,
                ]);
            }
        }

        return Inertia::render('customer/steps/checkout-success', [
            'customer' => $customer,
            'session' => $sessionData,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Salva ou atualiza os dados de endereço do cliente.
     */
    public function storeChoosePlan(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'country' => ['required', 'string', 'max:100'],
            'country_code' => ['required', 'string', 'max:10'],
            'phone' => ['required', 'string', 'max:30'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
        ], [
            'country.required' => 'O campo país é obrigatório.',
            'country_code.required' => 'O código de discagem (DDI) é obrigatório.',
            'phone.required' => 'O campo telefone / celular é obrigatório.',
            'line1.required' => 'O campo endereço / logradouro é obrigatório.',
            'city.required' => 'O campo cidade é obrigatório.',
            'state.required' => 'O campo estado / província é obrigatório.',
            'postal_code.required' => 'O campo CEP / código postal é obrigatório.',
        ]);

        $validator->after(function ($validator) use ($request) {
            $countryInput = $request->input('country');
            $ddiInput = $request->input('country_code');
            $postalCodeInput = $request->input('postal_code');
            $phoneInput = $request->input('phone');

            // 1. Validação do País do Endereço
            $countryEnum = StripCountrieType::fromValueOrLabel($countryInput);
            if (!$countryEnum) {
                $validator->errors()->add(
                    'country',
                    'O país selecionado não é válido ou não é suportado pelo Stripe.'
                );
            } else {
                // 2. Validação da máscara e formato do Código Postal / CEP
                if (!empty($postalCodeInput) && !$countryEnum->validatePostalCode($postalCodeInput)) {
                    $validator->errors()->add(
                        'postal_code',
                        "O formato do código postal é inválido para o país selecionado ({$countryEnum->label()})."
                    );
                }
            }

            // 3. Validação do DDI de Contato
            $ddiEnum = StripCountrieType::fromDdi($ddiInput);
            if (!$ddiEnum) {
                $validator->errors()->add(
                    'country_code',
                    'O DDI / Código do país selecionado não é válido.'
                );
            } else {
                // 4. Validação da máscara e formato do Telefone / Celular
                if (!empty($phoneInput) && !$ddiEnum->validatePhone($phoneInput)) {
                    $validator->errors()->add(
                        'phone',
                        "O formato do telefone/celular é inválido para o padrão do DDI ({$ddiEnum->label()} {$ddiEnum->ddi()})."
                    );
                }
            }
        });

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();
        $user = $request->user();

        DB::beginTransaction();
        try {
            Customer::updateOrCreate(
                ['id_user' => $user->id],
                [
                    'country' => $validated['country'],
                    'country_code' => $validated['country_code'],
                    'phone' => $validated['phone'],
                    'line1' => $validated['line1'],
                    'line2' => $validated['line2'] ?? null,
                    'city' => $validated['city'],
                    'state' => $validated['state'],
                    'postal_code' => $validated['postal_code'],
                ]
            );

            DB::commit();

            if (Route::has('customer.steps.select_plan')) {
                return redirect()->route('customer.steps.select_plan')
                    ->with('success', 'Endereço salvo com sucesso!');
            }

            return redirect()->back()->with('success', 'Endereço salvo com sucesso!');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao salvar o endereço: ' . $e->getMessage()])
                ->withInput();
        }
    }
}
