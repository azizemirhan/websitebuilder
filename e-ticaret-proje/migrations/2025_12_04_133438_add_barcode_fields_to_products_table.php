<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Products tablosuna barkod alanları ekle
        Schema::table('products', function (Blueprint $table) {
            $table->string('barcode_type')->default('ean13')->after('barcode');
            $table->string('barcode_image')->nullable()->after('barcode_type');
        });

        // Product variants tablosuna barkod alanları ekle
        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('barcode_type')->default('ean13')->after('barcode');
            $table->string('barcode_image')->nullable()->after('barcode_type');
        });

        // Barkod indeksleri
        Schema::table('products', function (Blueprint $table) {
            $table->index('barcode');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->index('barcode');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['barcode']);
            $table->dropColumn(['barcode_type', 'barcode_image']);
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex(['barcode']);
            $table->dropColumn(['barcode_type', 'barcode_image']);
        });
    }
};
