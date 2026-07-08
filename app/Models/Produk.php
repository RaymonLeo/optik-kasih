<?php

// appV1.0 Rev 10 - Format cast tanggal jadi Y-m-d supaya JSON tidak keluar sebagai ISO datetime mentah.

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produk extends Model
{
    protected $table = 'produk';

    /** Samakan dengan kolom di migration (bukan jenis_produk/stok_produk) */
    protected $fillable = [
        'nama_produk',
        'kategori_produk',
        'brand_produk',
        'warna_produk',
        'diameter_produk',
        'bahan_produk',
        'minus_produk',
        'jumlah_produk',
        'harga_produk',
        'gambar_produk',
        'deskripsi_produk',
        'tanggal_masuk',
        'expired_produk',
        'admin_id',
        'lebar_lensa',
        'gagang_hidung',
        'panjang_gagang',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    protected $casts = [
        'jumlah_produk' => 'integer',
        'harga_produk'  => 'decimal:2',
        'tanggal_masuk'=> 'date:Y-m-d',
        'expired_produk'=> 'date:Y-m-d',
    ];

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'produk_id')->orderBy('sort_order')->orderBy('id');
    }

    /** Contoh scope stok menipis */
    public function scopeLowStock($q, int $threshold = 0)
    {
        return $q->where('jumlah_produk', '<=', $threshold);
    }
}
