// Sifat (qayta ta'mirlash) bahosi. `muammo` maydoni 97.6% holatda avtomatik
// generatsiya qilingan andoza ("Xizmatlar: X - Y\n...") — erkin matn emas, shuning
// uchun o'xshashlik solishtirish uchun yaroqsiz. Buning o'rniga strukturaviy
// `services[].id`/`nom` (bir xil davlat raqami + bir xil xizmat) ishlatiladi.

import { POINTS_REWORK_WINDOW_DAYS } from './config';

export interface QualityService {
  serviceIndex: number;
  catalogId: number | string | null | undefined;
  nom: string;
}

export interface QualityOrderInput {
  id: number | string;
  raqam: string;
  tayyorVaqti: string; // ISO — oyna shu vaqtdan boshlanadi
  services: QualityService[];
}

export interface QualityCandidateOrder {
  id: number | string;
  raqam: string;
  sana: string; // ISO yoki YYYY-MM-DD — bu buyurtma qachon kelgani
  services: QualityService[];
}

export type QualityReason = 'rework_detected' | 'clean_no_rework' | 'pending';

export interface QualityVerdict {
  serviceIndex: number;
  points: number; // -4 | +1 | 0(pending — yozilmaydi, oyna hali yopilmagan)
  reason: QualityReason;
  detail: Record<string, unknown>;
}

function normName(nom: string): string {
  return (nom || '').trim().toLowerCase();
}

// Davlat raqami botda erkin matn sifatida kiritiladi (input'dagi "uppercase" CSS
// klassi faqat vizual — haqiqiy qiymatni o'zgartirmaydi). Jonli bazada bir xil
// mashina "40n005nb" va "40M494WA" kabi turlicha registr/bo'shliq bilan yozilgan
// holatlar bor — shuning uchun taqqoslashdan oldin normallashtiriladi.
function normPlate(raqam: string): string {
  return (raqam || '').replace(/\s+/g, '').toUpperCase();
}

function servicesShareItem(a: QualityService, candidates: QualityService[]): boolean {
  return candidates.some((b) => {
    if (a.catalogId != null && b.catalogId != null) return String(a.catalogId) === String(b.catalogId);
    return normName(a.nom) !== '' && normName(a.nom) === normName(b.nom);
  });
}

// `reason:'pending'` bo'lgan natijalarni chaqiruvchi (scorer.ts) points_ledger'ga
// YOZMASLIGI kerak — 14 kunlik oyna yopilgach shu ish qayta baholanadi (unique
// indeks bitta ishni bir marta yozishga ruxsat beradi, shuning uchun muddatidan
// oldin yozib qo'yish keyingi haqiqiy natijani yo'qotadi).
export function evaluateQuality(
  order: QualityOrderInput,
  candidates: QualityCandidateOrder[],
  now: Date,
  windowDays: number = POINTS_REWORK_WINDOW_DAYS,
): QualityVerdict[] {
  const anchor = new Date(order.tayyorVaqti).getTime();
  const windowEndMs = anchor + windowDays * 24 * 60 * 60 * 1000;
  const windowClosed = now.getTime() >= windowEndMs;

  const anchorPlate = normPlate(order.raqam);
  const sameCar = anchorPlate
    ? candidates.filter((c) => normPlate(c.raqam) === anchorPlate && String(c.id) !== String(order.id))
    : [];

  return order.services.map((svc) => {
    const match = sameCar.find((c) => {
      const cTime = new Date(c.sana).getTime();
      if (!(cTime > anchor && cTime <= windowEndMs)) return false;
      return servicesShareItem(svc, c.services);
    });

    if (match) {
      const daysLater = Math.round((new Date(match.sana).getTime() - anchor) / (24 * 60 * 60 * 1000));
      return {
        serviceIndex: svc.serviceIndex,
        points: -4,
        reason: 'rework_detected',
        detail: { rework_order_id: match.id, days_later: daysLater },
      };
    }
    if (windowClosed) {
      return { serviceIndex: svc.serviceIndex, points: 1, reason: 'clean_no_rework', detail: { window_days: windowDays } };
    }
    return { serviceIndex: svc.serviceIndex, points: 0, reason: 'pending', detail: { window_days: windowDays } };
  });
}
