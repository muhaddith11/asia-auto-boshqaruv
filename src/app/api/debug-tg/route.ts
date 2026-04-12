import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();
    return NextResponse.json({ ok: true, webhookInfo: data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
