import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing in ENV' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);
    const data = await response.json();

    return NextResponse.json({
      ok: data.ok,
      message: 'Webhook deleted to enable Polling Mode',
      raw: data
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err)
    }, { status: 500 });
  }
}
