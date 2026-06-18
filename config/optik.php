<?php

// appV1.0 Rev 2 - Konfigurasi identitas inti Optik Kasih dan akun superadmin.

return [
    'super_admin' => [
        'name' => env('SUPER_ADMIN_NAME', 'Optik Kasih'),
        'email' => env('SUPER_ADMIN_EMAIL', 'optikasih@gmail.com'),
        'initial_password' => env('SUPER_ADMIN_INITIAL_PASSWORD', 'rahasia'),
    ],
];
