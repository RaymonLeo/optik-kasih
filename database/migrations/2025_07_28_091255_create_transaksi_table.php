<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();

            $table->foreignId('pasien_id')->constrained('pasien')->cascadeOnDelete();
            $table->foreignId('produk_id')->nullable()->constrained('produk')->nullOnDelete();
            $table->foreignId('kesehatan_id')->nullable()->constrained('kesehatan')->nullOnDelete();

            $table->foreignId('lensa_id')->nullable()
                ->constrained(table: 'lensa', column: 'id_lensa')->nullOnDelete();

            $table->date('tanggal_pesan')->nullable();
            $table->date('tanggal_masuk')->nullable();
            $table->date('tanggal_selesai')->nullable();

            $table->string('lensa_pelanggan')->nullable();
            $table->string('gagang_pelanggan')->nullable();

            $table->decimal('harga', 12, 2);
            $table->decimal('panjar', 12, 2)->default(0);
            $table->decimal('sisa', 12, 2)->default(0);

            $table->timestamps();

            $table->index('pasien_id');
            $table->index('tanggal_pesan');
        });
    }

    public function down(): void {
        Schema::dropIfExists('transaksi');
    }
};
