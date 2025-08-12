<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    protected $table = 'produk';

    protected $fillable = ['nama_produk', 'jenis_produk', 'stok_produk', 'harga_produk'];

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class);
    }
}
