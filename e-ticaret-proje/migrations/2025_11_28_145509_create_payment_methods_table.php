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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // paytr, iyzico, sipay, param, etc.
            $table->string('name'); // Display name
            $table->string('gateway_class'); // Full class name of gateway
            $table->text('description')->nullable();
            $table->string('logo_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('supports_installment')->default(false);
            $table->boolean('supports_3d_secure')->default(false);
            $table->boolean('supports_refund')->default(false);
            $table->integer('max_installment')->default(12);
            $table->decimal('min_installment_amount', 12, 2)->default(100.00);
            $table->json('config')->nullable(); // Gateway-specific configuration
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
