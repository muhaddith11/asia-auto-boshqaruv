import { NextResponse } from 'next/server';
import { runDailyScoring } from '@/lib/points/scorer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Ballarni QO'LDA hisoblash — boshqaruv panelidagi tugma shu yerga murojaat qiladi.
//
// Cron'dan farqi: bu yerda CRON_SECRET kerak emas, chunki /api/points proxy
// himoyasi ostida (PUBLIC_API_PREFIXES ro'yxatida yo'q) — faqat tizimga kirgan
// foydalanuvchi chaqira oladi.
//
// Nega kerak: Vercel cron'i ishlamay qolsa ham egasi ballni yangilay olsin.
// Hisoblash idempotent — bir ishni ikki marta yozmaydi, xohlagancha bosish mumkin.
export async function POST() {
  try {
    const result = await runDailyScoring();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('points recalculate xatosi:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
