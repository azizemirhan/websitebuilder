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
        Schema::create('stock_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();
            $table->integer('quantity')->default(0);
            $table->integer('reserved_quantity')->default(0); // Sipariş verilmiş ama henüz gönderilmemiş
            $table->integer('available_quantity')->storedAs('quantity - reserved_quantity'); // Virtual column
            $table->string('location_code')->nullable(); // Raf kodu: 'A-12-03'
            $table->string('bin')->nullable(); // Kutu/koli kodu
            $table->date('last_counted_at')->nullable(); // Son sayım tarihi
            $table->text('notes')->nullable();
            $table->timestamps();

            // Unique constraint: Her ürün her depoda bir kez olmalı
            $table->unique(['warehouse_id', 'product_id', 'product_variant_id'], 'unique_warehouse_product');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_locations');
    }
};
