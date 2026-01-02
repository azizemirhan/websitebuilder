<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->json('name'); // Translatable: Renk, Beden
            $table->string('code')->unique(); // color, size
            $table->enum('type', ['select', 'color', 'button', 'radio'])->default('select');
            
            $table->boolean('is_filterable')->default(true);
            $table->boolean('is_variant')->default(true); // Varyant oluşturur mu?
            $table->boolean('is_visible')->default(true); // Ürün sayfasında görünür mü?
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
            
            $table->index('is_filterable');
            $table->index('is_variant');
            $table->index('is_active');
        });

        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
            $table->json('value'); // Translatable: Kırmızı, XL
            $table->string('slug');
            $table->string('color_code')->nullable(); // #FF0000 (renk tipi için)
            $table->string('image')->nullable(); // Görsel (button tipi için)
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
            
            $table->unique(['attribute_id', 'slug']);
            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('attributes');
    }
};