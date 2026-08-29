<?php

namespace App\Http\Controllers;

use App\Enums\Stripe\v1\StripCountrieType;
use App\Models\Customer;
use App\Models\Price;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\StripeClient;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $country = $request->string('country')->trim()->toString();

        $query = Customer::query()->with('user')->latest();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('city', 'like', "%{$search}%")
                    ->orWhere('state', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%")
                    ->orWhere('postal_code', 'like', "%{$search}%")
                    ->orWhere('line1', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($country)) {
            $query->where(function ($q) use ($country) {
                $countryEnum = StripCountrieType::fromValueOrLabel($country);
                if ($countryEnum) {
                    $q->where('country', $countryEnum->value)
                        ->orWhere('country', $countryEnum->label());
                } else {
                    $q->where('country', $country);
                }
            });
        }

        $customers = $query->paginate(10)->withQueryString();

        // Calculate metrics
        $totalCustomers = Customer::count();
        $totalCountries = Customer::distinct('country')->count('country');
        $newThisMonth = Customer::where('created_at', '>=', now()->startOfMonth())->count();

        $availableCountries = Customer::query()
            ->select('country')
            ->distinct()
            ->whereNotNull('country')
            ->pluck('country');

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'country' => $country,
            ],
            'metrics' => [
                'total' => $totalCustomers,
                'active' => $totalCustomers,
                'countries' => $totalCountries,
                'new_this_month' => $newThisMonth,
            ],
            'availableCountries' => $availableCountries,
            'stripeCountries' => StripCountrieType::toSelectSorted(),
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'country_code' => ['required', 'string', 'max:10'],
            'phone' => ['required', 'string', 'max:30'],
            'country' => ['required', 'string', 'max:100'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
        ], [
            'name.required' => 'O campo nome completo é obrigatório.',
            'email.required' => 'O campo email é obrigatório.',
            'email.email' => 'Informe um endereço de email válido.',
            'email.unique' => 'Este email já está cadastrado.',
            'password.required' => 'O campo senha é obrigatório.',
            'password.min' => 'A senha deve ter no mínimo 8 caracteres.',
            'country_code.required' => 'O campo DDI / Código do país é obrigatório.',
            'phone.required' => 'O campo telefone / celular é obrigatório.',
            'country.required' => 'O campo país é obrigatório.',
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

        DB::beginTransaction();
        try {
            // Criação de usuário para autenticação
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'type' => 'customer',
            ]);

            Customer::create([
                'id_user' => $user->id,
                'phone' => $validated['phone'],
                'country_code' => $validated['country_code'],
                'country' => $validated['country'],
                'line1' => $validated['line1'],
                'line2' => $validated['line2'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['postal_code'],
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Cliente cadastrado com sucesso!');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao cadastrar o cliente: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['nullable', 'string', 'min:8', 'max:255'],
            'country_code' => ['required', 'string', 'max:10'],
            'phone' => ['required', 'string', 'max:30'],
            'country' => ['required', 'string', 'max:100'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
        ], [
            'name.required' => 'O campo nome completo é obrigatório.',
            'email.required' => 'O campo email é obrigatório.',
            'email.email' => 'Informe um endereço de email válido.',
            'password.min' => 'A nova senha deve ter no mínimo 8 caracteres.',
            'country_code.required' => 'O campo DDI / Código do país é obrigatório.',
            'phone.required' => 'O campo telefone / celular é obrigatório.',
            'country.required' => 'O campo país é obrigatório.',
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

        DB::beginTransaction();
        try {
            // Atualização de usuário associado
            if ($customer->user) {
                $customer->user->name = $validated['name'];
                $customer->user->email = $validated['email'];
                if (!empty($validated['password'])) {
                    $customer->user->password = Hash::make($validated['password']);
                }
                $customer->user->save();
            }

            $countryEnum = StripCountrieType::fromValueOrLabel($validated['country']);
            $customer->country = $validated['country'];
            $customer->line1 = $validated['line1'];
            $customer->line2 = $validated['line2'] ?? null;
            $customer->city = $validated['city'];
            $customer->state = $validated['state'];
            $customer->postal_code = $validated['postal_code'];
            $customer->phone = $validated['phone'];
            $customer->country_code = $countryEnum?->ddi();
            $customer->save();
            DB::commit();

            return redirect()->back()->with('success', 'Cliente atualizado com sucesso!');
        } catch (\Throwable $e) {
            DB::rollBack();
            dd($e->getMessage(), $e->getLine(), $e->getFile());
            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao atualizar o cliente: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $customer->delete();
            DB::commit();

            return redirect()->back()->with('success', 'Cliente excluído com sucesso!');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['general' => 'Ocorreu um erro ao excluir o cliente: ' . $e->getMessage()]);
        }
    }

    /**
     * Display customer details with subscriptions, invoices, and latest invoice.
     */
    public function show(Customer $customer): Response
    {
        $customer->load(['user', 'subscriptions.items']);

        // Sincroniza id_stripe se estiver nulo mas existir no user
        if (empty($customer->id_stripe) && $customer->user?->stripe_id) {
            $customer->id_stripe = $customer->user->stripe_id;
            $customer->saveQuietly();
        }

        $stripeCustomerData = null;
        $stripeSubscriptions = [];
        $invoicesData = [];
        $latestInvoiceData = null;
        $upcomingInvoiceData = null;

        $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
        $stripe = $secret ? new StripeClient($secret) : null;
        $stripeId = $customer->stripe_id;

        if ($stripe && $stripeId) {
            try {
                // 1. Dados do cliente no Stripe
                $stripeCustomer = $stripe->customers->retrieve($stripeId, [
                    'expand' => ['default_source'],
                ]);
                $stripeCustomerData = [
                    'id' => $stripeCustomer->id,
                    'balance' => $stripeCustomer->balance ? $stripeCustomer->balance / 100 : 0,
                    'currency' => strtoupper($stripeCustomer->currency ?? 'brl'),
                    'delinquent' => (bool) ($stripeCustomer->delinquent ?? false),
                    'email' => $stripeCustomer->email,
                    'name' => $stripeCustomer->name,
                    'phone' => $stripeCustomer->phone,
                    'created' => Carbon::createFromTimestamp($stripeCustomer->created)->format('d/m/Y H:i'),
                ];
            } catch (\Throwable $e) {
                Log::warning('Erro ao buscar dados do cliente no Stripe: ' . $e->getMessage(), ['customer_id' => $customer->uuid]);
            }

            try {
                // 2. Assinaturas do Stripe
                $subs = $stripe->subscriptions->all([
                    'customer' => $stripeId,
                    'limit' => 20,
                    'expand' => ['data.default_payment_method', 'data.latest_invoice'],
                ]);

                foreach ($subs->data as $sub) {
                    $item = $sub->items->data[0] ?? null;
                    $price = $item?->price;
                    $product = null;
                    if ($price && $price->product) {
                        try {
                            $product = is_string($price->product) ? $stripe->products->retrieve($price->product) : $price->product;
                        } catch (\Throwable) {
                        }
                    }

                    $stripeSubscriptions[] = [
                        'id' => $sub->id,
                        'status' => $sub->status,
                        'cancel_at_period_end' => (bool) $sub->cancel_at_period_end,
                        'canceled_at' => $sub->canceled_at ? Carbon::createFromTimestamp($sub->canceled_at)->format('d/m/Y H:i') : null,
                        'current_period_start' => $sub->current_period_start ? Carbon::createFromTimestamp($sub->current_period_start)->format('d/m/Y H:i') : null,
                        'current_period_end' => $sub->current_period_end ? Carbon::createFromTimestamp($sub->current_period_end)->format('d/m/Y H:i') : null,
                        'trial_start' => $sub->trial_start ? Carbon::createFromTimestamp($sub->trial_start)->format('d/m/Y H:i') : null,
                        'trial_end' => $sub->trial_end ? Carbon::createFromTimestamp($sub->trial_end)->format('d/m/Y H:i') : null,
                        'created_at' => Carbon::createFromTimestamp($sub->created)->format('d/m/Y H:i'),
                        'quantity' => $item?->quantity ?? 1,
                        'plan_name' => $product->name ?? ($price->nickname ?? 'Plano de Assinatura'),
                        'product_id' => is_string($price?->product) ? $price->product : ($price?->product?->id ?? null),
                        'price_id' => $price?->id,
                        'unit_amount' => $price?->unit_amount ? $price->unit_amount / 100 : 0,
                        'currency' => strtoupper($price?->currency ?? 'brl'),
                        'interval' => $price?->recurring?->interval ?? 'month',
                        'interval_count' => $price?->recurring?->interval_count ?? 1,
                        'latest_invoice_id' => is_string($sub->latest_invoice) ? $sub->latest_invoice : ($sub->latest_invoice?->id ?? null),
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('Erro ao buscar assinaturas do Stripe: ' . $e->getMessage(), ['customer_id' => $customer->uuid]);
            }

            try {
                // 3. Faturas (Invoices) do Stripe
                $rawInvoices = $customer->invoices(true, ['limit' => 30]);

                foreach ($rawInvoices as $inv) {
                    $stripeInvoice = $inv->asStripeInvoice();
                    $lines = [];
                    if (isset($stripeInvoice->lines->data)) {
                        foreach ($stripeInvoice->lines->data as $line) {
                            $lines[] = [
                                'id' => $line->id,
                                'description' => $line->description ?? 'Item da fatura',
                                'amount' => $line->amount ? $line->amount / 100 : 0,
                                'currency' => strtoupper($line->currency ?? 'brl'),
                                'quantity' => $line->quantity ?? 1,
                                'period_start' => isset($line->period->start) ? Carbon::createFromTimestamp($line->period->start)->format('d/m/Y') : null,
                                'period_end' => isset($line->period->end) ? Carbon::createFromTimestamp($line->period->end)->format('d/m/Y') : null,
                                'proration' => (bool) ($line->proration ?? false),
                            ];
                        }
                    }

                    $invoiceFormatted = [
                        'id' => $inv->id,
                        'number' => $inv->number ?? $inv->id,
                        'status' => $inv->status,
                        'currency' => strtoupper($inv->currency ?? 'brl'),
                        'total' => $inv->total(),
                        'raw_total' => $inv->rawTotal() / 100,
                        'subtotal' => $inv->subtotal(),
                        'raw_subtotal' => $inv->rawSubtotal() / 100,
                        'tax' => $inv->tax(),
                        'amount_due' => $stripeInvoice->amount_due ? $stripeInvoice->amount_due / 100 : 0,
                        'amount_paid' => $stripeInvoice->amount_paid ? $stripeInvoice->amount_paid / 100 : 0,
                        'amount_remaining' => $stripeInvoice->amount_remaining ? $stripeInvoice->amount_remaining / 100 : 0,
                        'date' => $inv->date()->format('d/m/Y H:i'),
                        'raw_date' => $inv->date()->toIso8601String(),
                        'period_start' => $stripeInvoice->period_start ? Carbon::createFromTimestamp($stripeInvoice->period_start)->format('d/m/Y') : null,
                        'period_end' => $stripeInvoice->period_end ? Carbon::createFromTimestamp($stripeInvoice->period_end)->format('d/m/Y') : null,
                        'hosted_invoice_url' => $stripeInvoice->hosted_invoice_url ?? null,
                        'invoice_pdf' => $stripeInvoice->invoice_pdf ?? null,
                        'subscription_id' => $stripeInvoice->subscription ?? null,
                        'is_paid' => $inv->isPaid(),
                        'lines' => $lines,
                    ];

                    $invoicesData[] = $invoiceFormatted;
                }

                // 4. Última fatura (Latest Invoice)
                $latestInv = $customer->latestInvoice(true);
                if ($latestInv) {
                    $stripeLatest = $latestInv->asStripeInvoice();
                    $latestInvoiceData = [
                        'id' => $latestInv->id,
                        'number' => $latestInv->number ?? $latestInv->id,
                        'status' => $latestInv->status,
                        'currency' => strtoupper($latestInv->currency ?? 'brl'),
                        'total' => $latestInv->total(),
                        'raw_total' => $latestInv->rawTotal() / 100,
                        'subtotal' => $latestInv->subtotal(),
                        'tax' => $latestInv->tax(),
                        'amount_due' => $stripeLatest->amount_due ? $stripeLatest->amount_due / 100 : 0,
                        'amount_paid' => $stripeLatest->amount_paid ? $stripeLatest->amount_paid / 100 : 0,
                        'date' => $latestInv->date()->format('d/m/Y H:i'),
                        'raw_date' => $latestInv->date()->toIso8601String(),
                        'hosted_invoice_url' => $stripeLatest->hosted_invoice_url ?? null,
                        'invoice_pdf' => $stripeLatest->invoice_pdf ?? null,
                        'is_paid' => $latestInv->isPaid(),
                    ];
                }

                // 5. Próxima fatura prevista (Upcoming Invoice)
                $upcomingInv = $customer->upcomingInvoice();
                if ($upcomingInv) {
                    $stripeUpcoming = $upcomingInv->asStripeInvoice();
                    $upcomingInvoiceData = [
                        'id' => $upcomingInv->id ?? 'upcoming',
                        'status' => 'upcoming',
                        'currency' => strtoupper($upcomingInv->currency ?? 'brl'),
                        'total' => $upcomingInv->total(),
                        'raw_total' => $upcomingInv->rawTotal() / 100,
                        'subtotal' => $upcomingInv->subtotal(),
                        'date' => $upcomingInv->date()->format('d/m/Y H:i'),
                        'next_payment_attempt' => $stripeUpcoming->next_payment_attempt ? Carbon::createFromTimestamp($stripeUpcoming->next_payment_attempt)->format('d/m/Y H:i') : null,
                        'lines_count' => count($stripeUpcoming->lines->data ?? []),
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('Erro ao buscar invoices/latest/upcoming do Stripe: ' . $e->getMessage(), ['customer_id' => $customer->uuid]);
            }
        }

        // 6. Produtos e preços disponíveis para assinar
        $availableProducts = Product::query()
            ->with(['prices' => function ($q) {
                $q->whereNull('deleted_at');
            }])
            ->whereNotNull('id_stripe')
            ->get();

        return Inertia::render('customers/show', [
            'customer' => $customer,
            'stripeCustomer' => $stripeCustomerData,
            'subscriptions' => $stripeSubscriptions,
            'localSubscriptions' => $customer->subscriptions,
            'invoices' => $invoicesData,
            'latestInvoice' => $latestInvoiceData,
            'upcomingInvoice' => $upcomingInvoiceData,
            'availableProducts' => $availableProducts,
            'stripeCountries' => StripCountrieType::toSelectSorted(),
        ]);
    }

    /**
     * Create a new subscription for the customer.
     */
    public function createSubscription(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'price_id' => ['required', 'string'],
            'type' => ['nullable', 'string'],
            'trial_days' => ['nullable', 'integer', 'min:0'],
        ]);

        $user = $customer->user;
        if (! $user) {
            return redirect()->back()->withErrors(['general' => 'Usuário associado ao cliente não encontrado.']);
        }

        $type = !empty($validated['type']) ? $validated['type'] : 'default';
        $priceId = $validated['price_id'];
        $trialDays = $validated['trial_days'] ?? null;

        try {
            if (! $user->hasStripeId()) {
                $user->createAsStripeCustomer([
                    'phone' => $customer->phone,
                    'name' => $user->name,
                    'email' => $user->email,
                ]);
                $customer->id_stripe = $user->stripe_id;
                $customer->saveQuietly();
            }

            $builder = $user->newSubscription($type, $priceId);

            if ($trialDays && $trialDays > 0) {
                $builder->trialDays((int) $trialDays);
            }

            $builder->create(null, [], [
                'metadata' => [
                    'customer_uuid' => $customer->uuid,
                    'customer_name' => $user->name,
                ],
            ]);

            return redirect()->back()->with('success', 'Assinatura criada com sucesso!');
        } catch (\Throwable $e) {
            Log::error('Erro ao criar assinatura para o cliente: ' . $e->getMessage(), [
                'customer_uuid' => $customer->uuid,
                'price_id' => $priceId,
            ]);

            return redirect()->back()->withErrors(['general' => 'Erro ao criar assinatura: ' . $e->getMessage()]);
        }
    }

    /**
     * Cancel customer subscription.
     */
    public function cancelSubscription(Request $request, Customer $customer, string $subscriptionId): RedirectResponse
    {
        $cancelNow = $request->boolean('cancel_now', false);

        try {
            // Busca local ou pelo Stripe ID
            $subscription = $customer->subscriptions()->where('stripe_id', $subscriptionId)->first();

            if ($subscription) {
                if ($cancelNow) {
                    $subscription->cancelNow();
                } else {
                    $subscription->cancel();
                }
            } else {
                // Cancelar direto via Stripe API se não estiver na tabela local
                $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
                if ($secret) {
                    $stripe = new StripeClient($secret);
                    if ($cancelNow) {
                        $stripe->subscriptions->cancel($subscriptionId);
                    } else {
                        $stripe->subscriptions->update($subscriptionId, [
                            'cancel_at_period_end' => true,
                        ]);
                    }
                }
            }

            $msg = $cancelNow ? 'Assinatura cancelada imediatamente.' : 'Assinatura configurada para cancelar ao final do período atual.';
            return redirect()->back()->with('success', $msg);
        } catch (\Throwable $e) {
            Log::error('Erro ao cancelar assinatura: ' . $e->getMessage(), ['subscription_id' => $subscriptionId]);
            return redirect()->back()->withErrors(['general' => 'Erro ao cancelar assinatura: ' . $e->getMessage()]);
        }
    }

    /**
     * Resume a canceled customer subscription within grace period.
     */
    public function resumeSubscription(Request $request, Customer $customer, string $subscriptionId): RedirectResponse
    {
        try {
            $subscription = $customer->subscriptions()->where('stripe_id', $subscriptionId)->first();

            if ($subscription && $subscription->onGracePeriod()) {
                $subscription->resume();
            } else {
                // Retomar via Stripe API
                $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
                if ($secret) {
                    $stripe = new StripeClient($secret);
                    $stripe->subscriptions->update($subscriptionId, [
                        'cancel_at_period_end' => false,
                    ]);
                }
            }

            return redirect()->back()->with('success', 'Assinatura retomada com sucesso!');
        } catch (\Throwable $e) {
            Log::error('Erro ao retomar assinatura: ' . $e->getMessage(), ['subscription_id' => $subscriptionId]);
            return redirect()->back()->withErrors(['general' => 'Erro ao retomar assinatura: ' . $e->getMessage()]);
        }
    }

    /**
     * Sync customer data with Stripe.
     */
    public function syncStripe(Customer $customer): RedirectResponse
    {
        try {
            if ($customer->user) {
                if (!$customer->user->hasStripeId()) {
                    $customer->user->createAsStripeCustomer([
                        'phone' => $customer->phone,
                        'name' => $customer->user->name,
                        'email' => $customer->user->email,
                    ]);
                } else {
                    $customer->user->syncStripeCustomerDetails();
                }

                $customer->id_stripe = $customer->user->stripe_id;
                $customer->saveQuietly();
            }

            return redirect()->back()->with('success', 'Dados do cliente sincronizados com o Stripe com sucesso!');
        } catch (\Throwable $e) {
            Log::error('Erro ao sincronizar com Stripe: ' . $e->getMessage(), ['customer_uuid' => $customer->uuid]);
            return redirect()->back()->withErrors(['general' => 'Erro ao sincronizar com Stripe: ' . $e->getMessage()]);
        }
    }

    /**
     * Download or redirect to invoice PDF.
     */
    public function downloadInvoice(Customer $customer, string $invoiceId)
    {
        try {
            if ($customer->user && $customer->user->hasStripeId()) {
                return $customer->user->downloadInvoice($invoiceId, [
                    'vendor' => config('app.name', 'Soberano AI'),
                    'product' => 'Assinatura',
                ]);
            }

            $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
            if ($secret) {
                $stripe = new StripeClient($secret);
                $invoice = $stripe->invoices->retrieve($invoiceId);
                if ($invoice->invoice_pdf) {
                    return redirect()->away($invoice->invoice_pdf);
                }
            }

            return redirect()->back()->withErrors(['general' => 'PDF da fatura não disponível.']);
        } catch (\Throwable $e) {
            Log::error('Erro ao baixar fatura: ' . $e->getMessage(), ['invoice_id' => $invoiceId]);
            return redirect()->back()->withErrors(['general' => 'Erro ao baixar fatura: ' . $e->getMessage()]);
        }
    }
}
