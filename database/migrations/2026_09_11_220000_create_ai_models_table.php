<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_models', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('model_id')->unique()->index();
            $table->string('filename', 255);
            $table->string('title', 255);
            $table->string('game_name', 100)->index();
            $table->string('slug', 150)->index();
            $table->string('resolution', 32)->default('320x320');
            $table->decimal('file_size_mb', 8, 2)->default(0.00);
            $table->unsignedInteger('fps')->default(0);
            $table->decimal('latency_ms', 8, 3)->default(0.000);
            $table->decimal('soberano_score', 8, 2)->default(0.00);
            $table->decimal('community_score', 10, 2)->nullable();
            $table->string('tier', 64)->default('TIER A (Elite)');
            $table->boolean('has_headshot')->default(false)->index();
            $table->unsignedSmallInteger('num_classes')->default(1);
            $table->unsignedBigInteger('downloads')->default(0);
            $table->decimal('rating', 3, 1)->default(5.0);
            $table->string('min_plan', 16)->default('7D')->index(); // '7D', '30D', '365D', 'LIFE'
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedBigInteger('asset_id')->nullable();
            $table->text('download_url')->nullable();
            $table->string('local_path', 255)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_model_downloads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ai_model_id');
            $table->string('license_key', 64)->nullable()->index();
            $table->string('hwid', 64)->nullable();
            $table->string('user_email', 255)->nullable();
            $table->string('ip_address', 64)->nullable();
            $table->timestamp('downloaded_at')->useCurrent();

            $table->foreign('ai_model_id')->references('id')->on('ai_models')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_model_downloads');
        Schema::dropIfExists('ai_models');
    }
};
