// Haftalik to'lov — hisoblangan va hali TO'LANMAGAN barcha ballni yig'ib,
// so'mga o'tkazadi va `salaries`ga 'bonus'/'shtraf' yozuvi qo'shadi.
//
// Nega davr bo'yicha emas, "to'lanmagan hamma ball": sifat bahosi 14 kunlik
// oyna yopilgandan keyin yoziladi, ya'ni o'tgan haftaning sifat ballari shu
// hafta hali tayyor emas. Agar to'lov qat'iy "shu hafta" bilan cheklansa,
// kechikkan ballar hech qachon to'lanmay qolardi. Shuning uchun har to'lov
// "pishib yetgan hamma ballni" oladi — hech narsa yo'qolmaydi, ikki marta
// ham to'lanmaydi (payout_salary_id belgilanadi).

import supabase from '@/lib/supabaseClient';
import { POINTS_SOM_PER_BALL, POINTS_MAX_PERCENT_OF_EARNED } from './config';

export interface LedgerRowForPayout {
  id: number;
  worker_id: number;
  points: number;
}

export interface WorkerPayoutResult {
  worker_id: number;
  net_points: number;
  earned_som: number;
  raw_som: number;
  final_som: number;
  capped: boolean;
  method?: 'bonus' | 'shtraf';
  salary_id?: number;
  ledger_ids: number[];
}

export interface PayoutOptions {
  somPerBall?: number;
  /** 0 = chegara yo'q */
  maxPercentOfEarned?: number;
  /** Chegara hisoblash uchun; chegara 0 bo'lsa ishlatilmaydi */
  earnedByWorker?: Map<number, number>;
}

/**
 * Sof hisob-kitob — bazaga tegmaydi, shuning uchun testlanadi.
 * Pul bilan ishlaydigan yagona joy shu bo'lgani uchun ataylab ajratilgan.
 */
export function computePayouts(
  rows: LedgerRowForPayout[],
  opts: PayoutOptions = {},
): WorkerPayoutResult[] {
  const somPerBall = opts.somPerBall ?? POINTS_SOM_PER_BALL;
  const maxPercent = opts.maxPercentOfEarned ?? POINTS_MAX_PERCENT_OF_EARNED;
  const earned = opts.earnedByWorker ?? new Map<number, number>();

  const byWorker = new Map<number, { points: number; ledgerIds: number[] }>();
  for (const row of rows) {
    const wid = Number(row.worker_id);
    if (!Number.isFinite(wid)) continue;
    const cur = byWorker.get(wid) || { points: 0, ledgerIds: [] };
    cur.points += Number(row.points) || 0;
    cur.ledgerIds.push(row.id);
    byWorker.set(wid, cur);
  }

  const results: WorkerPayoutResult[] = [];
  for (const [workerId, agg] of byWorker) {
    const earnedSom = earned.get(workerId) || 0;
    const rawSom = agg.points * somPerBall;

    let finalSom = rawSom;
    let capped = false;
    if (maxPercent > 0) {
      const cap = Math.abs(earnedSom) * (maxPercent / 100);
      finalSom = Math.max(-cap, Math.min(cap, rawSom));
      capped = finalSom !== rawSom;
    }
    finalSom = Math.round(finalSom);

    results.push({
      worker_id: workerId,
      net_points: agg.points,
      earned_som: earnedSom,
      raw_som: rawSom,
      final_som: finalSom,
      capped,
      method: finalSom === 0 ? undefined : finalSom > 0 ? 'bonus' : 'shtraf',
      ledger_ids: agg.ledgerIds,
    });
  }

  return results.sort((a, b) => b.final_som - a.final_som);
}

/**
 * Haftalik to'lov. `dryRun=true` bo'lsa hech narsa yozilmaydi — faqat
 * hisob-kitob qaytariladi (birinchi marta tekshirish uchun).
 */
export async function runPayout(dryRun = false): Promise<{
  results: WorkerPayoutResult[];
  totalBonus: number;
  totalShtraf: number;
}> {
  const { data: ledgerRows, error: ledgerErr } = await supabase
    .from('points_ledger')
    .select('id, worker_id, points')
    .is('payout_salary_id', null);
  if (ledgerErr) throw new Error(`points_ledger o'qishda xato: ${ledgerErr.message}`);

  const rows = (ledgerRows || []) as LedgerRowForPayout[];
  if (rows.length === 0) return { results: [], totalBonus: 0, totalShtraf: 0 };

  // Chegara o'chirilgan bo'lsa (standart holat) ishlab topganni umuman
  // hisoblamaymiz — ortiqcha so'rov qilmaslik uchun.
  let earnedByWorker: Map<number, number> | undefined;
  if (POINTS_MAX_PERCENT_OF_EARNED > 0) {
    earnedByWorker = await loadEarnedByWorker(rows.map((r) => Number(r.worker_id)));
  }

  const results = computePayouts(rows, { earnedByWorker });
  const todayIso = new Date().toISOString().slice(0, 10);

  let totalBonus = 0;
  let totalShtraf = 0;

  for (const r of results) {
    if (!r.method) continue;
    if (r.method === 'bonus') totalBonus += Math.abs(r.final_som);
    else totalShtraf += Math.abs(r.final_som);

    if (dryRun) continue;

    const comment =
      `Avtomatik ball tizimi (haftalik): ` +
      `${r.net_points >= 0 ? '+' : ''}${r.net_points} ball × ${POINTS_SOM_PER_BALL} so'm`;

    const { data: inserted, error: insErr } = await supabase
      .from('salaries')
      .insert([{ worker_id: r.worker_id, amount: Math.abs(r.final_som), method: r.method, date: todayIso, comment }])
      .select('id')
      .single();
    if (insErr) throw new Error(`salaries yozishda xato (xodim ${r.worker_id}): ${insErr.message}`);
    r.salary_id = inserted?.id;

    // Faqat shu xodimning qatorlari to'langan deb belgilanadi. Xato bo'lsa
    // qolgan xodimlar keyingi haftada baribir to'lanadi (ball yo'qolmaydi).
    const { error: updErr } = await supabase
      .from('points_ledger')
      .update({ payout_salary_id: inserted?.id })
      .in('id', r.ledger_ids);
    if (updErr) throw new Error(`points_ledger yangilashda xato (xodim ${r.worker_id}): ${updErr.message}`);
  }

  return { results, totalBonus, totalShtraf };
}

// Chegara yoqilgan bo'lsa kerak bo'ladi: xodimning oxirgi 30 kunda ishlab topgani.
async function loadEarnedByWorker(workerIds: number[]): Promise<Map<number, number>> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('orders')
    .select('services')
    .gte('sana', since)
    .limit(3000);
  if (error) throw new Error(`buyurtmalarni o'qishda xato: ${error.message}`);

  const wanted = new Set(workerIds);
  const earned = new Map<number, number>();
  for (const o of data || []) {
    for (const s of (o.services || []) as Array<{ workerId?: number; zarplata?: number }>) {
      const wid = Number(s?.workerId);
      if (!wanted.has(wid)) continue;
      earned.set(wid, (earned.get(wid) || 0) + (Number(s.zarplata) || 0));
    }
  }
  return earned;
}
