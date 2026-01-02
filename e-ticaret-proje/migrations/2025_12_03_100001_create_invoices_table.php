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
        // Skip if table already exists
        if (Schema::hasTable('invoices')) {
            return;
        }
        
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();

            // Fatura Numarası (Yasal format: YYYY0000000001)
            $table->string('invoice_no')->unique();
            $table->string('invoice_series')->default('A'); // Seri no (A, B, C...)
            $table->integer('invoice_sequence')->unsigned(); // Sıra no

            // Fatura Türü
            $table->enum('type', [
                'e-invoice',    // e-Fatura (Kurumsal müşteri)
                'e-archive',    // e-Arşiv (Bireysel müşteri)
            ])->default('e-archive');

            // GİB (Gelir İdaresi Başkanlığı) Bilgileri
            $table->string('uuid')->unique()->nullable(); // GİB UUID
            $table->string('ettn')->unique()->nullable(); // ETTN (Elektronik Fatura Takip No)
            $table->timestamp('gib_sent_at')->nullable();
            $table->timestamp('gib_delivered_at')->nullable();
            $table->enum('gib_status', [
                'draft',        // Taslak (henüz gönderilmedi)
                'pending',      // Gönderildi, onay bekleniyor
                'approved',     // Onaylandı
                'rejected',     // Reddedildi
                'cancelled',    // İptal edildi
            ])->default('draft');
            $table->json('gib_response')->nullable(); // GİB response data

            // Satıcı Bilgileri (Snapshot - Order'dan bağımsız)
            $table->json('seller_info'); // {name, address, tax_office, tax_number, email, phone}

            // Alıcı Bilgileri (Snapshot - Order'dan bağımsız)
            $table->json('buyer_info'); // {name, address, tax_office, tax_number, identity_number, email, phone}

            // Fatura Kalemleri (Snapshot)
            $table->json('line_items'); // [{name, quantity, unit_price, tax_rate, tax_amount, total}, ...]

            // Tutarlar
            $table->decimal('subtotal', 12, 2); // Ara toplam (KDV hariç)
            $table->decimal('discount_total', 12, 2)->default(0); // İndirim toplamı
            $table->decimal('tax_total', 12, 2); // KDV toplamı
            $table->decimal('shipping_total', 12, 2)->default(0); // Kargo ücreti
            $table->decimal('grand_total', 12, 2); // Genel toplam (KDV dahil)

            // KDV Dağılımı (Her KDV oranı için)
            $table->json('tax_breakdown')->nullable(); // [{rate: 20, base: 1000, tax: 200}, ...]

            // Para Birimi
            $table->string('currency', 3)->default('TRY');

            // Notlar
            $table->text('note')->nullable();
            $table->text('internal_note')->nullable(); // Müşteriye gösterilmez

            // PDF
            $table->string('pdf_path')->nullable(); // PDF dosya yolu
            $table->timestamp('pdf_generated_at')->nullable();

            // Durum
            $table->enum('status', [
                'draft',        // Taslak
                'finalized',    // Kesinleşmiş
                'sent',         // Gönderildi
                'cancelled',    // İptal edildi
            ])->default('draft');

            // İptal bilgileri
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();

            // Fatura kesim tarihi
            $table->date('invoice_date');
            $table->date('due_date')->nullable(); // Vade tarihi

            $table->timestamps();
            $table->softDeletes();

            // İndeksler
            $table->index('invoice_no');
            $table->index('order_id');
            $table->index(['type', 'status']);
            $table->index('invoice_date');
            $table->index('gib_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
