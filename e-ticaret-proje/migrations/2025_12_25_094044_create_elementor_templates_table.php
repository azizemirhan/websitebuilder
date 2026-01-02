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
        Schema::create('elementor_templates', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type', 50)->default('page'); // page, section, widget, header, footer
            $table->longText('content')->nullable(); // JSON Elementor data
            $table->string('status', 20)->default('draft'); // draft, published, trash
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('thumbnail')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('type');
            $table->index('status');
            $table->index('user_id');
            $table->index(['type', 'status']);
        });

        // Template meta table
        Schema::create('elementor_template_meta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('elementor_templates')->onDelete('cascade');
            $table->string('meta_key');
            $table->longText('meta_value')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('template_id');
            $table->index('meta_key');
            $table->unique(['template_id', 'meta_key']);
        });

        // Template revisions table
        Schema::create('elementor_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('elementor_templates')->onDelete('cascade');
            $table->longText('content'); // JSON snapshot
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('version')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('template_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('elementor_revisions');
        Schema::dropIfExists('elementor_template_meta');
        Schema::dropIfExists('elementor_templates');
    }
};
