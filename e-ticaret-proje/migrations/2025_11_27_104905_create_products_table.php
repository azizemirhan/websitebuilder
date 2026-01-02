<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            
            // Temel Bilgiler
            $table->json('name'); // Translatable
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable();
            $table->string('barcode')->nullable();
            $table->json('short_description')->nullable(); // Translatable
            $table->json('description')->nullable(); // Translatable
            
            // İlişkiler
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('primary_category_id')->nullable()->constrained('categories')->nullOnDelete();
            
            // Fiyatlandırma
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('compare_price', 12, 2)->nullable(); // İndirimli fiyat gösterimi için
            $table->decimal('cost', 12, 2)->nullable(); // Maliyet
            
            // Vergi
            $table->decimal('tax_rate', 5, 2)->default(20); // KDV oranı
            $table->boolean('tax_included')->default(true); // Fiyata dahil mi?
            
            // Stok
            $table->integer('stock_quantity')->default(0);
            $table->enum('stock_status', ['in_stock', 'out_of_stock', 'preorder'])->default('in_stock');
            $table->boolean('track_stock')->default(true);
            $table->boolean('allow_backorder')->default(false);
            $table->integer('low_stock_threshold')->default(5);
            
            // Kargo
            $table->decimal('weight', 8, 3)->nullable(); // kg
            $table->decimal('width', 8, 2)->nullable(); // cm
            $table->decimal('height', 8, 2)->nullable(); // cm
            $table->decimal('length', 8, 2)->nullable(); // cm
            
            // Durum
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new')->default(false);
            $table->boolean('is_bestseller')->default(false);
            $table->boolean('has_variant')->default(false);
            
            // SEO
            $table->json('meta_title')->nullable();
            $table->json('meta_description')->nullable();
            $table->json('meta_keywords')->nullable();
            
            // Ek
            $table->integer('view_count')->default(0);
            $table->integer('sale_count')->default(0);
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexler
            $table->index('brand_id');
            $table->index('primary_category_id');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('stock_status');
            $table->index('price');
            $table->index(['is_active', 'is_featured']);
            $table->index(['is_active', 'stock_status']);
        });

        // Ürün - Kategori (Many to Many)
        Schema::create('category_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            
            $table->unique(['product_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_product');
        Schema::dropIfExists('products');
    }
};