<?php

// appV1.0 Rev 2 - Profil superadmin terkunci ke email pusat dan mengirim notifikasi perubahan akun.

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Notifications\AccountSecurityNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'isSuperAdmin' => $user->role === 'super_admin',
            'branch' => $user->role === 'admin' ? $user->only([
                'branch_phone',
                'branch_operational_hours',
                'branch_address',
                'branch_description',
                'branch_map_link',
            ]) : null,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $originalName = $user->name;
        $originalEmail = $user->email;

        $user->fill($request->validated());

        $nameChanged = $user->isDirty('name');
        $emailChanged = $user->isDirty('email');

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($user->role === 'super_admin' && ($nameChanged || $emailChanged)) {
            $details = [
                'Waktu perubahan' => now()->format('d/m/Y H:i:s'),
            ];

            if ($nameChanged) {
                $details['Nama sebelumnya'] = $originalName;
                $details['Nama baru'] = $user->name;
            }

            if ($emailChanged) {
                $details['Email sebelumnya'] = $originalEmail;
                $details['Email baru'] = $user->email;
            }

            try {
                $user->notify(new AccountSecurityNotification(
                    'Perubahan Akun Superadmin Optik Kasih',
                    'Data akun superadmin Optik Kasih baru saja diperbarui.',
                    $details,
                ));
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return Redirect::route('profile.edit');
    }

    /**
     * Update the branch display info for the logged-in branch admin (own account only).
     */
    public function updateBranch(Request $request): RedirectResponse
    {
        abort_unless($request->user()->role === 'admin', 403);

        $data = $request->validate([
            'branch_phone' => ['nullable', 'regex:/^(?:0|62)?8\d{8,13}$/'],
            'branch_operational_hours' => ['nullable', 'string', 'max:120'],
            'branch_address' => ['nullable', 'string'],
            'branch_description' => ['nullable', 'string', 'max:2000'],
            'branch_map_link' => ['nullable', 'string', 'max:2000'],
        ]);

        $request->user()->update($data);

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        abort_unless($request->user()->role === 'super_admin', 403);

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
