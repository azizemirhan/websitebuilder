<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Helper function to safely modify unique constraints
        $this->safeModifyUnique('categories', 'slug', 'categories_slug_unique', 'categories_slug_tenant_unique');
        $this->safeModifyUnique('brands', 'slug', 'brands_slug_unique', 'brands_slug_tenant_unique');
        $this->safeModifyUnique('products', 'slug', 'products_slug_unique', 'products_slug_tenant_unique');
        $this->safeModifyUnique('products', 'sku', 'products_sku_unique', 'products_sku_tenant_unique');
        $this->safeModifyUnique('product_variants', 'sku', 'product_variants_sku_unique', 'product_variants_sku_tenant_unique');
        $this->safeModifyUnique('users', 'email', 'users_email_unique', 'users_email_tenant_unique');
        $this->safeModifyUnique('coupons', 'code', 'coupons_code_unique', 'coupons_code_tenant_unique');
        $this->safeModifyUnique('pages', 'slug', 'pages_slug_unique', 'pages_slug_tenant_unique');
        $this->safeModifyUnique('menus', 'slug', 'menus_slug_unique', 'menus_slug_tenant_unique');
    }

    public function down(): void
    {
        // Revert changes
        $this->safeRevertUnique('categories', 'slug', 'categories_slug_tenant_unique', 'categories_slug_unique');
        $this->safeRevertUnique('brands', 'slug', 'brands_slug_tenant_unique', 'brands_slug_unique');
        $this->safeRevertUnique('products', 'slug', 'products_slug_tenant_unique', 'products_slug_unique');
        $this->safeRevertUnique('products', 'sku', 'products_sku_tenant_unique', 'products_sku_unique');
        $this->safeRevertUnique('product_variants', 'sku', 'product_variants_sku_tenant_unique', 'product_variants_sku_unique');
        $this->safeRevertUnique('users', 'email', 'users_email_tenant_unique', 'users_email_unique');
        $this->safeRevertUnique('coupons', 'code', 'coupons_code_tenant_unique', 'coupons_code_unique');
        $this->safeRevertUnique('pages', 'slug', 'pages_slug_tenant_unique', 'pages_slug_unique');
        $this->safeRevertUnique('menus', 'slug', 'menus_slug_tenant_unique', 'menus_slug_unique');
    }

    private function safeModifyUnique(string $table, string $column, string $oldIndex, string $newIndex): void
    {
        if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'tenant_id')) {
            return;
        }

        try {
            Schema::table($table, function (Blueprint $t) use ($column, $oldIndex, $newIndex) {
                try {
                    $t->dropUnique($oldIndex);
                } catch (\Exception $e) {
                    // Index doesn't exist, skip
                }
            });
            
            Schema::table($table, function (Blueprint $t) use ($column, $newIndex) {
                $t->unique([$column, 'tenant_id'], $newIndex);
            });
        } catch (\Exception $e) {
            // New index might already exist, skip
        }
    }

    private function safeRevertUnique(string $table, string $column, string $currentIndex, string $originalIndex): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        try {
            Schema::table($table, function (Blueprint $t) use ($column, $currentIndex, $originalIndex) {
                try {
                    $t->dropUnique($currentIndex);
                } catch (\Exception $e) {
                    // Index doesn't exist, skip
                }
            });
            
            Schema::table($table, function (Blueprint $t) use ($column, $originalIndex) {
                $t->unique($column, $originalIndex);
            });
        } catch (\Exception $e) {
            // Skip errors
        }
    }
};
