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
        Schema::table('product', function (Blueprint $table) {
            if (Schema::hasColumn('product', 'prices')) {
                $table->dropColumn('prices');
            }
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('image')->nullable();
            $table->string('default_price')->nullable();
            $table->softDeletes();
        });
        Schema::create('product_benefits', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->foreignUuid('product_id')->references('uuid')->on('product')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
