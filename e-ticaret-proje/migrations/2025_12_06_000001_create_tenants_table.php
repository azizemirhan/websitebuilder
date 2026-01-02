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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique(); // benzersiz tanımlayıcı
            $table->string('subdomain')->unique();
            $table->string('custom_domain')->nullable()->unique();
            
            // Firma Bilgileri
            $table->string('company_name')->nullable();
            $table->string('tax_office')->nullable();
            $table->string('tax_number')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            
            // Görsel
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            
            // Plan ve Durum
            $table->string('plan')->default('basic'); // basic, pro, enterprise
            $table->boolean('is_active')->default(true);
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            
            // Ayarlar (JSON)
            $table->json('settings')->nullable(); // Genel site ayarları
            $table->json('payment_config')->nullable(); // Ödeme entegrasyon bilgileri
            $table->json('shipping_config')->nullable(); // Kargo entegrasyon bilgileri
            $table->json('invoice_config')->nullable(); // Fatura entegrasyon bilgileri
            
            // Meta
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('subdomain');
            $table->index('custom_domain');
            $table->index('is_active');
            $table->index('plan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
