# Guia Completo: Gerenciamento de Assinaturas (Planos) e Invoices com Laravel Cashier (Stripe)

Este documento apresenta as melhores práticas e a implementação recomendada para controlar **planos/assinaturas** e listar/baixar **invoices (faturas)** vinculadas ao cliente no Laravel Cashier.

---

## 1. Arquitetura e Contexto do Projeto

No projeto, o trait `Laravel\Cashier\Billable` está na model [User](file:///x:/soberano-ai/app/Models/User.php), e a model [Customer](file:///x:/soberano-ai/app/Models/Customer.php) possui uma relação de 1 para 1 (`belongsTo`) com `User` através do campo `id_user`.

```text
[Customer] ---> belongsTo ---> [User (Billable)] ---> Stripe Customer (id_stripe)
                                      |
                     +----------------+----------------+
                     |                                 |
           [Subscription / Planos]              [Invoices / Faturas]
          (tabela `subscriptions` &           (via Stripe API em tempo real
         `subscription_items` locais)             ou Webhooks)
```

---

## 2. Enriquecendo a Model `Customer` com Helpers

Para facilitar o acesso às assinaturas e faturas diretamente a partir do objeto `$customer`, podemos adicionar métodos delegados na model [Customer](file:///x:/soberano-ai/app/Models/Customer.php):

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Laravel\Cashier\Subscription;
use Illuminate\Support\Collection;

class Customer extends Model
{
    // ... relações e configurações existentes ...

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    /**
     * Relação direta com as assinaturas salvas localmente via User.
     */
    public function subscriptions(): HasManyThrough
    {
        return $this->hasManyThrough(
            Subscription::class,
            User::class,
            'id',          // Chave local em users (id)
            'user_id',     // Chave estrangeira em subscriptions (user_id)
            'id_user',     // Chave local em customer (id_user)
            'id'           // Chave local em users (id)
        );
    }

    /**
     * Verifica se o cliente possui uma assinatura ativa para um tipo específico.
     */
    public function subscribed(string $type = 'default', ?string $price = null): bool
    {
        return $this->user?->subscribed($type, $price) ?? false;
    }

    /**
     * Retorna a assinatura ativa do tipo especificado.
     */
    public function subscription(string $type = 'default'): ?Subscription
    {
        return $this->user?->subscription($type);
    }

    /**
     * Busca a lista de faturas (invoices) direto do Stripe.
     * 
     * @return Collection<\Laravel\Cashier\Invoice>
     */
    public function invoices(bool $includePending = false, array $parameters = []): Collection
    {
        if (! $this->user || ! $this->user->hasStripeId()) {
            return collect();
        }

        return $includePending 
            ? $this->user->invoicesIncludingPending($parameters)
            : $this->user->invoices($parameters);
    }

    /**
     * Busca a próxima fatura prevista (Upcoming Invoice).
     */
    public function upcomingInvoice(array $parameters = [])
    {
        return $this->user?->upcomingInvoice($parameters);
    }
}
```

---

## 3. Gestão de Planos e Assinaturas (Subscriptions)

### 3.1 Criando uma Assinatura

#### Opção A: Redirecionando para o Stripe Checkout (Recomendado)
```php
public function checkout(Request $request, Customer $customer)
{
    $priceId = $request->input('price_id'); // Ex: 'price_1N...'

    return $customer->user
        ->newSubscription('default', $priceId)
        ->allowPromotionCodes()
        ->checkout([
            'success_url' => route('customers.subscription.success', $customer->uuid) . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('customers.show', $customer->uuid),
        ]);
}
```

#### Opção B: Cobrança Direta com PaymentMethod (Via Cartão já salvo)
```php
public function createDirect(Request $request, Customer $customer)
{
    $paymentMethodId = $request->input('payment_method'); // Ex: 'pm_1N...'
    $priceId = $request->input('price_id');

    $subscription = $customer->user
        ->newSubscription('default', $priceId)
        ->create($paymentMethodId);

    return redirect()->back()->with('success', 'Assinatura criada com sucesso!');
}
```

---

### 3.2 Consultando o Status da Assinatura

O Laravel Cashier provê diversos métodos auxiliares no objeto `$subscription`:

```php
$subscription = $customer->subscription('default');

if ($subscription) {
    $subscription->valid();           // Assinatura ativa ou em período de carência
    $subscription->active();          // Ativa (pagamentos em dia ou trial)
    $subscription->onTrial();         // Em período de testes
    $subscription->canceled();        // Foi cancelada pelo usuário
    $subscription->onGracePeriod();   // Cancelada, mas ainda no período pago restante
    $subscription->ended();           // Finalizada totalmente
    $subscription->pastDue();         // Pagamento falhou e está em atraso
    $subscription->incomplete();      // Requer ação do cliente (ex: 3D Secure)
}
```

---

### 3.3 Alterando / Fazendo Upgrade de Plano (Swap)

```php
public function changePlan(Request $request, Customer $customer)
{
    $newPriceId = $request->input('new_price_id');
    
    // Troca o plano e calcula proporcionalidade (proration padrão do Stripe):
    $customer->subscription('default')->swap($newPriceId);

    // OU se quiser faturar a diferença imediatamente:
    // $customer->subscription('default')->swapAndInvoice($newPriceId);

    return redirect()->back()->with('success', 'Plano atualizado com sucesso!');
}
```

---

### 3.4 Cancelamento e Reativação

```php
// Cancelar no final do período de cobrança (mantém acesso até a data final)
$customer->subscription('default')->cancel();

// Cancelar IMEDIATAMENTE (corta o acesso na hora)
$customer->subscription('default')->cancelNow();

// Reativar assinatura (caso esteja no período de carência / grace period)
if ($customer->subscription('default')->onGracePeriod()) {
    $customer->subscription('default')->resume();
}
```

---

## 4. Consultando e Baixando Invoices (Faturas)

O Cashier se conecta diretamente à API do Stripe para obter as faturas do cliente com todas as informações de impostos, status, PDF e moeda formatada.

### 4.1 Listando Invoices em um Controller / API

```php
namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerBillingController extends Controller
{
    public function show(Customer $customer): Response
    {
        $user = $customer->user;
        
        // 1. Obter assinaturas locais com itens
        $subscriptions = $user ? $user->subscriptions()->with('items')->get() : collect();

        // 2. Obter faturas da Stripe formatadas para o Frontend
        $invoices = [];
        $upcomingInvoice = null;

        if ($user && $user->hasStripeId()) {
            try {
                $invoices = $user->invoicesIncludingPending()->map(function ($invoice) {
                    return [
                        'id' => $invoice->id,
                        'number' => $invoice->number,
                        'date' => $invoice->date()->toISOString(),
                        'total' => $invoice->total(), // Já formatado com símbolo de moeda: ex: "R$ 99,00" ou "$99.00"
                        'raw_total' => $invoice->rawTotal(),
                        'currency' => $invoice->currency,
                        'status' => $invoice->status, // paid, open, void, uncollectible, draft
                        'paid' => $invoice->paid,
                        'hosted_invoice_url' => $invoice->hosted_invoice_url,
                        'invoice_pdf' => $invoice->invoice_pdf,
                        'period_start' => $invoice->period_start,
                        'period_end' => $invoice->period_end,
                    ];
                })->values()->all();

                // Próxima fatura prevista
                $upcoming = $user->upcomingInvoice();
                if ($upcoming) {
                    $upcomingInvoice = [
                        'total' => $upcoming->total(),
                        'date' => $upcoming->date()->toISOString(),
                    ];
                }
            } catch (\Exception $e) {
                // Log da exceção caso o customer não exista na Stripe
                logger()->error('Erro ao buscar faturas do Stripe: ' . $e->getMessage());
            }
        }

        return Inertia::render('customers/billing', [
            'customer' => $customer->load('user'),
            'subscriptions' => $subscriptions,
            'invoices' => $invoices,
            'upcomingInvoice' => $upcomingInvoice,
        ]);
    }

    /**
     * Download do PDF oficial da fatura gerado pelo Cashier.
     */
    public function downloadInvoice(Request $request, Customer $customer, string $invoiceId)
    {
        return $customer->user->downloadInvoice($invoiceId, [
            'vendor' => config('app.name', 'Soberano AI'),
            'product' => 'Assinatura',
        ]);
    }
}
```

---

## 5. Rotas Sugeridas (`routes/web.php`)

```php
use App\Http\Controllers\CustomerBillingController;

Route::middleware(['auth'])->group(function () {
    Route::get('/customers/{customer}/billing', [CustomerBillingController::class, 'show'])->name('customers.billing');
    Route::post('/customers/{customer}/subscribe', [CustomerBillingController::class, 'subscribe'])->name('customers.subscribe');
    Route::post('/customers/{customer}/cancel-subscription', [CustomerBillingController::class, 'cancelSubscription'])->name('customers.subscription.cancel');
    Route::post('/customers/{customer}/resume-subscription', [CustomerBillingController::class, 'resumeSubscription'])->name('customers.subscription.resume');
    Route::get('/customers/{customer}/invoices/{invoice}/download', [CustomerBillingController::class, 'downloadInvoice'])->name('customers.invoices.download');
});
```

---

## 6. Webhooks Obrigatórios do Stripe

Para manter o banco de dados sincronizado quando pagamentos ocorrerem ou assinaturas forem renovadas/canceladas no Stripe:

Execute o comando para escutar webhooks localmente no Stripe CLI:
```bash
stripe listen --forward-to localhost:8000/stripe/webhook
```

No arquivo `.env`:
```env
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CASHIER_MODEL=App\Models\User
```

Eventos automáticos tratados nativamente pelo Cashier:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

---

## 7. Resumo Rápido de Métodos Úteis

| Objetivo | Código |
| :--- | :--- |
| **Saber se tem plano ativo** | `$user->subscribed('default')` |
| **Pegar a assinatura** | `$user->subscription('default')` |
| **Data que o plano renova/termina** | `$user->subscription('default')->ends_at` |
| **Saber se cancelou mas ainda tem acesso** | `$user->subscription('default')->onGracePeriod()` |
| **Listar todas as faturas** | `$user->invoices()` |
| **Incluir faturas pendentes/abertas** | `$user->invoicesIncludingPending()` |
| **Próxima fatura agendada** | `$user->upcomingInvoice()` |
| **Download do PDF da fatura** | `$user->downloadInvoice($invoiceId)` |
| **Link web da fatura (Stripe)** | `$invoice->hosted_invoice_url` |
