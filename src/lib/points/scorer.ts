// Kunlik ball hisoblash — yangi shart bajargan (tezlik) yoki oynasi yopilgan
// (sifat) ish qatorlarini topib points_ledger'ga yozadi. Pul harakatlanmaydi.
// Idempotent: `upsert(..., {ignoreDuplicates:true})` unique indeks orqali bir
// ishni ikki marta yozishning oldini oladi — cron qayta ishga tushsa ham xavfsiz.

import supabase from '@/lib/supabaseClient';
import { computeSpeedVerdicts, isSpeedEligible, type SpeedOrderInput } from './speed';
import { evaluateQuality, type QualityOrderInput, type QualityCandidateOrder } from './quality';
import { tashkentPeriod } from './period';
import { POINTS_SPEED_WINDOW_DAYS, POINTS_REWORK_WINDOW_DAYS, BEKOR_HOLAT } from './config';

interface OrderServiceRow {
  id?: number | string;
  nom?: string;
  workerId?: number;
  zarplata?: number;
}

interface OrderRow {
  id: number;
  raqam: string;
  sana: string;
  holat: string | null;
  qabul_vaqti: string | null;
  tayyor_vaqti: string | null;
  srv: number | null;
  services: OrderServiceRow[] | null;
}

interface LedgerRow {
  worker_id: number;
  order_id: number;
  service_index: number;
  service_catalog_id: number | string | null;
  service_nom: string | null;
  category: 'speed' | 'quality';
  points: number;
  reason: string;
  detail: Record<string, unknown>;
  period: string;
}

const ORDER_FIELDS = 'id, raqam, sana, holat, qabul_vaqti, tayyor_vaqti, srv, services';

function daysAgoDateStr(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function writeLedgerRows(rows: LedgerRow[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { error } = await supabase
    .from('points_ledger')
    .upsert(rows, { onConflict: 'order_id,service_index,category', ignoreDuplicates: true });
  if (error) throw new Error(`points_ledger yozishda xato: ${error.message}`);
  return rows.length;
}

function scoreSpeed(orders: OrderRow[]): LedgerRow[] {
  const windowSince = daysAgoDateStr(POINTS_SPEED_WINDOW_DAYS);
  const eligible = orders.filter(
    (o) =>
      o.sana >= windowSince &&
      Array.isArray(o.services) &&
      o.services.length > 0 &&
      isSpeedEligible({
        qabulVaqti: o.qabul_vaqti,
        tayyorVaqti: o.tayyor_vaqti,
        holat: o.holat,
        bekorHolat: BEKOR_HOLAT,
      }),
  );
  if (eligible.length === 0) return [];

  const inputs: SpeedOrderInput[] = eligible.map((o) => ({
    id: o.id,
    srv: Number(o.srv) || 0,
    durationMin: (new Date(o.tayyor_vaqti as string).getTime() - new Date(o.qabul_vaqti as string).getTime()) / 60000,
  }));
  const verdicts = computeSpeedVerdicts(inputs);

  const rows: LedgerRow[] = [];
  for (const o of eligible) {
    const v = verdicts.get(String(o.id));
    if (!v) continue;
    const period = tashkentPeriod(o.tayyor_vaqti as string);
    (o.services || []).forEach((s, idx) => {
      if (!s.workerId) return;
      rows.push({
        worker_id: Number(s.workerId),
        order_id: o.id,
        service_index: idx,
        service_catalog_id: s.id ?? null,
        service_nom: s.nom ?? null,
        category: 'speed',
        points: v.points,
        reason: v.reason,
        detail: v.detail,
        period,
      });
    });
  }
  return rows;
}

function scoreQuality(orders: OrderRow[]): LedgerRow[] {
  const now = new Date();
  const candidates: QualityCandidateOrder[] = orders
    .filter((o) => o.holat !== BEKOR_HOLAT && Array.isArray(o.services))
    .map((o) => ({
      id: o.id,
      raqam: o.raqam,
      sana: o.qabul_vaqti || o.sana,
      services: (o.services || []).map((s, idx) => ({ serviceIndex: idx, catalogId: s.id ?? null, nom: s.nom || '' })),
    }));

  const toEvaluate = orders.filter(
    (o) => o.holat !== BEKOR_HOLAT && o.tayyor_vaqti && o.raqam && Array.isArray(o.services) && o.services.length > 0,
  );

  const rows: LedgerRow[] = [];
  for (const o of toEvaluate) {
    const input: QualityOrderInput = {
      id: o.id,
      raqam: o.raqam,
      tayyorVaqti: o.tayyor_vaqti as string,
      services: (o.services || []).map((s, idx) => ({ serviceIndex: idx, catalogId: s.id ?? null, nom: s.nom || '' })),
    };
    const verdicts = evaluateQuality(input, candidates, now, POINTS_REWORK_WINDOW_DAYS);
    const period = tashkentPeriod(o.tayyor_vaqti as string);

    verdicts.forEach((v) => {
      if (v.reason === 'pending') return; // oyna hali yopilmagan — keyingi kunga qoladi
      const svc = o.services?.[v.serviceIndex];
      if (!svc?.workerId) return;
      rows.push({
        worker_id: Number(svc.workerId),
        order_id: o.id,
        service_index: v.serviceIndex,
        service_catalog_id: svc.id ?? null,
        service_nom: svc.nom ?? null,
        category: 'quality',
        points: v.points,
        reason: v.reason,
        detail: v.detail,
        period,
      });
    });
  }
  return rows;
}

export async function runDailyScoring(): Promise<{ speedRows: number; qualityRows: number }> {
  const since = daysAgoDateStr(Math.max(POINTS_SPEED_WINDOW_DAYS, POINTS_REWORK_WINDOW_DAYS + 30));
  const { data, error } = await supabase.from('orders').select(ORDER_FIELDS).gte('sana', since).limit(3000);
  if (error) throw new Error(`orders o'qishda xato: ${error.message}`);
  const orders = (data || []) as unknown as OrderRow[];

  const speedRows = await writeLedgerRows(scoreSpeed(orders));
  const qualityRows = await writeLedgerRows(scoreQuality(orders));
  return { speedRows, qualityRows };
}
