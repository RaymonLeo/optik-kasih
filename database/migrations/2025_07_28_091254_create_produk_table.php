<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('produk', function (Blueprint $table) {
            $table->id();
            $table->string('nama_produk');
            $table->string('kategori_produk');
            $table->unsignedInteger('jumlah_produk')->default(0);
            $table->decimal('harga_produk', 12, 2);
            $table->string('gambar_produk')->nullable();
            $table->date('expired_produk')->nullable();
            $table->timestamps();

            // Index dasar
            $table->index('nama_produk');
            $table->index('kategori_produk');
        });
    }

    public function down(): void {
        Schema::dropIfExists('produk');
    }
};
