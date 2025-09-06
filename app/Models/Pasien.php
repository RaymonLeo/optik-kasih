<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pasien extends Model
{
    protected $table = 'pasien';

    protected $fillable = [
        'kode_pasien',      // ⬅️ baru
        'nama_pasien',
        'tanggal_buat',
        'alamat_pasien',
        'nohp_pasien',
        'tanggal_lahir',
    ];

    protected $casts = [
        'tanggal_buat'  => 'date',
        'tanggal_lahir' => 'date',
    ];

    public function kesehatan(): HasMany
    {
        return $this->hasMany(Kesehatan::class);
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    public function lastKesehatan(): HasOne
    {
        return $this->hasOne(Kesehatan::class)->latestOfMany('tanggal_periksa');
    }

    public function scopeSearch($q, ?string $term)
    {
        if (!$term) return $q;
        return $q->where(function ($w) use ($term) {
            $w->where('kode_pasien', 'like', "%{$term}%")   // ⬅️ cari by kode
              ->orWhere('nama_pasien', 'like', "%{$term}%")
              ->orWhere('nohp_pasien', 'like', "%{$term}%");
        });
    }
}
