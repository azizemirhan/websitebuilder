<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            // Durum
            $table->enum('status', [
                'pending',      // Beklemede
                'confirmed',    // Onaylandı
                'processing',   // Hazırlanıyor
                'shipped',      // Kargoya verildi
                'delivered',    // Teslim edildi
                'cancelled',    // İptal edildi
                'refunded',     // İade edildi
            ])->default('pending');
            
            $table->enum('payment_status', [
                'pending',      // Ödeme bekleniyor
                'paid',         // Ödendi
                'failed',       // Başarısız
                'refunded',     // İade edildi
                'partially_refunded', // Kısmi iade
            ])->default('pending');
            
            // Fatura Adresi
            $table->string('billing_first_name');
            $table->string('billing_last_name');
            $table->string('billing_email');
            $table->string('billing_phone');
            $table->string('billing_company')->nullable();
            $table->string('billing_tax_office')->nullable();
            $table->string('billing_tax_number')->nullable();
            $table->string('billing_identity_number')->nullable();
            $table->string('billing_city');
            $table->string('billing_district');
            $table->text('billing_address');
            $table->string('billing_postal_code')->nullable();
            
            // Teslimat Adresi
            $table->string('shipping_first_name');
            $table->string('shipping_last_name');
            $table->string('shipping_phone');
            $table->string('shipping_city');
            $table->string('shipping_district');
            $table->text('shipping_address');
            $table->string('shipping_postal_code')->nullable();
            
            // Kargo
            $table->foreignId('shipping_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('shipping_method_name')->nullable();
            $table->string('tracking_number')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            
            // Kupon
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->string('coupon_code')->nullable();
            $table->decimal('coupon_discount', 12, 2)->default(0);
            
            // Tutarlar
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('shipping_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            
            // Ödeme
            $table->string('payment_method')->nullable();
            $table->string('payment_transaction_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            
            // Notlar
            $table->text('customer_note')->nullable();
            $table->text('admin_note')->nullable();
            
            // IP & User Agent
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('order_number');
            $table->index('user_id');
            $table->index('status');
            $table->index('payment_status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};