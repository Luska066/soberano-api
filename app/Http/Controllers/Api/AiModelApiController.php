<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiModel;
use App\Models\AiModelDownload;
use App\Models\License;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AiModelApiController extends Controller
{
    /**
     * Catálogo Público de Modelos de IA
     * GET /api/v1/models
     */
    public function index(Request $request): JsonResponse
    {
        $query = AiModel::where('is_active', true);

        // Filtro por Jogo
        if ($request->filled('game')) {
            $query->where('game_name', 'like', '%' . $request->input('game') . '%');
        }

        // Filtro por Suporte a Headshot
        if ($request->has('has_headshot')) {
            $query->where('has_headshot', filter_var($request->input('has_headshot'), FILTER_VALIDATE_BOOLEAN));
        }

        // Filtro por Tier
        if ($request->filled('tier')) {
            $query->where('tier', 'like', '%' . $request->input('tier') . '%');
        }

        // Ordenação
        $sortBy = $request->input('sort_by', 'soberano_score');
        $sortOrder = $request->input('order', 'desc');

        $allowedSorts = ['soberano_score', 'fps', 'latency_ms', 'downloads', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            // Para latência, menor é melhor (asc)
            if ($sortBy === 'latency_ms' && !$request->has('order')) {
                $sortOrder = 'asc';
            }
            $query->orderBy($sortBy, $sortOrder);
        }

        $models = $query->paginate($request->input('per_page', 50));

        return response()->json([
            'success' => true,
            'total' => $models->total(),
            'current_page' => $models->currentPage(),
            'data' => $models->items(),
        ]);
    }

    /**
     * Detalhes de um Modelo Específico
     * GET /api/v1/models/{id}
     */
    public function show(int $id): JsonResponse
    {
        $model = AiModel::where('model_id', $id)->orWhere('id', $id)->first();

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo de IA não encontrado no catálogo.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'model' => $model,
        ]);
    }

    /**
     * Download Seguro e Protegido do Modelo de IA (.onnx)
     * GET /api/v1/models/{id}/download
     * Exige: Middleware EnsureActiveLicense
     */
    public function download(Request $request, int $id): Response
    {
        $model = AiModel::where('model_id', $id)->orWhere('id', $id)->first();

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo não encontrado.',
            ], 404);
        }

        /** @var License|null $license */
        $license = $request->attributes->get('authenticated_license');

        // 1. Registra o log de auditoria do download
        AiModelDownload::create([
            'ai_model_id' => $model->id,
            'license_key' => $license?->key,
            'hwid' => $license?->hwid,
            'user_email' => $license?->user_email ?: $request->user()?->email,
            'ip_address' => $request->ip(),
            'downloaded_at' => now(),
        ]);

        // 2. Incrementa contador de downloads
        $model->increment('downloads');

        // 3. Entrega do Arquivo .onnx
        // Se existir localmente no vault do disco
        $possiblePaths = [
            "/mnt/GAMES/mossy_models_vault/{$model->game_name}/{$model->filename}",
            storage_path("app/models/{$model->filename}"),
            public_path("models/{$model->filename}"),
        ];

        foreach ($possiblePaths as $localPath) {
            if (file_exists($localPath)) {
                return response()->download($localPath, $model->filename, [
                    'Content-Type' => 'application/octet-stream',
                    'X-Model-Id' => (string) $model->model_id,
                    'X-Model-FPS' => (string) $model->fps,
                ]);
            }
        }

        // Se o arquivo tiver URL remota segura de release
        if ($model->download_url) {
            return response()->json([
                'success' => true,
                'message' => 'Download autorizado com sucesso.',
                'model' => [
                    'id' => $model->model_id,
                    'filename' => $model->filename,
                    'download_url' => $model->download_url,
                    'file_size_mb' => $model->file_size_mb,
                    'fps' => $model->fps,
                    'latency_ms' => $model->latency_ms,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Arquivo do modelo temporariamente indisponível no servidor.',
        ], 503);
    }
}
