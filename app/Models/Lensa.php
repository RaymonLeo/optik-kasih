<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lensa extends Model
{
    protected $table = 'lensa';
    protected $primaryKey = 'id_lensa';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nama_lensa','jenis_lensa','coating_lensa','indeks_lensa',
        'gambar_lensa','stok_lensa','tanggal_masuk',
        'sph_kanan','cyl_kanan','axis_kanan','prism_kanan','base_kanan','add_kanan',
        'sph_kiri','cyl_kiri','axis_kiri','prism_kiri','base_kiri','add_kiri',
        'admin_id', 'deskripsi'
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // helper kecil
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->gambar_lensa) return null;
        return asset('storage/'.$this->gambar_lensa);
    }
}
