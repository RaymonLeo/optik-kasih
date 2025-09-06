<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kesehatan extends Model
{
    protected $table = 'kesehatan';

    protected $fillable = [
        'pasien_id',
        'tanggal_periksa',
        'sph_kanan','cyl_kanan','axis_kanan','prism_kanan','base_kanan','add_kanan','pd_kanan',
        'sph_kiri','cyl_kiri','axis_kiri','prism_kiri','base_kiri','add_kiri','pd_kiri',
    ];

    protected $casts = [
        'tanggal_periksa' => 'date',
    ];

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    public function scopeLatestExam($q)
    {
        return $q->orderByDesc('tanggal_periksa')->orderByDesc('id');
    }
}
