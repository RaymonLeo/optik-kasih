<?php

// appV1.0 Rev 2 - Tambah status pembayaran, kacamata, pengambilan, kategori transaksi, dan split payment.

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    protected $table = 'transaksi';

    protected $fillable = [
        'pasien_id', 'produk_id', 'kesehatan_id', 'lensa_id',
        'kategori_transaksi',
        'tanggal_pesan', 'tanggal_masuk', 'tanggal_selesai',
        'lensa_pelanggan', 'gagang_pelanggan',
        'harga', 'panjar', 'sisa',
        'status_pembayaran', 'status_kacamata', 'status_pengambilan',
        'admin_id', 'metode_pembayaran_1', 'metode_pembayaran_2',
        'jumlah_bayar_1', 'jumlah_bayar_2',
    ];

    protected $casts = [
        'tanggal_pesan'   => 'date',
        'tanggal_masuk'   => 'date',
        'tanggal_selesai' => 'date',
        'harga'           => 'decimal:2',
        'panjar'          => 'decimal:2',
        'sisa'            => 'decimal:2',
        'jumlah_bayar_1'  => 'decimal:2',
        'jumlah_bayar_2'  => 'decimal:2',
    ];

    // Status constants
    const STATUS_PANJAR   = 'panjar';
    const STATUS_LUNAS    = 'lunas';
    const STATUS_BELUM    = 'belum_selesai';
    const STATUS_SELESAI  = 'sudah_selesai';
    const STATUS_DIAMBIL  = 'sudah_diambil';
    const STATUS_BLM_AMBIL = 'belum_diambil';

    // Kategori
    const KAT_KACAMATA   = 'kacamata';
    const KAT_PRODUK     = 'produk_lainnya';
    const KAT_RESEP      = 'resep';

    public function pasien()    { return $this->belongsTo(Pasien::class); }
    public function produk()    { return $this->belongsTo(Produk::class); }
    public function kesehatan() { return $this->belongsTo(Kesehatan::class); }
    public function lensa()     { return $this->belongsTo(Lensa::class, 'lensa_id', 'id_lensa'); }
    public function admin()     { return $this->belongsTo(User::class, 'admin_id'); }

    // Transaction is "done" when: lunas + sudah_diambil + (not kacamata OR kacamata sudah_selesai)
    public function isDone(): bool
    {
        if ($this->status_pembayaran !== self::STATUS_LUNAS) return false;
        if ($this->status_pengambilan !== self::STATUS_DIAMBIL) return false;
        if ($this->kategori_transaksi === self::KAT_KACAMATA
            && $this->status_kacamata !== self::STATUS_SELESAI) return false;
        return true;
    }
}
