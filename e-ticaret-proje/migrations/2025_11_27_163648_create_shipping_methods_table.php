<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->json('name');
            $table->string('code')->unique();
            $table->json('description')->nullable();
            $table->string('logo')->nullable();
            
            // Fiyatlandırma
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('free_shipping_threshold', 12, 2)->nullable();
            
            // Teslimat süresi
            $table->integer('min_delivery_days')->nullable();
            $table->integer('max_delivery_days')->nullable();
            
            // Durum
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
            
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
    }
};