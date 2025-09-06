<?php

namespace App\Support;

class EmailChecks
{
    /**
     * Cek apakah domain email punya MX record (indikasi bisa menerima email).
     * Jika checkdnsrr tidak tersedia (beberapa Windows), dicoba pakai getmxrr.
     */
    public static function hasMxRecord(string $email): bool
    {
        $at = strrpos($email, '@');
        if ($at === false) {
            return false;
        }

        $domain = substr($email, $at + 1);

        // dev domain: lewati agar tidak menghambat saat lokal
        if (in_array(strtolower($domain), ['localhost', 'example.com'])) {
            return true;
        }

        // checkdnsrr di beberapa sistem butuh titik di akhir domain
        $d = rtrim($domain, '.') . '.';

        if (function_exists('checkdnsrr')) {
            if (checkdnsrr($d, 'MX') || checkdnsrr($d, 'A') || checkdnsrr($d, 'AAAA')) {
                return true;
            }
        }

        if (function_exists('getmxrr')) {
            $mx = [];
            if (getmxrr($domain, $mx) && count($mx) > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Saring domain disposable (sekedar daftar singkat; tambah sendiri jika perlu)
     */
    public static function isDisposable(string $email): bool
    {
        $at = strrpos($email, '@');
        if ($at === false) return true;

        $domain = strtolower(substr($email, $at + 1));

        $blocked = [
            'mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com',
            'trashmail.com','yopmail.com','sharklasers.com','dispostable.com',
        ];

        return in_array($domain, $blocked, true);
    }
}
