<?php

namespace App\Mail;

use App\Models\FocusSession;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FocusSessionCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly FocusSession $session,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🍅 Focus Session Complete — Great work!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.focus-session-completed',
        );
    }
}
