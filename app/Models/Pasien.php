<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Kesehatan;
use App\Models\Transaksi;

class Pasien extends Model
{
    protected $table = 'pasien';

    protected $fillable = [
        'nama_pasien',
        'tanggal_buat',
        'alamat_pasien',
        'nohp_pasien',
        'tanggal_lahir'
    ];

    public function kesehatan()
    {
        return $this->hasMany(Kesehatan::class);
    }

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class);
    }
}
