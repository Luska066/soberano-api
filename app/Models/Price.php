<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'id_stripe', 
    'data',
    'currency',
    'product_id',
    'interval',
    'trial_period_days',
    'unit_amount',
    'type'
])]
class Price extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'price';

    protected $primaryKey = 'uuid';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $appends = [
        'active',
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

    public function getActiveAttribute(): bool
    {
        if ($this->trashed() || $this->deleted_at !== null) {
            return false;
        }

        if (isset($this->data['active'])) {
            return (bool) $this->data['active'];
        }

        return true;
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id_stripe');
    }
}

