<?php

// appV1.0 Rev 2 - Seed akun superadmin Optik Kasih dari konfigurasi pusat tanpa menimpa password yang sudah diubah.

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $superAdmin = User::firstOrNew([
            'email' => config('optik.super_admin.email'),
        ]);

        if (! $superAdmin->exists) {
            $superAdmin->password = Hash::make(config('optik.super_admin.initial_password'));
        }

        $superAdmin->name = config('optik.super_admin.name');
        $superAdmin->role = 'super_admin';
        $superAdmin->email_verified_at ??= now();
        $superAdmin->save();
    }
}
