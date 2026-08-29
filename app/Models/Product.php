<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['id_stripe', 'data', 'name', 'description', 'image', 'default_price'])]
class Product extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'product';

    protected $primaryKey = 'uuid';

    public $incrementing = false;

    protected $keyType = 'string';

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

    public function benefits(): HasMany
    {
        return $this->hasMany(ProductBenefit::class, 'product_id', 'uuid');
    }

    public function prices(): HasMany
    {
        return $this->hasMany(Price::class, 'product_id', 'id_stripe')->withTrashed();
    }
}
