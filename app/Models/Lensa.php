<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lensa extends Model
{
    protected $table = 'lensa';

    protected $fillable = [
        'nama_lensa', 'jenis_lensa', 'coating_lensa', 'indeks_lensa',
        'cyl_kanan', 'axis_kanan', 'prism_kanan', 'base_kanan', 'add_kanan',
        'sph_kiri', 'cyl_kiri', 'axis_kiri', 'prism_kiri', 'base_kiri'
    ];

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class);
    }
}
