<?php

// appV1.0 Rev 2 - Perubahan password mengirim notifikasi keamanan ke email akun.

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\AccountSecurityNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Throwable;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()->role === 'super_admin', 403);

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        try {
            $user->notify(new AccountSecurityNotification(
                $user->role === 'super_admin'
                    ? 'Password Superadmin Optik Kasih Diubah'
                    : 'Password Akun Optik Kasih Diubah',
                'Password akun Anda baru saja diubah melalui halaman profil.',
                [
                    'Waktu perubahan' => now()->format('d/m/Y H:i:s'),
                ],
            ));
        } catch (Throwable $exception) {
            report($exception);
        }

        return back();
    }
}
