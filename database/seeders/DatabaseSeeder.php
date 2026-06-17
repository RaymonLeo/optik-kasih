<?php

// appV1.0 Rev 1 - Seed akun superadmin Optik Kasih tanpa menimpa password yang sudah diubah.

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
            'email' => env('SUPER_ADMIN_EMAIL', 'optikasih@gmail.com'),
        ]);

        if (! $superAdmin->exists) {
            $superAdmin->password = Hash::make(env('SUPER_ADMIN_INITIAL_PASSWORD', 'rahasia'));
        }

        $superAdmin->name = env('SUPER_ADMIN_NAME', 'Optik Kasih');
        $superAdmin->role = 'super_admin';
        $superAdmin->email_verified_at ??= now();
        $superAdmin->save();
    }
}
