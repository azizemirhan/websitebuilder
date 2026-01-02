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
        Schema::create('installments', function (Blueprint $table) {
            $table->id();
            $table->string('gateway_code'); // paytr, iyzico, sipay, etc.
            $table->string('bank_code'); // akbank, isbank, garanti, etc.
            $table->string('bank_name'); // Akbank, İş Bankası, Garanti BBVA
            $table->string('card_family')->nullable(); // Bonus, Maximum, World, Axess

            // Taksit detayları
            $table->unsignedTinyInteger('installment_count'); // 2, 3, 6, 9, 12
            $table->decimal('interest_rate', 5, 2)->default(0); // Faiz oranı (%)
            $table->decimal('commission_rate', 5, 2)->default(0); // Komisyon oranı (%)

            // Limit bilgileri
            $table->decimal('min_amount', 12, 2)->default(0); // Minimum tutar
            $table->decimal('max_amount', 12, 2)->nullable(); // Maximum tutar (null = sınırsız)

            // Durum
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Unique constraint: Aynı gateway+banka+taksit kombinasyonu tekil olmalı
            $table->unique(['gateway_code', 'bank_code', 'card_family', 'installment_count'], 'unique_installment');

            $table->index(['gateway_code', 'is_active']);
            $table->index('bank_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installments');
    }
};
