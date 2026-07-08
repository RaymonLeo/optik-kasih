<?php

// appV1.0 Rev 1 - Format cast tanggal jadi Y-m-d supaya JSON tidak keluar sebagai ISO datetime mentah.

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';

    protected $fillable = [
        'admin_id', 'tanggal', 'keterangan', 'jumlah'
    ];

    protected $casts = [
        'tanggal' => 'date:Y-m-d',
        'jumlah' => 'decimal:2',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
