<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable; // ⬅️ Tidak implements MustVerifyEmail

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'branch_phone',
        'branch_operational_hours',
        'branch_address',
    ];

    public function produk() { return $this->hasMany(Produk::class, 'admin_id'); }
    public function lensa() { return $this->hasMany(Lensa::class, 'admin_id'); }
    public function transaksi() { return $this->hasMany(Transaksi::class, 'admin_id'); }
    public function pengeluaran() { return $this->hasMany(Pengeluaran::class, 'admin_id'); }
    public function activityLogs() { return $this->hasMany(ActivityLog::class); }
    protected $hidden = ['password','remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
