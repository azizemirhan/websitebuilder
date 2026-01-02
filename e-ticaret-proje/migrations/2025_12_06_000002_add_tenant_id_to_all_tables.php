<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Tenant_id eklenecek tablolar
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
        // Önce varsayılan tenant oluştur (eğer yoksa)
        $defaultTenantId = DB::table('tenants')->insertGetId([
            'name' => 'Varsayılan Mağaza',
            'slug' => 'default',
            'subdomain' => 'default',
            'plan' => 'enterprise',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->foreignId('tenant_id')
                        ->after('id')
                        ->nullable()
                        ->constrained('tenants')
                        ->nullOnDelete();
                    
                    $table->index('tenant_id');
                });

                // Mevcut verilere varsayılan tenant_id ata
                DB::table($table)->whereNull('tenant_id')->update([
                    'tenant_id' => $defaultTenantId,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropForeign(['tenant_id']);
                    $table->dropColumn('tenant_id');
                });
            }
        }
    }
};
