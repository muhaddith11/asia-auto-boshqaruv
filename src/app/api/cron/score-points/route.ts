import { NextRequest, NextResponse } from 'next/server';
import { runDailyScoring } from '@/lib/points/scorer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

// Kunlik: yangi shart bajargan (tezlik) / oynasi yopilgan (sifat) ish
// qatorlarini points_ledger'ga yozadi. Pul harakatlanmaydi, faqat auditga yozadi.
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  try {
    const result = await runDailyScoring();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('score-points cron xatosi:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
