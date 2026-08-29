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
        Schema::table('customer', function (Blueprint $table) {
            if (!Schema::hasColumn('customer', 'phone')) {
                $table->string('phone')->nullable()->after('postal_code');
            }
            $table->string('country_code')->after('phone');
            $table->softDeletes()->after('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer', function (Blueprint $table) {
            if (Schema::hasColumn('customer', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('customer', 'country_code')) {
                $table->dropColumn('country_code');
            }
            if (Schema::hasColumn('customer', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
