<?php
// appV1.0 Rev 8 - Restructure: hapus kanan/kiri, ganti dengan satu set parameter lensa (sph/cyl/axis/add/prism/base).

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
        'sph_lensa','cyl_lensa','axis_lensa','add_lensa','prism_lensa','base_lensa',
        'admin_id','deskripsi',
        'is_pesanan','nama_pesanan',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->gambar_lensa) return null;
        return asset('storage/'.$this->gambar_lensa);
    }
}
