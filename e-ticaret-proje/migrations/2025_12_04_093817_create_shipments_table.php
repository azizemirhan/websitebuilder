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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('tracking_number')->unique();
            $table->string('provider'); // aras, yurtici, ptt
            $table->string('status')->default('pending'); // pending, in_transit, out_for_delivery, delivered, cancelled, exception
            $table->string('status_description')->nullable();

            // Sender information
            $table->json('sender_info');

            // Receiver information
            $table->json('receiver_info');

            // Package information
            $table->json('package_info');

            // Shipping details
            $table->decimal('declared_value', 10, 2);
            $table->decimal('shipping_cost', 10, 2)->nullable();
            $table->string('delivery_type')->default('standard'); // standard, express, economy
            $table->boolean('insurance_required')->default(false);

            // Tracking
            $table->string('current_location')->nullable();
            $table->timestamp('estimated_delivery')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->string('recipient_name')->nullable();
            $table->json('tracking_history')->nullable();

            // Label
            $table->string('label_url')->nullable();
            $table->text('label_pdf')->nullable(); // Base64 encoded

            // API Response
            $table->json('provider_response')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('tracking_number');
            $table->index('provider');
            $table->index('status');
            $table->index('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
