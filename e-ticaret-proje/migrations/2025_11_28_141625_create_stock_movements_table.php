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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no')->unique(); // İrsaliye/Fiş No
            $table->string('type'); // transfer, adjustment, sale, purchase, return
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();

            // Depolar
            $table->foreignId('from_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('to_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();

            $table->integer('quantity');
            $table->string('status')->default('pending'); // pending, in_transit, completed, cancelled
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();

            // İrsaliye bilgileri
            $table->string('waybill_no')->nullable(); // İrsaliye Numarası
            $table->date('shipment_date')->nullable();
            $table->date('received_date')->nullable();
            $table->string('carrier')->nullable(); // Kargo firması
            $table->string('tracking_no')->nullable();

            // Kullanıcı bilgileri
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
