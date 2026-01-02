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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_method_id')->constrained();

            // Gateway bilgileri
            $table->string('gateway_code'); // paytr, iyzico, sipay, param
            $table->string('transaction_id')->nullable(); // Gateway'den dönen işlem ID
            $table->string('conversation_id')->nullable(); // Bazı gateway'ler için (iyzico)

            // Tutar bilgileri
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('TRY');

            // Durum bilgileri
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'partial_refund'])->default('pending');
            $table->enum('payment_type', ['single', '3d_secure', 'stored_card'])->default('3d_secure');

            // Taksit bilgileri
            $table->unsignedTinyInteger('installment_count')->default(1);
            $table->decimal('installment_amount', 12, 2)->nullable(); // Aylık taksit tutarı

            // Kart bilgileri
            $table->string('card_family')->nullable(); // Bonus, Maximum, World, Axess
            $table->string('card_type')->nullable(); // credit, debit, prepaid
            $table->string('card_association')->nullable(); // visa, mastercard, amex, troy
            $table->string('masked_card_number')->nullable(); // 4111****1111
            $table->string('bin_number', 8)->nullable(); // İlk 6-8 hane

            // Banka bilgileri
            $table->string('bank_name')->nullable();
            $table->string('bank_code')->nullable();

            // Gateway yanıt bilgileri
            $table->json('gateway_response')->nullable(); // Ham gateway yanıtı
            $table->text('error_message')->nullable();
            $table->string('error_code')->nullable();

            // Güvenlik bilgileri
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            // Tarihler
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // İndeksler
            $table->index(['order_id', 'status']);
            $table->index('transaction_id');
            $table->index('gateway_code');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
