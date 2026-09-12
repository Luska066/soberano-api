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
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->string('key', 64)->unique()->index();
            $table->string('plan', 16); // '7D', '30D', '365D', 'LIFE'
            $table->string('plan_name', 64); // 'Semanal (7 Dias)', 'Mensal (30 Dias)', 'Vitalício'
            $table->string('hwid', 64)->default('GLOBAL')->index();
            $table->string('status', 16)->default('active')->index(); // 'active', 'revoked', 'expired', 'banned'
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('user_email', 255)->nullable()->index();
            $table->integer('duration_days')->default(30);
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->string('last_ip', 64)->nullable();
            $table->string('app_version', 32)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('revoked_keys', function (Blueprint $table) {
            $table->string('key', 64)->primary();
            $table->text('reason')->nullable();
            $table->timestamp('revoked_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revoked_keys');
        Schema::dropIfExists('licenses');
    }
};
