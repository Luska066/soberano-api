<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['id_stripe_event', 'type', 'data', 'last_error', 'processed_at'])]
class StripeWebhookEvent extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'stripe_webhook_events';

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
            'last_error' => 'array',
            'processed_at' => 'datetime',
        ];
    }
}
