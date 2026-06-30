<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->unsignedSmallInteger('lebar_lensa')->nullable()->after('deskripsi_produk');
            $table->unsignedSmallInteger('gagang_hidung')->nullable()->after('lebar_lensa');
            $table->unsignedSmallInteger('panjang_gagang')->nullable()->after('gagang_hidung');
        });
    }

    public function down(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->dropColumn(['lebar_lensa', 'gagang_hidung', 'panjang_gagang']);
        });
    }
};
