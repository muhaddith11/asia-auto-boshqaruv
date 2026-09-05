import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { tashkentPeriod } from '@/lib/points/period';
import { POINTS_SOM_PER_BALL } from '@/lib/points/config';

export const dynamic = 'force-dynamic';

// Boshliq uchun — davr bo'yicha HAR xodimning ball tafsiloti (faqat o'qish).
// Xodim botda faqat O'ZINI ko'radi (bot-ui/points); bu esa boshqaruv panelida
// boshliqqa hammani bir joyda ko'rsatadi: kim yutmoqda, kim yo'qotmoqda va nega.
// Pulga tegmaydi — payout alohida (weekly-points-payout).

interface LedgerRow {
  worker_id: number;
  category: 'speed' | 'quality';
  points: number;
  reason: string;
  service_nom: string | null;
  order_id: number;
  detail: Record<string, unknown> | null;
  payout_salary_id: number | null;
  computed_at: string;
}

interface WorkerAgg {
  worker_id: number;
  ism: string | null;
  net: number;
  speed: number;
  quality: number;
  bonusPoints: number;
  penaltyPoints: number;
  bonusLines: number;
  penaltyLines: number;
  lineCount: number;
  unpaidPoints: number;
  rows: LedgerRow[];
}

export async function GET(req: NextRequest) {
  try {
    const period =
      new URL(req.url).searchParams.get('period') || tashkentPeriod(new Date().toISOString());

    const { data: rows, error } = await supabase
      .from('points_ledger')
      .select(
        'worker_id, category, points, reason, service_nom, order_id, detail, payout_salary_id, computed_at',
      )
      .eq('period', period)
      .order('computed_at', { ascending: false })
      .limit(5000);
    if (error) throw new Error(error.message);

    const { data: workers, error: wErr } = await supabase.from('workers').select('id, ism');
    if (wErr) throw new Error(wErr.message);
    const nameById = new Map<number, string>(
      (workers || []).map((w: { id: number; ism: string }) => [Number(w.id), w.ism]),
    );

    const byWorker = new Map<number, WorkerAgg>();
    for (const r of (rows || []) as LedgerRow[]) {
      const wid = Number(r.worker_id);
      let agg = byWorker.get(wid);
      if (!agg) {
        agg = {
          worker_id: wid,
          ism: nameById.get(wid) ?? null,
          net: 0,
          speed: 0,
          quality: 0,
          bonusPoints: 0,
          penaltyPoints: 0,
          bonusLines: 0,
          penaltyLines: 0,
          lineCount: 0,
          unpaidPoints: 0,
          rows: [],
        };
        byWorker.set(wid, agg);
      }
      const p = Number(r.points) || 0;
      agg.net += p;
      if (r.category === 'speed') agg.speed += p;
      else if (r.category === 'quality') agg.quality += p;
      if (p > 0) {
        agg.bonusPoints += p;
        agg.bonusLines++;
      } else if (p < 0) {
        agg.penaltyPoints += p;
        agg.penaltyLines++;
      }
      agg.lineCount++;
      if (r.payout_salary_id == null) agg.unpaidPoints += p;
      agg.rows.push(r);
    }

    const workersAgg = Array.from(byWorker.values()).sort((a, b) => b.net - a.net);
    const totals = workersAgg.reduce(
      (t, w) => {
        t.net += w.net;
        t.bonus += w.bonusPoints;
        t.penalty += w.penaltyPoints;
        t.unpaid += w.unpaidPoints;
        return t;
      },
      { net: 0, bonus: 0, penalty: 0, unpaid: 0 },
    );

    return NextResponse.json({
      ok: true,
      period,
      somPerBall: POINTS_SOM_PER_BALL,
      workers: workersAgg,
      totals,
    });
  } catch (err) {
    console.error('points summary GET xatosi:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
