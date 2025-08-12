<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kesehatan extends Model
{
    protected $table = 'kesehatan';

    protected $fillable = [
        'pasien_id',
        'tanggal_periksa',
        'sph_kanan', 'cyl_kanan', 'axis_kanan', 'prism_kanan', 'base_kanan', 'add_kanan', 'pd_kanan',
        'sph_kiri', 'cyl_kiri', 'axis_kiri', 'prism_kiri', 'base_kiri', 'add_kiri', 'pd_kiri',
    ];

    public function pasien()
    {
        return $this->belongsTo(Pasien::class);
    }
}
