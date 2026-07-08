<?php

// appV1.0 Rev 1 - Tambah bahan_produk (kacamata: plastik/besi) dan minus_produk (soflen: plano/minus/plus) sebagai dropdown dinamis.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->string('bahan_produk')->nullable()->after('diameter_produk');
            $table->string('minus_produk')->nullable()->after('bahan_produk');
            $table->index('bahan_produk');
            $table->index('minus_produk');
        });
    }

    public function down(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->dropIndex(['bahan_produk']);
            $table->dropIndex(['minus_produk']);
            $table->dropColumn(['bahan_produk', 'minus_produk']);
        });
    }
};
