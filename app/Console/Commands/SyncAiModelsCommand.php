<?php

namespace App\Console\Commands;

use App\Models\AiModel;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SyncAiModelsCommand extends Command
{
    protected $signature = 'soberano:sync-models {--force : Sobrescrever modelos existentes}';
    protected $description = 'Sincroniza o catálogo de IA com os dados reais de benchmark do VAULT_INDEX.json';

    public function handle(): int
    {
        $this->info("🦅 Iniciando Sincronização do Catálogo de Modelos Soberano...");

        $path = database_path('data/VAULT_INDEX.json');
        if (!file_exists($path)) {
            $path = '/home/viniciusphdu/WORKSPACE_CORE/2_Projetos_e_Bots/MossyModels-Manager/VAULT_INDEX.json';
        }

        if (!file_exists($path)) {
            $this->error("Arquivo VAULT_INDEX.json não encontrado!");
            return Command::FAILURE;
        }

        $raw = file_get_contents($path);
        $items = json_decode($raw, true);

        if (!is_array($items)) {
            $this->error("Falha ao decodificar JSON do catálogo!");
            return Command::FAILURE;
        }

        $this->info("Encontrados " . count($items) . " modelos no cofre.");
        $count = 0;

        foreach ($items as $item) {
            $modelId = $item['model_id'] ?? null;
            if (!$modelId) continue;

            $bench = $item['soberano_benchmark'] ?? [];
            $game = $item['game_name'] ?? ($bench['game_name'] ?? 'Universal');
            $title = $item['title'] ?? $item['filename'];
            $fps = (int) ($bench['fps'] ?? 0);
            $latency = (float) ($bench['avg_ms'] ?? 0.0);
            $score = (float) ($bench['score'] ?? ($item['community_score'] ?? 0.0));
            $tier = $bench['tier'] ?? 'TIER A (Elite)';
            $hasHs = (bool) ($bench['has_headshot'] ?? (str_contains(strtolower($title), 'headshot') || str_contains(strtolower($item['filename']), 'headshot')));
            $classes = (int) ($bench['num_classes'] ?? 1);
            $res = $bench['resolution'] ?? ($item['resolution'] ?? '320x320');
            $sizeMb = (float) ($item['size_mb'] ?? ($bench['file_size_mb'] ?? 0.0));
            $rating = (float) ($item['rating'] ?? 5.0);
            $downloads = (int) ($item['downloads'] ?? 0);

            // Determina plano mínimo: Modelos lendários S+ e Headshot exigem 30D ou LIFE
            $minPlan = '7D';
            if (str_contains($tier, 'S+') || $score >= 95.0) {
                $minPlan = '30D';
            }
            if (str_contains(strtolower($title), 'uniroblox') || str_contains(strtolower($title), 'world\'s best')) {
                $minPlan = 'LIFE';
            }

            AiModel::updateOrCreate(
                ['model_id' => $modelId],
                [
                    'filename' => $item['filename'] ?? "model_{$modelId}.onnx",
                    'title' => $title,
                    'game_name' => $game,
                    'slug' => Str::slug($game . '-' . $title . '-' . $modelId),
                    'resolution' => $res,
                    'file_size_mb' => $sizeMb,
                    'fps' => $fps,
                    'latency_ms' => $latency,
                    'soberano_score' => $score,
                    'community_score' => $item['community_score'] ?? null,
                    'tier' => $tier,
                    'has_headshot' => $hasHs,
                    'num_classes' => $classes,
                    'downloads' => $downloads,
                    'rating' => $rating,
                    'min_plan' => $minPlan,
                    'is_active' => true,
                    'asset_id' => $item['asset_id'] ?? null,
                    'download_url' => $item['api_download_url'] ?? null,
                    'metadata' => [
                        'views' => $item['views'] ?? 0,
                        'names_meta' => $bench['names_meta'] ?? null,
                        'p99_ms' => $bench['p99_ms'] ?? null,
                    ],
                ]
            );
            $count++;
        }

        $this->info("✔ Sucesso! {$count} modelos de IA sincronizados com o banco de dados oficial.");
        return Command::SUCCESS;
    }
}
