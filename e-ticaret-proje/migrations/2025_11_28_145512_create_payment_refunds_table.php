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
        Schema::create('payment_refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->string('refund_id')->unique(); // Gateway refund ID
            $table->decimal('amount', 12, 2); // İade tutarı
            $table->string('currency', 3)->default('TRY');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->enum('type', ['full', 'partial'])->default('full');
            $table->text('reason')->nullable(); // İade sebebi
            $table->json('gateway_response')->nullable();
            $table->text('error_message')->nullable();
            $table->string('error_code')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete(); // İadeyi talep eden kullanıcı
            $table->timestamp('refunded_at')->nullable(); // İade onay tarihi
            $table->timestamps();
            $table->softDeletes();

            $table->index(['payment_id', 'status']);
            $table->index('refund_id');
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
