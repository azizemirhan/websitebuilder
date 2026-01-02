<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Adres tipi ve başlık
            $table->string('title'); // Ev, İş, vs.
            $table->enum('type', ['billing', 'shipping', 'both'])->default('both');
            
            // Kişi bilgileri
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone');
            $table->string('email')->nullable();
            
            // Kurumsal bilgiler (fatura için)
            $table->string('company_name')->nullable();
            $table->string('tax_office')->nullable();
            $table->string('tax_number')->nullable();
            $table->string('identity_number')->nullable(); // TC Kimlik
            
            // Adres bilgileri
            $table->foreignId('city_id')->constrained();
            $table->foreignId('district_id')->constrained();
            $table->string('neighborhood')->nullable(); // Mahalle
            $table->text('address_line'); // Açık adres
            $table->string('postal_code')->nullable();
            
            // Varsayılan adresler
            $table->boolean('is_default_billing')->default(false);
            $table->boolean('is_default_shipping')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexler
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'is_default_billing']);
            $table->index(['user_id', 'is_default_shipping']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};