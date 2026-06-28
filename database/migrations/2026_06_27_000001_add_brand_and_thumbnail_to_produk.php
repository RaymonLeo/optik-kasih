<?php

// appV1.0 Rev 1 - Brand produk dan flag thumbnail pada galeri foto tambahan.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->string('brand_produk')->nullable()->after('kategori_produk');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->boolean('is_thumbnail')->default(false)->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->dropColumn('brand_produk');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn('is_thumbnail');
        });
    }
};
