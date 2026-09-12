<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $key
 * @property string $plan
 * @property string $plan_name
 * @property string $hwid
 * @property string $status
 * @property int|null $user_id
 * @property string|null $user_email
 * @property int $duration_days
 * @property Carbon|null $activated_at
 * @property Carbon|null $expires_at
 * @property string|null $last_ip
 * @property string|null $app_version
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class License extends Model
{
    use HasFactory;

    protected $table = 'licenses';

    protected $fillable = [
        'key',
        'plan',
        'plan_name',
        'hwid',
        'status',
        'user_id',
        'user_email',
        'duration_days',
        'activated_at',
        'expires_at',
        'last_ip',
        'app_version',
        'notes',
    ];

    protected $casts = [
        'activated_at' => 'datetime',
        'expires_at' => 'datetime',
        'duration_days' => 'integer',
        'user_id' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->expires_at && Carbon::now()->greaterThan($this->expires_at)) {
            return false;
        }

        return true;
    }

    public function getDaysRemainingAttribute(): int
    {
        if ($this->plan === 'LIFE') {
            return 36500;
        }

        if (!$this->expires_at) {
            return $this->duration_days;
        }

        $now = Carbon::now();
        if ($now->greaterThan($this->expires_at)) {
            return 0;
        }

        return (int) ceil($now->diffInDays($this->expires_at, false));
    }
}
