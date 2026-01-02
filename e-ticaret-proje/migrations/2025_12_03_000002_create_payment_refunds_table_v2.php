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
        // Drop existing if exists
        Schema::dropIfExists('payment_refunds');

        Schema::create('payment_refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();

            // Idempotency for refunds too
            $table->string('idempotency_key')->unique();

            // Refund bilgileri
            $table->string('refund_transaction_id')->nullable();
            $table->decimal('amount', 12, 2);
            $table->enum('type', ['full', 'partial'])->default('full');

            // Durum
            $table->enum('status', [
                'pending',
                'processing',
                'success',
                'failed',
            ])->default('pending');

            // Neden
            $table->text('reason')->nullable();
            $table->text('admin_note')->nullable();

            // Gateway response
            $table->json('gateway_response')->nullable();
            $table->text('error_message')->nullable();

            // Kullanıcı
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('refunded_at')->nullable();

            $table->timestamps();

            $table->index(['payment_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_refunds');
    }
};
