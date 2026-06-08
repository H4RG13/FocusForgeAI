<?php

namespace App\Mail;

use App\Models\AIGeneration;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AIGenerationCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly AIGeneration $generation,
    ) {}

    public function envelope(): Envelope
    {
        $typeLabel = match($this->generation->type) {
            'summary'    => 'Summary',
            'quiz'       => 'Quiz',
            'study_plan' => 'Study Plan',
            default      => 'AI Generation',
        };

        return new Envelope(
            subject: "✅ Your {$typeLabel} is ready — FocusForge AI",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ai-generation-completed',
        );
    }
}
