import { NextRequest, NextResponse } from 'next/server';
import { requireSection } from '@/lib/routeGuard';
import { TELEGRAM_WEBHOOK_URL, telegramWebhookSecret } from '@/lib/telegramAuth';

export const dynamic = 'force-dynamic';

// Telegram'ga webhook manzili va maxfiy kalitini bildiradi (deploydan keyin bir marta ochiladi).
export async function GET(req: NextRequest) {
  const guard = await requireSection(req, 'backup');
  if (guard.denied) return guard.denied;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing in ENV' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: TELEGRAM_WEBHOOK_URL, secret_token: telegramWebhookSecret(token) }),
    });
    const data = await response.json();

    return NextResponse.json({
      ok: data.ok,
      message: `Bot Webhook rejimiga o'tkazildi! URL: ${TELEGRAM_WEBHOOK_URL}`,
      raw: data
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err)
    }, { status: 500 });
  }
}
