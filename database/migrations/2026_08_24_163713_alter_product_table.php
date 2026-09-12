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
            if (!Schema::hasColumn('product', 'name')) {
                $table->string('name')->nullable();
            }
            if (!Schema::hasColumn('product', 'description')) {
                $table->string('description')->nullable();
            }
            if (!Schema::hasColumn('product', 'image')) {
                $table->string('image')->nullable();
            }
            if (!Schema::hasColumn('product', 'default_price')) {
                $table->string('default_price')->nullable();
            }
            if (!Schema::hasColumn('product', 'deleted_at')) {
                $table->softDeletes();
            }
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
