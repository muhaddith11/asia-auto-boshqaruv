// Tezlik (SLA) bahosi — faqat buyurtma darajasidagi vaqt bor (qabul_vaqti/tayyor_vaqti),
// shuning uchun o'z-o'zini moslashtiruvchi NISBIY reyting ishlatiladi: mutlaq "shuncha
// daqiqada tugashi kerak" formulasi emas (buni tasdiqlaydigan ma'lumot yo'q).
//
// Oxirgi 30 kunlik tekshiruvda buyurtmalarning ~62% i 3 daqiqadan kam ichida "tugagan" —
// bu haqiqiy ta'mirlash vaqti emas, xodim ishni tugatib bo'lib botda ketma-ket bosgani.
// Shu sabab POINTS_MIN_DURATION_MINUTES dan tez "tugagan" buyurtmalar reytingga umuman
// kiritilmaydi (neytral, jarima ham, ball ham yo'q).

import { POINTS_MIN_DURATION_MINUTES } from './config';

export interface SpeedOrderInput {
  id: number | string;
  srv: number; // murakkablik proksisi — buyurtma xizmatlar summasi
  durationMin: number; // tayyor_vaqti - qabul_vaqti, daqiqada
}

export interface SpeedVerdict {
  points: number; // +2 | 0 | -2
  reason: 'fast_top_quartile' | 'slow_bottom_quartile' | 'neutral';
  detail: { duration_min: number; percentile: number; tier: 'low' | 'mid' | 'high'; window_n: number };
}

export function isSpeedEligible(params: {
  qabulVaqti?: string | null;
  tayyorVaqti?: string | null;
  holat?: string | null;
  bekorHolat: string;
  minDurationMinutes?: number;
}): boolean {
  const { qabulVaqti, tayyorVaqti, holat, bekorHolat, minDurationMinutes = POINTS_MIN_DURATION_MINUTES } = params;
  if (!qabulVaqti || !tayyorVaqti) return false;
  if (holat === bekorHolat) return false;
  const durationMin = (new Date(tayyorVaqti).getTime() - new Date(qabulVaqti).getTime()) / 60000;
  return durationMin >= minDurationMinutes;
}

function percentileValue(sortedAsc: number[], p: number): number {
  const n = sortedAsc.length;
  if (n === 0) return 0;
  const idx = Math.min(n - 1, Math.floor((p / 100) * n));
  return sortedAsc[idx];
}

function percentileRank(sortedAsc: number[], value: number): number {
  const n = sortedAsc.length;
  if (n <= 1) return 50;
  let below = 0;
  let equal = 0;
  for (const v of sortedAsc) {
    if (v < value) below++;
    else if (v === value) equal++;
  }
  return ((below + equal / 2) / n) * 100;
}

// Berilgan (90 kunlik) oynadagi barcha mos buyurtmalarni murakkablikka (srv) qarab 3
// darajaga bo'lib, har daraja ICHIDA davomiylik persentiliga ko'ra ballaydi — shu bilan
// motor ta'mirini shina tekshiruvi bilan solishtirmaydi.
export function computeSpeedVerdicts(orders: SpeedOrderInput[]): Map<string, SpeedVerdict> {
  const verdicts = new Map<string, SpeedVerdict>();
  if (orders.length === 0) return verdicts;

  const srvSorted = orders.map((o) => o.srv).sort((a, b) => a - b);
  const p33 = percentileValue(srvSorted, 33);
  const p66 = percentileValue(srvSorted, 66);
  const tierOf = (srv: number): 'low' | 'mid' | 'high' => (srv <= p33 ? 'low' : srv <= p66 ? 'mid' : 'high');

  const byTier: Record<'low' | 'mid' | 'high', SpeedOrderInput[]> = { low: [], mid: [], high: [] };
  for (const o of orders) byTier[tierOf(o.srv)].push(o);

  for (const tier of ['low', 'mid', 'high'] as const) {
    const group = byTier[tier];
    const durationsSorted = group.map((o) => o.durationMin).sort((a, b) => a - b);
    for (const o of group) {
      const percentile = percentileRank(durationsSorted, o.durationMin);
      let points = 0;
      let reason: SpeedVerdict['reason'] = 'neutral';
      if (percentile <= 25) { points = 2; reason = 'fast_top_quartile'; }
      else if (percentile >= 75) { points = -2; reason = 'slow_bottom_quartile'; }
      verdicts.set(String(o.id), {
        points,
        reason,
        detail: { duration_min: Math.round(o.durationMin), percentile: Math.round(percentile), tier, window_n: group.length },
      });
    }
  }
  return verdicts;
}
