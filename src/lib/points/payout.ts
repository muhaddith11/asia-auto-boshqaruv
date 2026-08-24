// Oylik to'lov — o'tgan oy uchun har xodimning ball lentasini yig'ib, so'mga
// o'tkazadi va `salaries`ga 'bonus'/'shtraf' yozuvi qo'shadi. `dryRun=true` bo'lsa
// hech narsa yozilmaydi — faqat hisob-kitob natijasi qaytariladi (birinchi oyni
// tekshirish uchun).

import supabase from '@/lib/supabaseClient';
import { tashkentMonthRangeUtc } from './period';
import { POINTS_SOM_PER_BALL, POINTS_MAX_PERCENT_OF_EARNED, BEKOR_HOLAT } from './config';

export interface WorkerPayoutResult {
  worker_id: number;
  net_points: number;
  earned_som: number;
  raw_som: number;
  final_som: number;
  method?: 'bonus' | 'shtraf';
  salary_id?: number;
}

export async function runMonthlyPayout(period: string, dryRun = false): Promise<{ period: string; results: WorkerPayoutResult[] }> {
  const { data: ledgerRows, error: ledgerErr } = await supabase
    .from('points_ledger')
    .select('id, worker_id, points')
    .eq('period', period)
    .is('payout_salary_id', null);
  if (ledgerErr) throw new Error(`points_ledger o'qishda xato: ${ledgerErr.message}`);

  const byWorker = new Map<number, { points: number; ledgerIds: number[] }>();
  for (const row of ledgerRows || []) {
    const wid = Number(row.worker_id);
    const cur = byWorker.get(wid) || { points: 0, ledgerIds: [] };
    cur.points += Number(row.points) || 0;
    cur.ledgerIds.push(row.id);
    byWorker.set(wid, cur);
  }
  if (byWorker.size === 0) return { period, results: [] };

  const { start, end } = tashkentMonthRangeUtc(period);
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('services, sana, holat')
    .neq('holat', BEKOR_HOLAT)
    .gte('sana', start.slice(0, 10))
    .lt('sana', end.slice(0, 10))
    .limit(3000);
  if (ordersErr) throw new Error(`oy uchun buyurtmalarni o'qishda xato: ${ordersErr.message}`);

  const earnedByWorker = new Map<number, number>();
  for (const o of orders || []) {
    for (const s of (o.services || []) as Array<{ workerId?: number; zarplata?: number }>) {
      if (!s.workerId) continue;
      const wid = Number(s.workerId);
      earnedByWorker.set(wid, (earnedByWorker.get(wid) || 0) + (Number(s.zarplata) || 0));
    }
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const results: WorkerPayoutResult[] = [];

  for (const [workerId, agg] of byWorker) {
    const earnedSom = earnedByWorker.get(workerId) || 0;
    const rawSom = agg.points * POINTS_SOM_PER_BALL;
    const cap = Math.abs(earnedSom) * (POINTS_MAX_PERCENT_OF_EARNED / 100);
    const finalSom = Math.round(Math.max(-cap, Math.min(cap, rawSom)));

    const result: WorkerPayoutResult = {
      worker_id: workerId,
      net_points: agg.points,
      earned_som: earnedSom,
      raw_som: rawSom,
      final_som: finalSom,
    };

    if (finalSom === 0) {
      results.push(result);
      continue;
    }

    const method: 'bonus' | 'shtraf' = finalSom > 0 ? 'bonus' : 'shtraf';
    result.method = method;

    if (!dryRun) {
      const comment = `Avtomatik ball tizimi ${period}: ${agg.points >= 0 ? '+' : ''}${agg.points} ball x ${POINTS_SOM_PER_BALL} so'm`;
      const { data: inserted, error: insErr } = await supabase
        .from('salaries')
        .insert([{ worker_id: workerId, amount: Math.abs(finalSom), method, date: todayIso, comment }])
        .select('id')
        .single();
      if (insErr) throw new Error(`salaries yozishda xato (xodim ${workerId}): ${insErr.message}`);
      result.salary_id = inserted?.id;

      const { error: updErr } = await supabase
        .from('points_ledger')
        .update({ payout_salary_id: inserted?.id })
        .in('id', agg.ledgerIds);
      if (updErr) throw new Error(`points_ledger yangilashda xato (xodim ${workerId}): ${updErr.message}`);
    }

    results.push(result);
  }

  return { period, results };
}
