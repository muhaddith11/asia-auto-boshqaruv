import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing in ENV' }, { status: 500 });
  }

  // Detect host for dynamic URLs (e.g., asiaautoservice.com)
  const host = req.headers.get('host') || 'asiaautoservice.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const webhookUrl = `${protocol}://${host}/api/telegram-webhook`;

  try {
    // Set the webhook to our site's API route
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}&drop_pending_updates=true`);
    const data = await response.json();

    return NextResponse.json({
      ok: data.ok,
      message: `Bot Webhook rejimiga o'tkazildi! URL: ${webhookUrl}`,
      raw: data
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err)
    }, { status: 500 });
  }
}
