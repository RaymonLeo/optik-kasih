<?php

// appV1.0 Rev 2 - Notifikasi email untuk perubahan sensitif akun Optik Kasih.

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountSecurityNotification extends Notification
{
    /**
     * @param  array<string, string>  $details
     */
    public function __construct(
        private readonly string $subject,
        private readonly string $message,
        private readonly array $details = [],
    ) {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->subject)
            ->greeting('Halo '.$notifiable->name.',')
            ->line($this->message);

        foreach ($this->details as $label => $value) {
            $mail->line($label.': '.$value);
        }

        return $mail
            ->line('Jika perubahan ini bukan Anda yang melakukan, segera reset password dan periksa akses akun.')
            ->action('Buka Optik Kasih', url('/login'))
            ->line('Terima kasih.');
    }
}
