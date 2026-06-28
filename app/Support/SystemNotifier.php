<?php

// appV1.0 Rev 4 - Pengiriman notifikasi internal yang konsisten untuk operasional.

namespace App\Support;

use App\Models\SystemNotification;
use App\Models\User;

class SystemNotifier
{
    public static function toUser(
        User|int $recipient,
        string $type,
        string $title,
        string $message,
        ?string $url = null,
        array $data = [],
    ): void {
        SystemNotification::create([
            'recipient_id' => $recipient instanceof User ? $recipient->id : $recipient,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'data' => $data ?: null,
        ]);
    }

    public static function toSuperAdmins(
        string $type,
        string $title,
        string $message,
        ?string $url = null,
        array $data = [],
    ): void {
        User::query()
            ->where('role', 'super_admin')
            ->pluck('id')
            ->each(fn (int $id) => self::toUser($id, $type, $title, $message, $url, $data));
    }
}
