<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class AiModel extends Model
{
    use HasFactory;

    protected $table = 'ai_models';

    protected $fillable = [
        'model_id',
        'filename',
        'title',
        'game_name',
        'slug',
        'resolution',
        'file_size_mb',
        'fps',
        'latency_ms',
        'soberano_score',
        'community_score',
        'tier',
        'has_headshot',
        'num_classes',
        'downloads',
        'rating',
        'min_plan',
        'is_active',
        'asset_id',
        'download_url',
        'local_path',
        'metadata',
    ];

    protected $casts = [
        'model_id' => 'integer',
        'file_size_mb' => 'float',
        'fps' => 'integer',
        'latency_ms' => 'float',
        'soberano_score' => 'float',
        'community_score' => 'float',
        'has_headshot' => 'boolean',
        'num_classes' => 'integer',
        'downloads' => 'integer',
        'rating' => 'float',
        'is_active' => 'boolean',
        'asset_id' => 'integer',
        'metadata' => 'array',
    ];

    public function downloadsLog(): HasMany
    {
        return $this->hasMany(AiModelDownload::class, 'ai_model_id');
    }

    public static function planHierarchy(): array
    {
        return [
            '7D' => 1,
            '30D' => 2,
            '365D' => 3,
            'LIFE' => 4,
        ];
    }

    public function isAccessibleByPlan(string $userPlan): bool
    {
        $hierarchy = self::planHierarchy();
        $userLevel = $hierarchy[strtoupper(trim($userPlan))] ?? 0;
        $requiredLevel = $hierarchy[strtoupper(trim($this->min_plan))] ?? 1;

        return $userLevel >= $requiredLevel;
    }
}
