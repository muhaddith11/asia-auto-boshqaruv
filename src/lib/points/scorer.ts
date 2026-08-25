// Kunlik ball hisoblash — yangi shart bajargan (tezlik) yoki oynasi yopilgan
// (sifat) ish qatorlarini topib points_ledger'ga yozadi. Pul harakatlanmaydi.
// Idempotent: `upsert(..., {ignoreDuplicates:true})` unique indeks orqali bir
// ishni ikki marta yozishning oldini oladi — cron qayta ishga tushsa ham xavfsiz.

import supabase from '@/lib/supabaseClient';
import { evaluateSpeedAgainstNorm, sumOrderNorm } from './speed';
import { evaluateQuality, type QualityOrderInput, type QualityCandidateOrder } from './quality';
import {
  NormLookup,
  CarClassLookup,
  resolveNorm,
  splitMashina,
  type ServiceNorm,
  type CarClassRow,
} from './norms';
import { summarizeSessions, type WorkSessionRow } from './workSessions';
import { tashkentPeriod } from './period';
import {
  POINTS_SPEED_LOOKBACK_DAYS,
  POINTS_REWORK_WINDOW_DAYS,
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

const ORDER_FIELDS = 'id, raqam, mashina, sana, holat, qabul_vaqti, tayyor_vaqti, srv, services';

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

export async function loadCarClassLookup(): Promise<CarClassLookup> {
  const { data, error } = await supabase
    .from('car_classes')
    .select('brand_norm, car_model_norm, klass, koeffitsient');
  if (error) throw new Error(`car_classes o'qishda xato: ${error.message}`);
  return new CarClassLookup((data || []) as CarClassRow[]);
}

function scoreSpeed(
  orders: OrderRow[],
  norms: NormLookup,
  classes: CarClassLookup,
  sessionsByOrder: Map<number, WorkSessionRow[]>,
): LedgerRow[] {
  const since = daysAgoDateStr(POINTS_SPEED_LOOKBACK_DAYS);
  const eligible = orders.filter(
    (o) =>
      o.sana >= since &&
      o.holat !== BEKOR_HOLAT &&
      o.tayyor_vaqti &&
      Array.isArray(o.services) &&
      o.services.length > 0,
  );

  const rows: LedgerRow[] = [];
  for (const o of eligible) {
    // Vaqt xodim o'lchagan sessiyalardan olinadi — qabul→tayyor emas.
    // Sessiyasiz buyurtma (eski yozuvlar, yoki tugma bosilmagan) baholanmaydi.
    const summary = summarizeSessions(sessionsByOrder.get(o.id) || [], o.tayyor_vaqti);
    if (!summary.reliable) continue;

    const { brand, model } = splitMashina(o.mashina);
    const services = o.services || [];

    // Buyurtma normasi = xizmatlar normalari yig'indisi. Har bir norma mashina
    // klassiga qarab kengaytiriladi (elektromobil/premium ishi uzoqroq).
    const resolved = services.map((s) => resolveNorm(norms, classes, s.nom || '', brand, model));
    const perService = resolved.map((r) => r.minutes);
    const totalNorma = sumOrderNorm(perService);

    const verdict = evaluateSpeedAgainstNorm(summary.totalMinutes, totalNorma);

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
        detail: {
          ...verdict.detail,
          service_norma_min: perService[idx],
          klass: resolved[idx]?.klass,
          koef: resolved[idx]?.koef,
          sessions: summary.sessionCount,
        },
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

async function loadSessions(orderIds: number[]): Promise<Map<number, WorkSessionRow[]>> {
  const byOrder = new Map<number, WorkSessionRow[]>();
  if (orderIds.length === 0) return byOrder;

  // Supabase `.in()` juda uzun ro'yxatda so'rovni buzadi — bo'lib yuboriladi.
  const CHUNK = 200;
  for (let i = 0; i < orderIds.length; i += CHUNK) {
    const chunk = orderIds.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from('work_sessions')
      .select('order_id, worker_id, started_at, ended_at')
      .in('order_id', chunk);
    if (error) throw new Error(`work_sessions o'qishda xato: ${error.message}`);
    for (const s of data || []) {
      const list = byOrder.get(s.order_id) || [];
      list.push(s as WorkSessionRow);
      byOrder.set(s.order_id, list);
    }
  }
  return byOrder;
}

export async function runDailyScoring(): Promise<{
  speedRows: number;
  qualityRows: number;
  normsLoaded: number;
  classesLoaded: number;
}> {
  const since = daysAgoDateStr(Math.max(POINTS_SPEED_LOOKBACK_DAYS, POINTS_REWORK_WINDOW_DAYS + 30));
  const { data, error } = await supabase.from('orders').select(ORDER_FIELDS).gte('sana', since).limit(3000);
  if (error) throw new Error(`orders o'qishda xato: ${error.message}`);
  const orders = (data || []) as unknown as OrderRow[];

  const norms = await loadNormLookup();
  const classes = await loadCarClassLookup();
  const sessions = await loadSessions(orders.map((o) => o.id));

  const speedRows = await writeLedgerRows(scoreSpeed(orders, norms, classes, sessions));
  const qualityRows = await writeLedgerRows(scoreQuality(orders));
  return { speedRows, qualityRows, normsLoaded: norms.size, classesLoaded: classes.size };
}
