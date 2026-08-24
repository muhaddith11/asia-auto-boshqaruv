import { NextRequest, NextResponse } from 'next/server';
import { runMonthlyPayout } from '@/lib/points/payout';
import { previousTashkentPeriod } from '@/lib/points/period';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

// Oylik (16-sana): o'tgan oy uchun ball lentasini yig'ib, salaries'ga
// 'bonus'/'shtraf' yozadi. `?period=YYYY-MM&dryRun=1` — qo'lda tekshirish uchun
// (dryRun=1 bo'lsa hech narsa yozilmaydi, faqat hisob-kitob qaytariladi).
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || previousTashkentPeriod();
    const dryRun = searchParams.get('dryRun') === '1';
    const result = await runMonthlyPayout(period, dryRun);
    return NextResponse.json({ ok: true, dryRun, ...result });
  } catch (err) {
    console.error('monthly-points-payout cron xatosi:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
