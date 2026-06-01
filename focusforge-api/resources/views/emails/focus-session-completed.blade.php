<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Focus Session Complete</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
        .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #4f46e5; padding: 32px 40px; text-align: center; }
        .header h1 { color: #fff; font-size: 22px; margin: 0; font-weight: 700; }
        .header p { color: #c7d2fe; margin: 6px 0 0; font-size: 14px; }
        .body { padding: 36px 40px; }
        .stat-row { display: flex; gap: 16px; margin: 24px 0; }
        .stat { flex: 1; background: #f1f5f9; border-radius: 10px; padding: 16px; text-align: center; }
        .stat .value { font-size: 24px; font-weight: 700; color: #4f46e5; }
        .stat .label { font-size: 12px; color: #64748b; margin-top: 4px; }
        .cta { display: block; margin: 28px 0 0; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; padding: 14px 24px; text-align: center; font-weight: 600; font-size: 15px; }
        .footer { padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍅 Focus Session Complete!</h1>
            <p>Great work, {{ $user->name }}!</p>
        </div>
        <div class="body">
            <p>You just completed a focus session. Here's a summary of what you accomplished:</p>

            <div class="stat-row">
                <div class="stat">
                    <div class="value">{{ $session->duration_minutes }}m</div>
                    <div class="label">Duration</div>
                </div>
                <div class="stat">
                    <div class="value">{{ ucfirst($session->type) }}</div>
                    <div class="label">Type</div>
                </div>
                <div class="stat">
                    <div class="value">{{ $session->completed ? '✅' : '⚠️' }}</div>
                    <div class="label">{{ $session->completed ? 'Completed' : 'Abandoned' }}</div>
                </div>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Keep up the momentum! Consistent focus sessions are the foundation of deep learning and high productivity.
                Check your analytics to see your progress over time.
            </p>

            <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}/analytics" class="cta">
                View My Analytics →
            </a>
        </div>
        <div class="footer">
            FocusForge AI · <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}" style="color: #6366f1;">focusforgeai.com</a>
        </div>
    </div>
</body>
</html>
