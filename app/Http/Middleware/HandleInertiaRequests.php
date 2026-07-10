<?php

// appV1.0 Rev 6 - Wrap DB queries in try-catch agar error DB tidak crash seluruh halaman.

namespace App\Http\Middleware;

use App\Models\DeletionRequest;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'notifications' => fn () => $request->user() ? [
                'unread_count' => (function () use ($request) {
                    try {
                        return SystemNotification::query()
                            ->where('recipient_id', $request->user()->id)
                            ->whereNull('read_at')
                            ->count();
                    } catch (\Throwable $e) {
                        return 0;
                    }
                })(),
            ] : ['unread_count' => 0],
            'approvals' => fn () => $request->user()?->role === 'super_admin' ? [
                'pending_deletion_count' => (function () {
                    try {
                        return DeletionRequest::query()
                            ->where('status', DeletionRequest::PENDING)
                            ->count();
                    } catch (\Throwable $e) {
                        return 0;
                    }
                })(),
            ] : ['pending_deletion_count' => 0],
            'is_impersonating' => fn () => session()->has('impersonating_by'),
            'flash' => fn () => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ];
    }
}
