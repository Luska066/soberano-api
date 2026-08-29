<?php

namespace App\Http\Controllers;

use App\Models\Price;
use App\Models\Product;
use App\Models\ProductBenefit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\StripeClient;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $query = Product::query()
            ->with([
                'benefits',
                'prices' => function ($q) {
                    $q->withTrashed();
                },
            ])
            ->latest();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('id_stripe', 'like', "%{$search}%")
                    ->orWhere('default_price', 'like', "%{$search}%")
                    ->orWhereHas('benefits', function ($bq) use ($search) {
                        $bq->where('name', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    })
                    ->orWhereHas('prices', function ($pq) use ($search) {
                        $pq->withTrashed()
                            ->where(function ($sq) use ($search) {
                                $sq->where('id_stripe', 'like', "%{$search}%")
                                    ->orWhere('currency', 'like', "%{$search}%")
                                    ->orWhere('interval', 'like', "%{$search}%")
                                    ->orWhere('unit_amount', 'like', "%{$search}%");
                            });
                    });
            });
        }

        $products = $query->paginate(10)->withQueryString();

        // Calculate metrics
        $totalProducts = Product::count();
        $productsWithBenefits = Product::has('benefits')->count();
        $syncedWithStripe = Product::whereNotNull('id_stripe')->count();
        $totalPrices = Price::withTrashed()->count();
        $newThisMonth = Product::where('created_at', '>=', now()->startOfMonth())->count();

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
            ],
            'metrics' => [
                'total' => $totalProducts,
                'with_benefits' => $productsWithBenefits,
                'synced_stripe' => $syncedWithStripe,
                'total_prices' => $totalPrices,
                'new_this_month' => $newThisMonth,
            ],
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'string', 'max:1000'],
            'default_price' => ['nullable', 'string', 'max:255'],
            'benefits' => ['nullable', 'array'],
            'benefits.*.name' => ['required', 'string', 'max:255'],
            'benefits.*.description' => ['nullable', 'string', 'max:1000'],
        ], [
            'name.required' => 'O nome do produto é obrigatório.',
            'name.max' => 'O nome do produto não pode ter mais de 255 caracteres.',
            'description.max' => 'A descrição não pode ter mais de 2000 caracteres.',
            'image.max' => 'O link da imagem não pode ter mais de 1000 caracteres.',
            'benefits.*.name.required' => 'O título do benefício é obrigatório.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        DB::beginTransaction();
        try {
            $stripeSecret = config('cashier.secret') ?: config('services.stripe.secret') ?: env('STRIPE_SECRET');
            $stripeId = null;
            $stripeData = [];

            if (!empty($stripeSecret)) {
                try {
                    $stripe = new StripeClient($stripeSecret);
                    $payload = [
                        'name' => $validated['name'],
                    ];
                    if (!empty($validated['description'])) {
                        $payload['description'] = $validated['description'];
                    }
                    if (!empty($validated['image'])) {
                        $payload['images'] = [$validated['image']];
                    }

                    $stripeProduct = $stripe->products->create($payload);
                    $stripeId = $stripeProduct->id;
                    $stripeData = $stripeProduct->toArray();
                } catch (\Throwable $e) {
                    Log::channel('stripe')->warning('Could not create Stripe product: ' . $e->getMessage());
                }
            }

            if (empty($stripeId)) {
                $stripeId = 'prod_' . Str::lower(Str::random(14));
            }

            $product = Product::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'image' => $validated['image'] ?? null,
                'default_price' => $validated['default_price'] ?? null,
                'id_stripe' => $stripeId,
                'data' => !empty($stripeData) ? $stripeData : ['created_locally' => true],
            ]);

            if (!empty($validated['benefits']) && is_array($validated['benefits'])) {
                foreach ($validated['benefits'] as $benefit) {
                    if (!empty(trim($benefit['name'] ?? ''))) {
                        ProductBenefit::create([
                            'product_id' => $product->uuid,
                            'name' => trim($benefit['name']),
                            'description' => !empty($benefit['description']) ? trim($benefit['description']) : null,
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'Produto cadastrado com sucesso!');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao cadastrar o produto: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'string', 'max:1000'],
            'default_price' => ['nullable', 'string', 'max:255'],
            'benefits' => ['nullable', 'array'],
            'benefits.*.name' => ['required', 'string', 'max:255'],
            'benefits.*.description' => ['nullable', 'string', 'max:1000'],
        ], [
            'name.required' => 'O nome do produto é obrigatório.',
            'name.max' => 'O nome do produto não pode ter mais de 255 caracteres.',
            'description.max' => 'A descrição não pode ter mais de 2000 caracteres.',
            'image.max' => 'O link da imagem não pode ter mais de 1000 caracteres.',
            'benefits.*.name.required' => 'O título do benefício é obrigatório.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();

        DB::beginTransaction();
        try {
            $stripeSecret = config('cashier.secret') ?: config('services.stripe.secret') ?: env('STRIPE_SECRET');

            if (!empty($stripeSecret) && !empty($product->id_stripe) && Str::startsWith($product->id_stripe, 'prod_')) {
                try {
                    $stripe = new StripeClient($stripeSecret);
                    $payload = [
                        'name' => $validated['name'],
                    ];
                    if (!empty($validated['description'])) {
                        $payload['description'] = $validated['description'];
                    }
                    if (!empty($validated['image'])) {
                        $payload['images'] = [$validated['image']];
                    }

                    $stripeProduct = $stripe->products->update($product->id_stripe, $payload);
                    $product->data = $stripeProduct->toArray();
                } catch (\Throwable $e) {
                    Log::channel('stripe')->warning('Could not update Stripe product: ' . $e->getMessage());
                }
            }

            $product->name = $validated['name'];
            $product->description = $validated['description'] ?? null;
            $product->image = $validated['image'] ?? null;
            $product->default_price = $validated['default_price'] ?? null;
            $product->save();

            // Re-sync benefits
            $product->benefits()->delete();

            if (!empty($validated['benefits']) && is_array($validated['benefits'])) {
                foreach ($validated['benefits'] as $benefit) {
                    if (!empty(trim($benefit['name'] ?? ''))) {
                        ProductBenefit::create([
                            'product_id' => $product->uuid,
                            'name' => trim($benefit['name']),
                            'description' => !empty($benefit['description']) ? trim($benefit['description']) : null,
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'Produto atualizado com sucesso!');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao atualizar o produto: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $stripeSecret = config('cashier.secret') ?: config('services.stripe.secret') ?: env('STRIPE_SECRET');

            if (!empty($stripeSecret) && !empty($product->id_stripe) && Str::startsWith($product->id_stripe, 'prod_')) {
                try {
                    $stripe = new StripeClient($stripeSecret);
                    $stripe->products->update($product->id_stripe, ['active' => false]);
                } catch (\Throwable $e) {
                    Log::channel('stripe')->warning('Could not deactivate Stripe product: ' . $e->getMessage());
                }
            }

            $product->benefits()->delete();
            $product->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Produto excluído com sucesso!');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['general' => 'Ocorreu um erro ao excluir o produto: ' . $e->getMessage()]);
        }
    }

    /**
     * Store a new price for the product.
     */
    public function storePrice(Request $request, Product $product): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'unit_amount' => ['required', 'numeric', 'min:0.5'],
            'currency' => ['required', 'string', 'size:3'],
            'type' => ['required', 'string', 'in:recurring,one_time'],
            'interval' => ['required_if:type,recurring', 'nullable', 'string', 'in:month,year,week,day'],
            'trial_period_days' => ['nullable', 'integer', 'min:0', 'max:365'],
        ], [
            'unit_amount.required' => 'O valor do preço é obrigatório.',
            'unit_amount.min' => 'O valor mínimo é R$ 0,50.',
            'currency.required' => 'A moeda é obrigatória.',
            'interval.required_if' => 'O intervalo de recorrência é obrigatório para preços recorrentes.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();
        DB::beginTransaction();
        try {
            $stripeSecret = config('cashier.secret') ?: config('services.stripe.secret') ?: env('STRIPE_SECRET');
            $stripePriceId = null;
            $stripePriceData = [];
            $unitAmountCents = (int) round(((float) $validated['unit_amount']) * 100);

            if (!empty($stripeSecret) && !empty($product->id_stripe) && Str::startsWith($product->id_stripe, 'prod_')) {
                try {
                    $stripe = new StripeClient($stripeSecret);
                    $payload = [
                        'product' => $product->id_stripe,
                        'currency' => strtolower($validated['currency']),
                        'unit_amount' => $unitAmountCents,
                    ];

                    if ($validated['type'] === 'recurring') {
                        $payload['recurring'] = [
                            'interval' => $validated['interval'],
                        ];
                        if (!empty($validated['trial_period_days'])) {
                            $payload['recurring']['trial_period_days'] = (int) $validated['trial_period_days'];
                        }
                    }

                    $stripePrice = $stripe->prices->create($payload);
                    $stripePriceId = $stripePrice->id;
                    $stripePriceData = $stripePrice->toArray();
                } catch (\Throwable $e) {
                    Log::channel('stripe')->warning('Could not create Stripe price: ' . $e->getMessage());
                }
            }

            if (empty($stripePriceId)) {
                $stripePriceId = 'price_' . Str::lower(Str::random(14));
            }

            Price::create([
                'id_stripe' => $stripePriceId,
                'product_id' => $product->id_stripe,
                'currency' => strtolower($validated['currency']),
                'unit_amount' => (string) $unitAmountCents,
                'interval' => $validated['interval'] ?? 'month',
                'trial_period_days' => !empty($validated['trial_period_days']) ? (string) $validated['trial_period_days'] : null,
                'type' => $validated['type'],
                'data' => !empty($stripePriceData) ? $stripePriceData : ['active' => true, 'created_locally' => true],
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Plano de preço cadastrado com sucesso!');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['general' => 'Ocorreu um erro ao criar o preço: ' . $e->getMessage()]);
        }
    }

    /**
     * Toggle price active / inactive status in Stripe and locally.
     */
    public function togglePriceActive(string|Price $price): RedirectResponse
    {
        if (!($price instanceof Price)) {
            $price = Price::withTrashed()
                ->where('uuid', $price)
                ->orWhere('id_stripe', $price)
                ->firstOrFail();
        }

        DB::beginTransaction();
        try {
            $newActive = !$price->active;
            $stripeSecret = config('cashier.secret') ?: config('services.stripe.secret') ?: env('STRIPE_SECRET');

            if (!empty($stripeSecret) && !empty($price->id_stripe) && Str::startsWith($price->id_stripe, 'price_')) {
                try {
                    $stripe = new StripeClient($stripeSecret);
                    $stripe->prices->update($price->id_stripe, [
                        'active' => $newActive,
                    ]);
                } catch (\Throwable $e) {
                    Log::channel('stripe')->warning('Could not toggle Stripe price status: ' . $e->getMessage());
                }
            }

            $data = $price->data ?? [];
            $data['active'] = $newActive;
            $price->data = $data;
            $price->deleted_at = $newActive ? null : now();
            $price->save();

            DB::commit();

            $statusText = $newActive ? 'ativado' : 'desativado';
            return redirect()->back()->with('success', "Plano de preço {$statusText} com sucesso!");
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['general' => 'Ocorreu um erro ao alterar o status do preço: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete / deactivate a price.
     */
    public function destroyPrice(string|Price $price): RedirectResponse
    {
        if (!($price instanceof Price)) {
            $price = Price::withTrashed()
                ->where('uuid', $price)
                ->orWhere('id_stripe', $price)
                ->firstOrFail();
        }

        DB::beginTransaction();
        try {
            $stripeSecret = config('cashier.secret') ?: config('services.stripe.secret') ?: env('STRIPE_SECRET');

            if (!empty($stripeSecret) && !empty($price->id_stripe) && Str::startsWith($price->id_stripe, 'price_')) {
                try {
                    $stripe = new StripeClient($stripeSecret);
                    $stripe->prices->update($price->id_stripe, [
                        'active' => false,
                    ]);
                } catch (\Throwable $e) {
                    Log::channel('stripe')->warning('Could not deactivate Stripe price: ' . $e->getMessage());
                }
            }

            $data = $price->data ?? [];
            $data['active'] = false;
            $price->data = $data;
            $price->deleted_at = now();
            $price->save();

            DB::commit();

            return redirect()->back()->with('success', 'Plano de preço desativado com sucesso!');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['general' => 'Ocorreu um erro ao excluir o preço: ' . $e->getMessage()]);
        }
    }
}
