<?php

// appV1.0 Rev 4 - Inbox notifikasi internal untuk admin dan superadmin.

namespace App\Http\Controllers;

use App\Models\SystemNotification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => SystemNotification::query()
                ->where('recipient_id', auth()->id())
                ->latest()
                ->paginate(20)
                ->withQueryString(),
        ]);
    }

    public function markRead(SystemNotification $notification): RedirectResponse
    {
        abort_unless($notification->recipient_id === auth()->id(), 403);

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return back();
    }

    public function markAllRead(): RedirectResponse
    {
        SystemNotification::query()
            ->where('recipient_id', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back()->with('success', 'Semua notifikasi telah ditandai dibaca.');
    }
}
