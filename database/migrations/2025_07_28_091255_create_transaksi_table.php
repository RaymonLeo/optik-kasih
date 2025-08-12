<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();

            $table->foreignId('pasien_id')->constrained('pasien')->onDelete('cascade');
            $table->foreignId('produk_id')->constrained('produk')->onDelete('cascade');
            $table->foreignId('kesehatan_id')->nullable()->constrained('kesehatan')->onDelete('cascade');

            // ✅ Perbaikan untuk foreign key lensa_id
            $table->unsignedBigInteger('lensa_id')->nullable();
            $table->foreign('lensa_id')->references('id_lensa')->on('lensa')->onDelete('cascade');

            $table->date('tanggal_pesan')->nullable();
            $table->date('tanggal_masuk')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->string('lensa_pelanggan')->nullable();
            $table->string('gagang_pelanggan')->nullable();
            $table->decimal('harga', 12, 2);
            $table->decimal('panjar', 12, 2)->default(0);
            $table->decimal('sisa', 12, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('transaksi');
    }
};
