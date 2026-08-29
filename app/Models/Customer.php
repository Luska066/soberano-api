<?php

namespace App\Models;

use App\Enums\Stripe\v1\StripCountrieType;
use App\Observers\CustomerObserver;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Invoice;
use Laravel\Cashier\Subscription;

#[ObservedBy([CustomerObserver::class])]
#[Fillable([
    'id_user',
    'country',
    'line1',
    'line2',
    'city',
    'state',
    'postal_code',
    'id_stripe',
    'data',
    'phone',
    'country_code',
])]
class Customer extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'customer';

    protected $primaryKey = 'uuid';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $appends = [
        'name',
        'email',
        'country_label',
        'stripe_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function getNameAttribute(): ?string
    {
        return $this->user?->name;
    }

    public function getEmailAttribute(): ?string
    {
        return $this->user?->email;
    }

    public function getStripeIdAttribute(): ?string
    {
        return $this->id_stripe ?? $this->user?->stripe_id;
    }

    public function getCountryEnumAttribute(): ?StripCountrieType
    {
        return StripCountrieType::fromValueOrLabel($this->country);
    }

    public function getCountryLabelAttribute(): string
    {
        return $this->country_enum?->label() ?? $this->country ?? '';
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
     * Retorna todas as assinaturas ativas do cliente.
     */
    public function activeSubscriptions(): Collection
    {
        return $this->subscriptions()
            ->get()
            ->filter(fn (Subscription $sub) => $sub->valid());
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
     * Busca a última fatura diretamente da assinatura ativa especificada (via Cashier Subscription).
     */
    public function latestSubscriptionInvoice(string $type = 'default', array $expand = []): ?Invoice
    {
        return $this->subscription($type)?->latestInvoice($expand);
    }

    /**
     * Busca a lista de faturas (invoices) direto do Stripe.
     * 
     * @return Collection<int, Invoice>
     */
    public function invoices(bool $includePending = false, array $parameters = []): Collection
    {
        if (! $this->user || ! $this->user->hasStripeId()) {
            return collect();
        }

        try {
            return $includePending
                ? $this->user->invoicesIncludingPending($parameters)
                : $this->user->invoices($parameters);
        } catch (\Throwable $e) {
            Log::warning('Erro ao buscar faturas no Stripe para o cliente: ' . $e->getMessage(), [
                'customer_uuid' => $this->uuid,
                'stripe_id' => $this->user->stripe_id,
            ]);
            return collect();
        }
    }

    /**
     * Busca a última fatura gerada no Stripe para o cliente.
     */
    public function latestInvoice(bool $includePending = true, array $parameters = []): ?Invoice
    {
        if (! $this->user || ! $this->user->hasStripeId()) {
            return null;
        }

        try {
            return $this->invoices($includePending, array_merge(['limit' => 1], $parameters))->first();
        } catch (\Throwable $e) {
            Log::warning('Erro ao buscar a última fatura no Stripe: ' . $e->getMessage(), [
                'customer_uuid' => $this->uuid,
            ]);
            return null;
        }
    }

    /**
     * Alias para buscar a última fatura gerada no Stripe.
     */
    public function lastInvoice(bool $includePending = true, array $parameters = []): ?Invoice
    {
        return $this->latestInvoice($includePending, $parameters);
    }

    /**
     * Busca a próxima fatura prevista (Upcoming Invoice).
     */
    public function upcomingInvoice(array $parameters = []): ?Invoice
    {
        if (! $this->user || ! $this->user->hasStripeId()) {
            return null;
        }

        try {
            return $this->user->upcomingInvoice($parameters);
        } catch (\Throwable $e) {
            return null;
        }
    }
}

