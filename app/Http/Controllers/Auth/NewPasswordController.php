<?php

// appV1.0 Rev 2 - Reset password via email mengirim notifikasi keamanan setelah berhasil.

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\AccountSecurityNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class NewPasswordController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required','email'],
            'password' => ['required', 'confirmed', 'max:12', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email','password','password_confirmation','token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));

                try {
                    $user->notify(new AccountSecurityNotification(
                        $user->role === 'super_admin'
                            ? 'Password Superadmin Optik Kasih Direset'
                            : 'Password Akun Optik Kasih Direset',
                        'Password akun Anda baru saja direset menggunakan link yang dikirim melalui email.',
                        [
                            'Waktu reset' => now()->format('d/m/Y H:i:s'),
                        ],
                    ));
                } catch (Throwable $exception) {
                    report($exception);
                }
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
