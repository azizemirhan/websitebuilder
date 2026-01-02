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
        // Disable foreign key checks before dropping
        Schema::disableForeignKeyConstraints();
        
        // Drop existing payments table if exists and recreate with proper structure
        Schema::dropIfExists('payment_refunds'); // Drop child table first
        Schema::dropIfExists('payments');
        
        // Re-enable foreign key checks
        Schema::enableForeignKeyConstraints();

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();

            // Idempotency - Kritik!
            $table->string('idempotency_key')->unique()->comment('Prevents duplicate payments');

            // Gateway bilgileri
            $table->string('gateway_code'); // 'iyzico', 'paytr', 'garanti', etc.
            $table->string('transaction_id')->nullable()->index();
            $table->string('reference_number')->nullable(); // Bank reference

            // Tutar
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('TRY');

            // Durum
            $table->enum('status', [
                'pending',      // Ödeme başlatıldı
                'processing',   // İşleniyor (3D Secure'de)
                'success',      // Başarılı
                'failed',       // Başarısız
                'cancelled',    // İptal edildi
                'refunded',     // İade edildi
            ])->default('pending')->index();

            // Ödeme detayları
            $table->integer('installment')->default(1);
            $table->string('card_family')->nullable(); // Bonus, World, etc.
            $table->string('card_type')->nullable(); // Visa, MasterCard
            $table->string('card_bin')->nullable(); // İlk 6 hane
            $table->string('card_last_four')->nullable(); // Son 4 hane

            // Gateway response
            $table->json('gateway_request')->nullable(); // Request payload
            $table->json('gateway_response')->nullable(); // Response payload
            $table->text('error_message')->nullable();
            $table->string('error_code')->nullable();

            // 3D Secure
            $table->boolean('is_3d_secure')->default(false);
            $table->string('3d_status')->nullable();
            $table->json('3d_data')->nullable();

            // Zaman bilgileri
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();

            // IP ve User Agent (Fraud detection için)
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // İndeksler
            $table->index(['order_id', 'status']);
            $table->index(['gateway_code', 'status']);
            $table->index('created_at');
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
