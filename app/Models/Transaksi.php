<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    protected $table = 'transaksi';

    protected $fillable = [
        'pasien_id', 'produk_id', 'kesehatan_id', 'lensa_id',
        'tanggal_pesan', 'tanggal_masuk', 'tanggal_selesai',
        'lensa_pelanggan', 'gagang_pelanggan',
        'harga', 'panjar', 'sisa'
    ];

    protected $casts = [
        'tanggal_pesan'   => 'date',
        'tanggal_masuk'   => 'date',
        'tanggal_selesai' => 'date',
        'harga'  => 'decimal:2',
        'panjar' => 'decimal:2',
        'sisa'   => 'decimal:2',
    ];

    public function pasien()    { return $this->belongsTo(Pasien::class); }
    public function produk()    { return $this->belongsTo(Produk::class); }
    public function kesehatan() { return $this->belongsTo(Kesehatan::class); }
    public function lensa()     { return $this->belongsTo(Lensa::class, 'lensa_id', 'id_lensa'); }
}
