<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\StripeClient;

class SubscriptionController extends Controller
{
    /**
     * Display customer subscription & invoice overview.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            // Se o customer ainda não existir, cria ou busca
            throw new Exception('Customer not found');
        }

        // Sincroniza id_stripe se estiver nulo mas existir no user
        if (empty($customer->id_stripe) && $user->stripe_id) {
            $customer->id_stripe = $user->stripe_id;
            $customer->saveQuietly();
        }

        $stripeCustomerData = null;
        $stripeSubscriptions = [];
        $invoicesData = [];
        $latestInvoiceData = null;
        $upcomingInvoiceData = null;

        $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
        $stripe = $secret ? new StripeClient($secret) : null;
        $stripeId = $customer->stripe_id ?? $user->stripe_id;

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
                Log::warning('Erro ao buscar dados do cliente no Stripe: ' . $e->getMessage(), ['user_id' => $user->id]);
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

                    $startTs = $sub->current_period_start
                        ?? ($item?->current_period_start ?? null)
                        ?? ($sub->billing_cycle_anchor ?? null)
                        ?? ($sub->start_date ?? null)
                        ?? ($sub->created ?? null);

                    $endTs = $sub->current_period_end
                        ?? ($item?->current_period_end ?? null)
                        ?? ($startTs ? Carbon::createFromTimestamp($startTs)->addMonth()->timestamp : null);

                    $stripeSubscriptions[] = [
                        'id' => $sub->id,
                        'status' => $sub->status,
                        'cancel_at_period_end' => (bool) $sub->cancel_at_period_end,
                        'canceled_at' => $sub->canceled_at ? Carbon::createFromTimestamp($sub->canceled_at)->format('d/m/Y H:i') : null,
                        'current_period_start' => $startTs ? Carbon::createFromTimestamp($startTs)->format('d/m/Y') : null,
                        'current_period_end' => $endTs ? Carbon::createFromTimestamp($endTs)->format('d/m/Y') : null,
                        'trial_start' => $sub->trial_start ? Carbon::createFromTimestamp($sub->trial_start)->format('d/m/Y') : null,
                        'trial_end' => $sub->trial_end ? Carbon::createFromTimestamp($sub->trial_end)->format('d/m/Y') : null,
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
                Log::warning('Erro ao buscar assinaturas do Stripe: ' . $e->getMessage(), ['user_id' => $user->id]);
            }
        }

        // Se não encontrou pelo Stripe Customer, busca pelas assinaturas salvas localmente
        if (empty($stripeSubscriptions) && $user->subscriptions()->exists()) {
            foreach ($user->subscriptions as $localSub) {
                $subObj = null;
                if ($stripe && $localSub->stripe_id) {
                    try {
                        $subObj = $stripe->subscriptions->retrieve($localSub->stripe_id, [
                            'expand' => ['default_payment_method', 'latest_invoice'],
                        ]);
                    } catch (\Throwable $e) {
                        Log::warning('Erro ao buscar subscription local no Stripe: ' . $e->getMessage());
                    }
                }

                $price = null;
                $product = null;
                if ($subObj) {
                    $item = $subObj->items->data[0] ?? null;
                    $price = $item?->price;
                    if ($price && $price->product) {
                        try {
                            $product = is_string($price->product) ? $stripe->products->retrieve($price->product) : $price->product;
                        } catch (\Throwable) {
                        }
                    }

                    $startTs = $subObj->current_period_start
                        ?? ($item?->current_period_start ?? null)
                        ?? ($subObj->billing_cycle_anchor ?? null)
                        ?? ($subObj->start_date ?? null)
                        ?? ($subObj->created ?? null);

                    $endTs = $subObj->current_period_end
                        ?? ($item?->current_period_end ?? null)
                        ?? ($startTs ? Carbon::createFromTimestamp($startTs)->addMonth()->timestamp : null);

                    $currentPeriodStart = $startTs ? Carbon::createFromTimestamp($startTs)->format('d/m/Y') : null;
                    $currentPeriodEnd = $endTs ? Carbon::createFromTimestamp($endTs)->format('d/m/Y') : null;
                } else {
                    $currentPeriodStart = $localSub->created_at ? $localSub->created_at->format('d/m/Y') : now()->format('d/m/Y');
                    $currentPeriodEnd = $localSub->ends_at ? $localSub->ends_at->format('d/m/Y') : ($localSub->created_at ? $localSub->created_at->addMonth()->format('d/m/Y') : now()->addMonth()->format('d/m/Y'));
                }

                $localPrice = $localSub->stripe_price ? \App\Models\Price::where('id_stripe', $localSub->stripe_price)->with('product')->first() : null;

                $stripeSubscriptions[] = [
                    'id' => $localSub->stripe_id,
                    'status' => $subObj->status ?? $localSub->stripe_status ?? 'active',
                    'cancel_at_period_end' => (bool) ($subObj->cancel_at_period_end ?? ($localSub->ends_at !== null)),
                    'canceled_at' => ($subObj->canceled_at ?? null) ? Carbon::createFromTimestamp($subObj->canceled_at)->format('d/m/Y H:i') : null,
                    'current_period_start' => $currentPeriodStart,
                    'current_period_end' => $currentPeriodEnd,
                    'trial_start' => ($subObj->trial_start ?? null) ? Carbon::createFromTimestamp($subObj->trial_start)->format('d/m/Y') : null,
                    'trial_end' => $localSub->trial_ends_at ? $localSub->trial_ends_at->format('d/m/Y') : null,
                    'created_at' => $localSub->created_at ? $localSub->created_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i'),
                    'quantity' => $localSub->quantity ?? 1,
                    'plan_name' => $product->name ?? ($localPrice?->product?->name ?? 'Plano de Assinatura'),
                    'product_id' => $localPrice?->product_id ?? null,
                    'price_id' => $localSub->stripe_price,
                    'unit_amount' => $localPrice ? $localPrice->unit_amount / 100 : ($price?->unit_amount ? $price->unit_amount / 100 : 0),
                    'currency' => strtoupper($localPrice->currency ?? ($price?->currency ?? 'brl')),
                    'interval' => $localPrice->interval ?? ($price?->recurring?->interval ?? 'month'),
                    'interval_count' => $price?->recurring?->interval_count ?? 1,
                    'latest_invoice_id' => is_string($subObj?->latest_invoice ?? null) ? $subObj->latest_invoice : ($subObj?->latest_invoice?->id ?? null),
                ];
            }
        }

        if ($stripe && $stripeId) {

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

                    $invoicesData[] = [
                        'id' => $inv->id,
                        'number' => $inv->number ?? $inv->id,
                        'status' => $inv->status,
                        'currency' => strtoupper($inv->currency ?? 'brl'),
                        'total' => $inv->total(),
                        'raw_total' => $inv->rawTotal() / 100,
                        'subtotal' => $inv->subtotal(),
                        'raw_subtotal' => $stripeInvoice->subtotal ? $stripeInvoice->subtotal / 100 : 0,
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
                Log::warning('Erro ao buscar invoices do Stripe: ' . $e->getMessage(), ['user_id' => $user->id]);
            }
        }

        // 6. Produtos e preços disponíveis para assinar/trocar
        $availableProducts = Product::query()
            ->with(['prices' => function ($q) {
                $q->whereNull('deleted_at');
            }])
            ->whereNotNull('id_stripe')
            ->get();

        return Inertia::render('customer/subscription/index', [
            'customer' => $customer,
            'stripeCustomer' => $stripeCustomerData,
            'subscriptions' => $stripeSubscriptions,
            'localSubscriptions' => $customer->subscriptions,
            'invoices' => $invoicesData,
            'latestInvoice' => $latestInvoiceData,
            'upcomingInvoice' => $upcomingInvoiceData,
            'availableProducts' => $availableProducts,
        ]);
    }

    /**
     * Swap/change customer subscription plan.
     */
    public function swap(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subscription_id' => ['required', 'string'],
            'price_id' => ['required', 'string'],
        ]);

        $user = $request->user();
        $customer = $user->customer;
        $subscriptionId = $validated['subscription_id'];
        $newPriceId = $validated['price_id'];

        try {
            $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
            $stripe = $secret ? new StripeClient($secret) : null;

            // 1. Atualiza no Stripe
            if ($stripe) {
                $stripeSub = $stripe->subscriptions->retrieve($subscriptionId);

                // Segurança: verifica se a assinatura pertence a este cliente
                if ($stripeSub->customer !== $user->stripe_id) {
                    return redirect()->back()->withErrors(['general' => 'Assinatura não pertence ao seu usuário.']);
                }

                $itemId = $stripeSub->items->data[0]->id ?? null;

                if ($itemId) {
                    $stripe->subscriptions->update($subscriptionId, [
                        'items' => [
                            [
                                'id' => $itemId,
                                'price' => $newPriceId,
                            ],
                        ],
                        'proration_behavior' => 'create_prorations',
                        'cancel_at_period_end' => false,
                    ]);
                }
            }

            // 2. Atualiza no banco de dados local
            $subscription = $user->subscriptions()->where('subscriptions.stripe_id', $subscriptionId)->first();
            if ($subscription) {
                $subscription->stripe_price = $newPriceId;
                $subscription->ends_at = null;
                $subscription->stripe_status = 'active';
                $subscription->save();

                $item = $subscription->items()->first();
                if ($item) {
                    $item->stripe_price = $newPriceId;
                    $item->save();
                }
            }

            return redirect()->back()->with('success', 'Seu plano foi alterado com sucesso!');
        } catch (\Throwable $e) {
            Log::error('Erro ao trocar plano da assinatura pelo cliente: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'subscription_id' => $subscriptionId,
                'price_id' => $newPriceId,
            ]);

            return redirect()->back()->withErrors(['general' => 'Erro ao trocar plano: ' . $e->getMessage()]);
        }
    }

    /**
     * Cancel customer subscription.
     */
    public function cancel(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subscription_id' => ['required', 'string'],
        ]);

        $user = $request->user();
        $customer = $user->customer;
        $subscriptionId = $validated['subscription_id'];

        try {
            $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
            $stripe = $secret ? new StripeClient($secret) : null;

            // 1. Atualiza no Stripe
            $stripeSub = null;
            if ($stripe) {
                $checkSub = $stripe->subscriptions->retrieve($subscriptionId);
                if ($checkSub->customer !== $user->stripe_id) {
                    return redirect()->back()->withErrors(['general' => 'Assinatura não pertence ao seu usuário.']);
                }

                $stripeSub = $stripe->subscriptions->update($subscriptionId, [
                    'cancel_at_period_end' => true,
                ]);
            }

            // 2. Atualiza no banco local
            $subscription = $user->subscriptions()->where('subscriptions.stripe_id', $subscriptionId)->first();
            if ($subscription) {
                $subscription->ends_at = isset($stripeSub->current_period_end)
                    ? Carbon::createFromTimestamp($stripeSub->current_period_end)
                    : ($subscription->ends_at ?? now());
                $subscription->stripe_status = $stripeSub->status ?? $subscription->stripe_status;
                $subscription->save();
            }

            return redirect()->back()->with('success', 'Sua assinatura foi cancelada e permanecerá ativa até o final do período vigente.');
        } catch (\Throwable $e) {
            Log::error('Erro ao cancelar assinatura pelo cliente: ' . $e->getMessage(), ['user_id' => $user->id]);
            return redirect()->back()->withErrors(['general' => 'Erro ao cancelar assinatura: ' . $e->getMessage()]);
        }
    }

    /**
     * Resume customer subscription.
     */
    public function resume(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subscription_id' => ['required', 'string'],
        ]);

        $user = $request->user();
        $customer = $user->customer;
        $subscriptionId = $validated['subscription_id'];

        try {
            $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
            $stripe = $secret ? new StripeClient($secret) : null;

            // 1. Atualiza no Stripe
            $stripeSub = null;
            if ($stripe) {
                $checkSub = $stripe->subscriptions->retrieve($subscriptionId);
                if ($checkSub->customer !== $user->stripe_id) {
                    return redirect()->back()->withErrors(['general' => 'Assinatura não pertence ao seu usuário.']);
                }

                $stripeSub = $stripe->subscriptions->update($subscriptionId, [
                    'cancel_at_period_end' => false,
                ]);
            }

            // 2. Atualiza no banco local
            $subscription = $user->subscriptions()->where('subscriptions.stripe_id', $subscriptionId)->first();
            if ($subscription) {
                $subscription->ends_at = null;
                $subscription->stripe_status = $stripeSub->status ?? 'active';
                $subscription->save();
            }

            return redirect()->back()->with('success', 'Sua assinatura foi retomada com sucesso!');
        } catch (\Throwable $e) {
            Log::error('Erro ao retomar assinatura pelo cliente: ' . $e->getMessage(), ['user_id' => $user->id]);
            return redirect()->back()->withErrors(['general' => 'Erro ao retomar assinatura: ' . $e->getMessage()]);
        }
    }

    /**
     * Download or redirect to invoice PDF for customer.
     */
    public function downloadInvoice(Request $request, string $invoiceId)
    {
        $user = $request->user();

        try {
            if ($user && $user->hasStripeId()) {
                // Garante que a fatura pertence a este usuário
                $invoice = $user->findInvoice($invoiceId);
                if ($invoice) {
                    return $user->downloadInvoice($invoiceId, [
                        'vendor' => config('app.name', 'Soberano AI'),
                        'product' => 'Assinatura',
                    ]);
                }
            }

            $secret = config('cashier.secret') ?? env('STRIPE_SECRET');
            if ($secret) {
                $stripe = new StripeClient($secret);
                $stripeInvoice = $stripe->invoices->retrieve($invoiceId);

                if ($stripeInvoice->customer !== $user->stripe_id) {
                    return redirect()->back()->withErrors(['general' => 'Fatura não pertence à sua conta.']);
                }

                if ($stripeInvoice->invoice_pdf) {
                    return redirect()->away($stripeInvoice->invoice_pdf);
                }
            }

            return redirect()->back()->withErrors(['general' => 'PDF da fatura não disponível no momento.']);
        } catch (\Throwable $e) {
            Log::error('Erro ao baixar fatura pelo cliente: ' . $e->getMessage(), ['invoice_id' => $invoiceId, 'user_id' => $user->id]);
            return redirect()->back()->withErrors(['general' => 'Erro ao baixar fatura: ' . $e->getMessage()]);
        }
    }
}
