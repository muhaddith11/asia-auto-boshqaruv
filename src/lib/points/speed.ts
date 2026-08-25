// Tezlik bahosi — har bir xizmatga belgilangan VAQT NORMASI bo'yicha.
// (Ilgari nisbiy persentil reytingi edi: "boshqalardan tez bo'lsang ball". Egasi
// buni mutlaq normaga almashtirishni so'radi: "injektor tozalash 1 soat, svecha
// 20 daqiqa — normadan erta bajarsa bonus, oshirib yuborsa jarima".)
//
// O'lchanadigan vaqt — mashina hovlida turgan vaqt EMAS, xodim botda
// "Ishni boshladim"/"To'xtatdim" bilan o'lchagan sof ish vaqti (`workSessions.ts`).

import {
  POINTS_MIN_DURATION_MINUTES,
  POINTS_GRACE_PERCENT,
  POINTS_FAST_BONUS_RATIO,
} from './config';

export type SpeedReason =
  | 'much_faster_than_norm'
  | 'faster_than_norm'
  | 'within_norm'
  | 'over_norm'
  | 'far_over_norm'
  | 'no_norm'
  | 'too_short_to_judge';

export interface SpeedVerdict {
  points: number; // +3 | +2 | 0 | -2 | -4
  reason: SpeedReason;
  detail: {
    work_min: number;
    norma_min: number | null;
    grace_min: number | null;
    ratio: number | null;
  };
}

export interface SpeedThresholds {
  minDurationMinutes?: number;
  gracePercent?: number;
  fastBonusRatio?: number;
}

// Bitta buyurtmani (uning barcha xizmatlari normasi yig'indisiga) solishtiradi.
//
// `normaMinutes === null` — norma belgilanmagan: NEYTRAL. Bu ataylab shunday:
// noma'lum normani taxmin qilib xodimga jarima yozishdan ko'ra, hech narsa
// yozmagan yaxshi. Egasi admin sahifada normani qo'shsa, keyingi hisoblashda
// avtomatik ishga tushadi.
export function evaluateSpeedAgainstNorm(
  workMinutes: number,
  normaMinutes: number | null,
  thresholds: SpeedThresholds = {},
): SpeedVerdict {
  const minDuration = thresholds.minDurationMinutes ?? POINTS_MIN_DURATION_MINUTES;
  const gracePercent = thresholds.gracePercent ?? POINTS_GRACE_PERCENT;
  const fastRatio = thresholds.fastBonusRatio ?? POINTS_FAST_BONUS_RATIO;

  const work = Math.max(0, workMinutes);
  const base = { work_min: Math.round(work), norma_min: null, grace_min: null, ratio: null };

  // Oxirgi 30 kunda buyurtmalarning ~62% i 3 daqiqadan kam ichida "tugagan" — bu
  // haqiqiy ish vaqti emas, xodim ishni tugatib bo'lib botda ikkala tugmani
  // ketma-ket bosgani. Bunday yozuvga ball berilsa, eng katta bonus aynan
  // tugmani shoshib bosganga tegib qolardi — shuning uchun neytral.
  if (work < minDuration) {
    return { points: 0, reason: 'too_short_to_judge', detail: base };
  }
  if (normaMinutes == null || !(normaMinutes > 0)) {
    return { points: 0, reason: 'no_norm', detail: base };
  }

  const grace = (normaMinutes * gracePercent) / 100;
  const detail = {
    work_min: Math.round(work),
    norma_min: Math.round(normaMinutes),
    grace_min: Math.round(grace),
    ratio: Math.round((work / normaMinutes) * 100) / 100,
  };

  if (work <= normaMinutes * fastRatio) return { points: 3, reason: 'much_faster_than_norm', detail };
  if (work < normaMinutes) return { points: 2, reason: 'faster_than_norm', detail };
  if (work <= normaMinutes + grace) return { points: 0, reason: 'within_norm', detail };
  if (work <= normaMinutes + grace * 2) return { points: -2, reason: 'over_norm', detail };
  return { points: -4, reason: 'far_over_norm', detail };
}

// Buyurtmadagi xizmatlar normasi YIG'INDISI. Bitta xizmatning ham normasi
// yo'q bo'lsa — null (butun buyurtma neytral). Yarim-yorti yig'indi bilan
// solishtirish xodimni nohaq jarimaga qo'yardi.
export function sumOrderNorm(perServiceNorms: Array<number | null>): number | null {
  if (perServiceNorms.length === 0) return null;
  let total = 0;
  for (const n of perServiceNorms) {
    if (n == null || !(n > 0)) return null;
    total += n;
  }
  return total;
}
