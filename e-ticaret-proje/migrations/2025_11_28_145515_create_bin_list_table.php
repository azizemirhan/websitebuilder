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
        Schema::create('bin_list', function (Blueprint $table) {
            $table->id();
            $table->string('bin', 8)->unique(); // İlk 6-8 hane (genellikle 6 hane yeterli)
            $table->string('bank_name'); // Akbank, İş Bankası, etc.
            $table->string('bank_code'); // akbank, isbank, etc.
            $table->string('card_type'); // credit, debit, prepaid
            $table->string('card_brand'); // visa, mastercard, amex, troy
            $table->string('card_family')->nullable(); // Bonus, Maximum, World, Axess, CardFinans
            $table->string('country_code', 2)->default('TR'); // TR, US, etc.
            $table->boolean('is_commercial')->default(false); // Ticari kart mı?
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('bin');
            $table->index(['bank_code', 'card_brand']);
            $table->index('card_family');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bin_list');
    }
};
