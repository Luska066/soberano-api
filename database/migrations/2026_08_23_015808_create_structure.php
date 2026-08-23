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
        Schema::create('plan', function (Blueprint $table) {
            $table->uuid();
            $table->string('id_stripe')->unique();
            $table->json('data');
            $table->timestamps();
            $table->softDeletes();
            $table->index('id_stripe');
        });
        Schema::create('price', function (Blueprint $table) {
            $table->uuid();
            $table->string('id_stripe')->unique();
            $table->json('data');
            $table->timestamps();
            $table->softDeletes();
            $table->index('id_stripe');
        });
        Schema::create('customer_subscription', function (Blueprint $table) {
            $table->uuid();
            $table->string('id_stripe')->unique();
            $table->json('data');
            $table->timestamps();
            $table->softDeletes();
            $table->index('id_stripe');
        });
        Schema::create('subscription_wb', function (Blueprint $table) {
            $table->uuid();
            $table->string('id_stripe')->unique();
            $table->json('data');
            $table->timestamps();
            $table->softDeletes();
            $table->index('id_stripe');
        });
        Schema::create('stripe_webhook_events', function (Blueprint $table) {
            $table->uuid();
            $table->string('id_stripe_event')->unique();
            $table->longText('type');
            $table->json('data');
            $table->json('last_error')->nullable();
            $table->dateTime('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('id_stripe_event');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('structure');
    }
};
