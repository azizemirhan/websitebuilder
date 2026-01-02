<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->json('name'); // Translatable
            $table->string('slug')->unique();
            $table->json('description')->nullable(); // Translatable
            $table->string('image')->nullable();
            $table->string('icon')->nullable();
            
            // Durum
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('show_in_menu')->default(true);
            $table->integer('sort_order')->default(0);
            
            // SEO
            $table->json('meta_title')->nullable();
            $table->json('meta_description')->nullable();
            
            // Nested Set için (opsiyonel - performans için)
            $table->integer('_lft')->default(0);
            $table->integer('_rgt')->default(0);
            $table->integer('depth')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('parent_id');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('show_in_menu');
            $table->index('sort_order');
            $table->index(['_lft', '_rgt']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};