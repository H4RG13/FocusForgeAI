<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generation Ready</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
        .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 40px; text-align: center; }
        .header h1 { color: #fff; font-size: 22px; margin: 0; font-weight: 700; }
        .header p { color: #ddd6fe; margin: 6px 0 0; font-size: 14px; }
        .body { padding: 36px 40px; }
        .badge { display: inline-block; background: #ede9fe; color: #7c3aed; border-radius: 999px; padding: 4px 14px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .cta { display: block; margin: 28px 0 0; background: #6366f1; color: #fff; text-decoration: none; border-radius: 8px; padding: 14px 24px; text-align: center; font-weight: 600; font-size: 15px; }
        .footer { padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Your AI result is ready!</h1>
            <p>Hey {{ $user->name }}, FocusForge AI just finished processing.</p>
        </div>
        <div class="body">
            @php
                $typeLabel = match($generation->type) {
                    'summary'    => 'Summary',
                    'quiz'       => 'Quiz',
                    'study_plan' => 'Study Plan',
                    default      => 'AI Generation',
                };
                $link = match($generation->type) {
                    'quiz'       => env('FRONTEND_URL', 'http://localhost:3000') . '/notes',
                    'study_plan' => env('FRONTEND_URL', 'http://localhost:3000') . '/ai-chat',
                    default      => env('FRONTEND_URL', 'http://localhost:3000') . '/notes',
                };
            @endphp

            <span class="badge">{{ $typeLabel }}</span>

            <p style="color: #475569; font-size: 15px; line-height: 1.7;">
                Your <strong>{{ strtolower($typeLabel) }}</strong> has been generated and is ready to view.
                Head back to FocusForge AI to see the results and continue your study session.
            </p>

            <a href="{{ $link }}" class="cta">
                View {{ $typeLabel }} →
            </a>
        </div>
        <div class="footer">
            FocusForge AI · <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}" style="color: #6366f1;">focusforgeai.com</a>
        </div>
    </div>
</body>
</html>
