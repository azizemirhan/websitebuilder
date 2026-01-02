<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Drop the old unique constraint on 'key' only
            $table->dropUnique('settings_key_unique');
            
            // Add new composite unique constraint on key + tenant_id
            $table->unique(['key', 'tenant_id'], 'settings_key_tenant_unique');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique('settings_key_tenant_unique');
            $table->unique('key', 'settings_key_unique');
        });
    }
};

