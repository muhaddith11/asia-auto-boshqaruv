import { NextRequest, NextResponse } from 'next/server';
import { runPayout } from '@/lib/points/payout';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

// Haftalik: hisoblangan va hali to'lanmagan barcha ballni yig'ib, salaries'ga
// 'bonus'/'shtraf' yozadi. `?dryRun=1` — hech narsa yozmasdan faqat hisob-kitob
// (birinchi marta tekshirish uchun SHUNI ishlating).
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  try {
    const dryRun = new URL(req.url).searchParams.get('dryRun') === '1';
    const result = await runPayout(dryRun);
    return NextResponse.json({ ok: true, dryRun, ...result });
  } catch (err) {
    console.error('weekly-points-payout cron xatosi:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
