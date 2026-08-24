import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { identifyWorker } from '@/lib/botWorker';
import { tashkentPeriod } from '@/lib/points/period';

export const dynamic = 'force-dynamic';

// Xodim uchun — o'z ball tarixi, shu oygi jamlanma va shu oy bo'yicha reyting.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const tg = searchParams.get('tg');

    const worker = await identifyWorker(phone, tg);
    if (!worker) {
      return NextResponse.json(
        { ok: false, error: 'Siz tizimda xodim sifatida topilmadingiz.' },
        { status: 403 }
      );
    }

    const { data: history, error } = await supabase
      .from('points_ledger')
      .select('id, order_id, service_nom, category, points, reason, period, computed_at')
      .eq('worker_id', worker.id)
      .order('computed_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('bot-ui points GET xatosi:', error);
      return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
    }

    const currentPeriod = tashkentPeriod(new Date().toISOString());
    const monthPoints = (history || [])
      .filter((r: { period: string }) => r.period === currentPeriod)
      .reduce((s: number, r: { points: number }) => s + Number(r.points), 0);

    // Reyting — shu oy bo'yicha barcha xodimlar orasida (faqat jami ball, boshqa ismlar ko'rsatilmaydi).
    const { data: allRows } = await supabase
      .from('points_ledger')
      .select('worker_id, points')
      .eq('period', currentPeriod);

    const totals = new Map<number, number>();
    (allRows || []).forEach((r: { worker_id: number; points: number }) => {
      const wid = Number(r.worker_id);
      totals.set(wid, (totals.get(wid) || 0) + Number(r.points));
    });
    const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
    const rankIdx = sorted.findIndex(([wid]) => wid === Number(worker.id));

    return NextResponse.json({
      ok: true,
      worker: { id: worker.id, ism: worker.ism },
      period: currentPeriod,
      monthPoints,
      rank: rankIdx >= 0 ? rankIdx + 1 : null,
      totalWorkers: sorted.length,
      history: history || [],
    });
  } catch (err) {
    console.error('bot-ui points API error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
