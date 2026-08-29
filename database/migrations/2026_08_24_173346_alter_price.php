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
        Schema::table('price', function (Blueprint $table) {
            $table->string('currency')->nullable();
            $table->string('product_id');
            $table->string('interval');
            $table->string('trial_period_days')->nullable();
            $table->string('unit_amount');
            $table->string('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price');
    }
};
