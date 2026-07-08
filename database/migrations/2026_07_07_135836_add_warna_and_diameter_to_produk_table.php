<?php

// appV1.0 Rev 1 - Tambah warna_produk (kacamata & soflen) dan diameter_produk (soflen) sebagai dropdown dinamis.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->string('warna_produk')->nullable()->after('brand_produk');
            $table->string('diameter_produk')->nullable()->after('warna_produk');
            $table->index('warna_produk');
            $table->index('diameter_produk');
        });
    }

    public function down(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->dropIndex(['warna_produk']);
            $table->dropIndex(['diameter_produk']);
            $table->dropColumn(['warna_produk', 'diameter_produk']);
        });
    }
};
