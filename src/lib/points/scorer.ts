// Kunlik ball hisoblash — yangi shart bajargan (tezlik) yoki oynasi yopilgan
// (sifat) ish qatorlarini topib points_ledger'ga yozadi. Pul harakatlanmaydi.
// Idempotent: `upsert(..., {ignoreDuplicates:true})` unique indeks orqali bir
// ishni ikki marta yozishning oldini oladi — cron qayta ishga tushsa ham xavfsiz.

import supabase from '@/lib/supabaseClient';
import { evaluateSpeedAgainstNorm, sumOrderNorm } from './speed';
import { evaluateQuality, type QualityOrderInput, type QualityCandidateOrder } from './quality';
import { NormLookup, splitMashina, type ServiceNorm } from './norms';
import { effectiveWorkMinutes, partsWaitIntervals, type StatusLogEntry } from './workClock';
import { tashkentPeriod } from './period';
import {
  POINTS_SPEED_LOOKBACK_DAYS,
  POINTS_REWORK_WINDOW_DAYS,
  WORK_DAY_START_HOUR,
  WORK_DAY_END_HOUR,
  BEKOR_HOLAT,
} from './config';

interface OrderServiceRow {
  id?: number | string;
  nom?: string;
  workerId?: number;
  zarplata?: number;
}

interface OrderRow {
  id: number;
  raqam: string;
  mashina: string | null;
  sana: string;
  holat: string | null;
  qabul_vaqti: string | null;
  tayyor_vaqti: string | null;
  srv: number | null;
  services: OrderServiceRow[] | null;
  status_log: StatusLogEntry[] | null;
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

const ORDER_FIELDS =
  'id, raqam, mashina, sana, holat, qabul_vaqti, tayyor_vaqti, srv, services, status_log';

const WORK_CLOCK = { startHour: WORK_DAY_START_HOUR, endHour: WORK_DAY_END_HOUR };

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

export async function loadNormLookup(): Promise<NormLookup> {
  const { data, error } = await supabase
    .from('service_norms')
    .select('nom_norm, brand, car_model, norma_daqiqa');
  if (error) throw new Error(`service_norms o'qishda xato: ${error.message}`);
  return new NormLookup((data || []) as ServiceNorm[]);
}

// Buyurtmaning sof ish vaqti: ish soatlari ichida, zapchast kutish chiqarilgan.
export function orderWorkMinutes(o: OrderRow): number {
  const excluded = partsWaitIntervals(o.status_log, o.tayyor_vaqti as string);
  return effectiveWorkMinutes(o.qabul_vaqti as string, o.tayyor_vaqti as string, excluded, WORK_CLOCK);
}

function scoreSpeed(orders: OrderRow[], norms: NormLookup): LedgerRow[] {
  const since = daysAgoDateStr(POINTS_SPEED_LOOKBACK_DAYS);
  const eligible = orders.filter(
    (o) =>
      o.sana >= since &&
      o.holat !== BEKOR_HOLAT &&
      o.qabul_vaqti &&
      o.tayyor_vaqti &&
      Array.isArray(o.services) &&
      o.services.length > 0,
  );

  const rows: LedgerRow[] = [];
  for (const o of eligible) {
    const { brand, model } = splitMashina(o.mashina);
    const services = o.services || [];

    // Buyurtma normasi = xizmatlar normalari yig'indisi (vaqt faqat buyurtma
    // darajasida o'lchanadi, alohida ishga bo'lib bo'lmaydi).
    const perService = services.map((s) => norms.find(s.nom || '', brand, model));
    const totalNorma = sumOrderNorm(perService);

    const verdict = evaluateSpeedAgainstNorm(orderWorkMinutes(o), totalNorma);

    // Normasi yo'q / juda qisqa — hech narsa yozilmaydi. Ledger'ga 0 ballik
    // yozuv qo'yilsa, keyin norma belgilangach unique indeks qayta baholashga
    // yo'l bermay qolardi (sifatdagi 'pending' bilan bir xil mantiq).
    if (verdict.reason === 'no_norm' || verdict.reason === 'too_short_to_judge') continue;

    const period = tashkentPeriod(o.tayyor_vaqti as string);
    services.forEach((s, idx) => {
      if (!s.workerId) return;
      rows.push({
        worker_id: Number(s.workerId),
        order_id: o.id,
        service_index: idx,
        service_catalog_id: s.id ?? null,
        service_nom: s.nom ?? null,
        category: 'speed',
        points: verdict.points,
        reason: verdict.reason,
        detail: { ...verdict.detail, service_norma_min: perService[idx] },
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

export async function runDailyScoring(): Promise<{ speedRows: number; qualityRows: number; normsLoaded: number }> {
  const since = daysAgoDateStr(Math.max(POINTS_SPEED_LOOKBACK_DAYS, POINTS_REWORK_WINDOW_DAYS + 30));
  const { data, error } = await supabase.from('orders').select(ORDER_FIELDS).gte('sana', since).limit(3000);
  if (error) throw new Error(`orders o'qishda xato: ${error.message}`);
  const orders = (data || []) as unknown as OrderRow[];

  const norms = await loadNormLookup();

  const speedRows = await writeLedgerRows(scoreSpeed(orders, norms));
  const qualityRows = await writeLedgerRows(scoreQuality(orders));
  return { speedRows, qualityRows, normsLoaded: norms.size };
}
