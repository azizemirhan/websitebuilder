<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables that had tenant_id added
     */
    protected array $tables = [
        // Core Module
        'users',
        'addresses',
        'settings',

        // Catalog Module
        'products',
        'categories',
        'brands',
        'product_variants',
        'product_images',
        'product_reviews',
        'attributes',
        'attribute_values',

        // Order Module
        'orders',
        'order_items',
        'carts',
        'cart_items',
        'coupons',
        'shipping_methods',
        'order_status_histories',

        // Payment Module
        'payments',
        'payment_methods',
        'payment_refunds',
        'installments',

        // Shipping Module
        'shipments',

        // Invoice Module
        'invoices',

        // CMS Module
        'pages',
        'menus',
        'menu_items',
        'page_sections',

        // Inventory Module
        'warehouses',
        'stock_locations',
        'stock_movements',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remove tenant_id from all tables
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $table) {
                    // Drop foreign key first (may fail silently if doesn't exist)
                    try {
                        $table->dropForeign(['tenant_id']);
                    } catch (\Exception $e) {
                        // Foreign key may not exist
                    }
                    $table->dropColumn('tenant_id');
                });
            }
        }

        // Drop tenants table
        Schema::dropIfExists('tenants');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible - multi-tenancy is being permanently removed
        throw new \RuntimeException('This migration cannot be reversed. Multi-tenancy has been permanently removed.');
    }
};
