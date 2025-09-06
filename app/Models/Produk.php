<?php

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
        'jumlah_produk',
        'harga_produk',
        'gambar_produk',
        'expired_produk',
    ];

    protected $casts = [
        'jumlah_produk' => 'integer',
        'harga_produk'  => 'decimal:2',
        'expired_produk'=> 'date',
    ];

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    /** Contoh scope stok menipis */
    public function scopeLowStock($q, int $threshold = 0)
    {
        return $q->where('jumlah_produk', '<=', $threshold);
    }
}
