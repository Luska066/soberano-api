<?php

namespace App\Models;

use App\Enums\Stripe\v1\StripCountrieType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
])]
class Customer extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'customer';

    protected $primaryKey = 'uuid';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $appends = [
        'name',
        'email',
        'phone',
        'country_code',
        'country_label',
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
        return $this->data['name'] ?? $this->user?->name ?? null;
    }

    public function setNameAttribute(?string $value): void
    {
        $data = $this->data ?? [];
        $data['name'] = $value;
        $this->data = $data;
    }

    public function getEmailAttribute(): ?string
    {
        return $this->data['email'] ?? $this->user?->email ?? null;
    }

    public function setEmailAttribute(?string $value): void
    {
        $data = $this->data ?? [];
        $data['email'] = $value;
        $this->data = $data;
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->data['phone'] ?? null;
    }

    public function setPhoneAttribute(?string $value): void
    {
        $data = $this->data ?? [];
        $data['phone'] = $value;
        $this->data = $data;
    }

    public function getCountryCodeAttribute(): ?string
    {
        return $this->data['country_code'] ?? '+55';
    }

    public function setCountryCodeAttribute(?string $value): void
    {
        $data = $this->data ?? [];
        $data['country_code'] = $value;
        $this->data = $data;
    }

    public function getCountryEnumAttribute(): ?StripCountrieType
    {
        return StripCountrieType::fromValueOrLabel($this->country);
    }

    public function getCountryLabelAttribute(): string
    {
        return $this->country_enum?->label() ?? $this->country ?? '';
    }
}
