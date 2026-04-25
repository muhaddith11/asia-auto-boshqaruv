import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  if (!token) {
    return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing in ENV' }, { status: 500 });
  }

  try {
    if (action === 'delete') {
      const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);
      const data = await response.json();
      return NextResponse.json({
        ok: data.ok,
        message: 'Bot Polling rejimiga qaytarildi (Webhook o\'chirildi).',
        raw: data
      });
    }

    // Default: Set Webhook
    const host = req.headers.get('host') || 'asiaautobot.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const webhookUrl = `${protocol}://${host}/api/telegram-webhook`;

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
