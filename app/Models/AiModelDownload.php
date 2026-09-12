<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiModelDownload extends Model
{
    public $timestamps = false;

    protected $table = 'ai_model_downloads';

    protected $fillable = [
        'ai_model_id',
        'license_key',
        'hwid',
        'user_email',
        'ip_address',
        'downloaded_at',
    ];

    protected $casts = [
        'downloaded_at' => 'datetime',
    ];

    public function model(): BelongsTo
    {
        return $this->belongsTo(AiModel::class, 'ai_model_id');
    }
}
