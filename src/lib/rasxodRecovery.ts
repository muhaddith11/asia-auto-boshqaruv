// ─────────────────────────────────────────────────────────────────────────────
// Rasxod qaytishi — xodimlar bot orqali mashinaga o'z (ishxona) puliga qilgan
// xarajatlarni (masalan akkumulyator sotib olish) kuzatish: qaysi mashinaga,
// qancha, kim kiritdi, va bu pul QACHON qaytdi (mijoz to'lagach) yoki HALI
// qaytmagan (buyurtma hali faol/to'lanmagan).
//
// Rasxod mexanikasi (src/app/api/bot-ui/rasxod/route.ts): summani DARROV naqd
// kassadan ayiradi va buyurtmaning o'z `zaps`/`final` summasiga qo'shadi. Ya'ni
// pul FAQAT mijoz shu buyurtma uchun TO'LIQ to'laganda ("tulangan") ishxonaga
// qaytadi. Shu oralig'idagi vaqt — "qaytish muddati".
//
// Sof funksiya, dailyReport.ts'dagi tekshirilgan buildPaymentDayMap'dan
// foydalanadi (to'lov sanasini aniqlash uchun ikkinchi marta yozilmaydi).
// Test: rasxodRecovery.spec.ts
// ─────────────────────────────────────────────────────────────────────────────

import { isCancelledHolat } from './stock';
import { buildPaymentDayMap, type DailyOpLike } from './dailyReport';

export interface RasxodZapLike {
  nom?: string;
  name?: string;
  narx?: number;
  price?: number;
  rasxod?: boolean;
  kat?: string;
  xodim_nomi?: string;
  vaqt?: string;
}

export interface RasxodOrderLike {
  id: number | string;
  ism?: string;
  mashina?: string;
  raqam?: string;
  holat: string;
  zaps?: RasxodZapLike[] | null;
}

export type RasxodStatus = 'qaytdi' | 'kutilmoqda' | 'bekor';

export interface RasxodRow {
  orderId: number;
  mashina: string;
  raqam: string;
  mijoz: string;
  nom: string;
  summa: number;
  xodimNomi: string;
  vaqt: string; // rasxod kiritilgan ISO vaqt (bo'sh bo'lishi mumkin — eski yozuv)
  status: RasxodStatus;
  // 'qaytdi' uchun — kiritilgandan to'lovgacha necha kun o'tgani (ma'lum bo'lsa).
  qaytishKuni: number | null;
  // 'kutilmoqda' uchun — kiritilgandan hozirgacha necha kun o'tgani.
  kutishKuni: number | null;
}

function daysBetween(fromIso: string, toMs: number): number | null {
  const from = new Date(fromIso).getTime();
  if (isNaN(from)) return null;
  return Math.max(0, Math.round((toMs - from) / 86_400_000));
}

function isRasxodZap(z: RasxodZapLike): boolean {
  return z.rasxod === true || z.kat === 'Rasxod';
}

export function buildRasxodRows(
  buyurtmalar: RasxodOrderLike[],
  ishxonaOperatsiyalar: DailyOpLike[],
  now: Date = new Date(),
): RasxodRow[] {
  const paymentDayByOrder = buildPaymentDayMap(ishxonaOperatsiyalar);
  const nowMs = now.getTime();
  const rows: RasxodRow[] = [];

  for (const b of buyurtmalar) {
    const zaps = b.zaps || [];
    for (const z of zaps) {
      if (!isRasxodZap(z)) continue;
      const summa = Number(z.narx ?? z.price ?? 0);
      if (summa <= 0) continue;
      const vaqt = z.vaqt || '';

      let status: RasxodStatus;
      let qaytishKuni: number | null = null;
      let kutishKuni: number | null = null;

      if (isCancelledHolat(b.holat)) {
        status = 'bekor';
      } else if (b.holat === 'tulangan') {
        status = 'qaytdi';
        const payDay = paymentDayByOrder.get(String(b.id));
        if (payDay && vaqt) qaytishKuni = daysBetween(vaqt, new Date(payDay).getTime());
      } else {
        status = 'kutilmoqda';
        if (vaqt) kutishKuni = daysBetween(vaqt, nowMs);
      }

      rows.push({
        orderId: Number(b.id),
        mashina: b.mashina || '',
        raqam: b.raqam || '',
        mijoz: b.ism || '',
        nom: z.nom || z.name || 'Nomsiz',
        summa,
        xodimNomi: z.xodim_nomi || '',
        vaqt,
        status,
        qaytishKuni,
        kutishKuni,
      });
    }
  }

  return rows.sort((a, b) => new Date(b.vaqt).getTime() - new Date(a.vaqt).getTime());
}

export interface RasxodSummary {
  totalCount: number;
  totalAmount: number;
  outstandingCount: number;
  outstandingAmount: number; // hali qaytmagan (bizning puldan hozir "ushlab turilgan")
  recoveredCount: number;
  recoveredAmount: number;
  avgRecoveryDays: number | null; // faqat ma'lum bo'lgan qaytish kunlari bo'yicha o'rtacha
  lostCount: number;
  lostAmount: number; // buyurtma bekor bo'lgani uchun qaytmagan (yo'qotilgan ehtimoli katta)
}

export function summarizeRasxod(rows: RasxodRow[]): RasxodSummary {
  const summary: RasxodSummary = {
    totalCount: rows.length,
    totalAmount: 0,
    outstandingCount: 0,
    outstandingAmount: 0,
    recoveredCount: 0,
    recoveredAmount: 0,
    avgRecoveryDays: null,
    lostCount: 0,
    lostAmount: 0,
  };
  let recoveryDaysSum = 0;
  let recoveryDaysCount = 0;

  for (const r of rows) {
    summary.totalAmount += r.summa;
    if (r.status === 'kutilmoqda') {
      summary.outstandingCount++;
      summary.outstandingAmount += r.summa;
    } else if (r.status === 'qaytdi') {
      summary.recoveredCount++;
      summary.recoveredAmount += r.summa;
      if (r.qaytishKuni != null) {
        recoveryDaysSum += r.qaytishKuni;
        recoveryDaysCount++;
      }
    } else {
      summary.lostCount++;
      summary.lostAmount += r.summa;
    }
  }

  if (recoveryDaysCount > 0) {
    summary.avgRecoveryDays = Math.round((recoveryDaysSum / recoveryDaysCount) * 10) / 10;
  }
  return summary;
}
