<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->boolean('is_onboarding_complete')->default(false)->after('is_active');
            $table->json('onboarding_data')->nullable()->after('is_onboarding_complete');
            $table->string('selected_theme')->default('default')->after('onboarding_data');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['is_onboarding_complete', 'onboarding_data', 'selected_theme']);
        });
    }
};
