import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Diagnostika: botning webhook manzili va menyu tugmasi (mini app) URL'ini
// ko'rsatadi — mini app qaysi domenga bog'langanini tekshirish uchun.
// Maxfiy ma'lumot chiqmaydi (token yo'q, faqat URL'lar).
export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN yo\'q' }, { status: 500 });
  }

  const call = async (method: string) => {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { cache: 'no-store' });
      const j = await r.json();
      return j?.result ?? j;
    } catch (e) {
      return { error: String(e) };
    }
  };

  const [webhook, menuButton] = await Promise.all([
    call('getWebhookInfo'),
    call('getChatMenuButton'),
  ]);

  return NextResponse.json({
    calledOnHost: req.headers.get('host'),
    siteUrlEnv: process.env.NEXT_PUBLIC_SITE_URL || null,
    webhook,
    menuButton,
  });
}
