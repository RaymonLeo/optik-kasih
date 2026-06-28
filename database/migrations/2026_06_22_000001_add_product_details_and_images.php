<?php

// appV1.0 Rev 6 - Deskripsi dan galeri multi-gambar untuk katalog produk publik.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produk', function (Blueprint $table) {
            $table->text('deskripsi_produk')->nullable()->after('gambar_produk');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produk_id')->constrained('produk')->cascadeOnDelete();
            $table->string('path');
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['produk_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');

        Schema::table('produk', function (Blueprint $table) {
            $table->dropColumn('deskripsi_produk');
        });
    }
};
