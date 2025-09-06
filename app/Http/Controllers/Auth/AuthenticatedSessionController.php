<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Tampilkan halaman login (tanpa status verifikasi).
     */
    public function create(): Response
    {
        // Buang sisa flash 'status' lama supaya tidak ikut tampil.
        session()->forget('status');

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            // 'status' => session('status'),  // ⬅️ HAPUS baris ini
        ]);
    }

    /**
     * Proses login.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Logout.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
