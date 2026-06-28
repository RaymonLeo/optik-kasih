<?php

// appV1.0 Rev 5 - Tambah branch_map_link untuk embed peta Google Maps cabang.

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'branch_description',
        'branch_map_link',
    ];

    public function produk(): HasMany { return $this->hasMany(Produk::class, 'admin_id'); }
    public function lensa(): HasMany { return $this->hasMany(Lensa::class, 'admin_id'); }
    public function transaksi(): HasMany { return $this->hasMany(Transaksi::class, 'admin_id'); }
    public function pengeluaran(): HasMany { return $this->hasMany(Pengeluaran::class, 'admin_id'); }
    public function activityLogs(): HasMany { return $this->hasMany(ActivityLog::class); }
    public function branchPhotos(): HasMany { return $this->hasMany(BranchPhoto::class, 'admin_id'); }
    public function deletionRequests(): HasMany { return $this->hasMany(DeletionRequest::class, 'requester_id'); }
    public function systemNotifications(): HasMany { return $this->hasMany(SystemNotification::class, 'recipient_id'); }
    protected $hidden = ['password','remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
