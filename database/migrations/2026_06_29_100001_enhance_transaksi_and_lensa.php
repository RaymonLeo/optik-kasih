<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── Tambah kolom status & kategori ke transaksi ─────────────────────
        Schema::table('transaksi', function (Blueprint $table) {
            // Kategori transaksi: kacamata | produk_lainnya | resep
            $table->string('kategori_transaksi', 20)->nullable()->after('admin_id');

            // Status pembayaran
            $table->string('status_pembayaran', 20)->default('lunas')->after('sisa');

            // Status kacamata (null jika bukan transaksi kacamata)
            $table->string('status_kacamata', 20)->nullable()->after('status_pembayaran');

            // Status pengambilan
            $table->string('status_pengambilan', 20)->default('belum_diambil')->after('status_kacamata');

            // Jumlah per metode pembayaran (untuk kasus split payment)
            $table->decimal('jumlah_bayar_1', 15, 2)->nullable()->after('metode_pembayaran_2');
            $table->decimal('jumlah_bayar_2', 15, 2)->nullable()->after('jumlah_bayar_1');
        });

        // Backfill status_pembayaran dari data existing (jika sisa = 0 → lunas, else → panjar)
        DB::statement("
            UPDATE transaksi
            SET status_pembayaran = CASE
                WHEN sisa IS NULL OR sisa = 0 THEN 'lunas'
                ELSE 'panjar'
            END
        ");

        // Backfill kategori_transaksi dari data existing
        DB::statement("
            UPDATE transaksi
            SET kategori_transaksi = CASE
                WHEN produk_id IS NOT NULL THEN 'produk_lainnya'
                ELSE 'kacamata'
            END
        ");

        // ── Tambah is_pesanan ke lensa ────────────────────────────────────────
        Schema::table('lensa', function (Blueprint $table) {
            $table->boolean('is_pesanan')->default(false)->after('stok_lensa');
            $table->string('nama_pesanan', 255)->nullable()->after('is_pesanan');
        });
    }

    public function down(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropColumn([
                'kategori_transaksi', 'status_pembayaran', 'status_kacamata',
                'status_pengambilan', 'jumlah_bayar_1', 'jumlah_bayar_2',
            ]);
        });

        Schema::table('lensa', function (Blueprint $table) {
            $table->dropColumn(['is_pesanan', 'nama_pesanan']);
        });
    }
};
