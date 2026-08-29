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
use Illuminate\Database\Eloquent\SoftDeletes;


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
class CustomerWithoutObservable extends Model
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

    public function getCountryEnumAttribute(): ?StripCountrieType
    {
        return StripCountrieType::fromValueOrLabel($this->country);
    }

    public function getCountryLabelAttribute(): string
    {
        return $this->country_enum?->label() ?? $this->country ?? '';
    }
}
