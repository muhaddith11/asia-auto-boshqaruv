// Ish vaqti soati — "o'tgan vaqt" (qabul→tayyor) xodimning ISHLAGAN vaqti EMAS.
// Bazani tekshirganda: buyurtmalarning 14% i kunni oshib ketadi, "🔍 Diagnostika"
// ning median o'tgan vaqti 16.8 soat, "Batareyka yechish" niki 10.8 kun — chunki
// mashina kechasi ustaxonada turadi. Agar shu xom vaqt normaga solishtirilsa,
// soat 20:50 da qabul qilingan 20 daqiqalik ish ertasi 09:10 da tugatilsa
// "12 soat 20 daqiqa" bo'lib chiqadi va xodim nohaq jarima oladi.
//
// Shu sabab vaqt faqat ustaxona OCHIQ bo'lgan soatlar bo'yicha sanaladi, va
// zapchast kutilgan oyna butunlay chiqarib tashlanadi (xodim aybdor emas).

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC+5, yil bo'yi o'zgarmaydi
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export interface WorkClockConfig {
  startHour: number; // ustaxona ochilishi (Toshkent vaqti)
  endHour: number; // yopilishi
}

export interface TimeInterval {
  start: string; // ISO
  end: string; // ISO
}

function toTashkentMs(iso: string): number {
  return new Date(iso).getTime() + TASHKENT_OFFSET_MS;
}

// [aStart,aEnd) va [bStart,bEnd) kesishmasi, millisekundda.
function overlapMs(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

// Berilgan oraliqning ustaxona ish soatlariga to'g'ri keladigan qismi (millisekund).
// Kun-kun bo'ylab yurib, har kunning [startHour, endHour) oynasi bilan kesishmasi yig'iladi.
function workingMsBetween(startTashMs: number, endTashMs: number, cfg: WorkClockConfig): number {
  if (!(endTashMs > startTashMs)) return 0;
  if (!(cfg.endHour > cfg.startHour)) return 0; // kecha oshib ketadigan smena qo'llab-quvvatlanmaydi

  const firstDay = Math.floor(startTashMs / DAY_MS);
  const lastDay = Math.floor((endTashMs - 1) / DAY_MS);

  let total = 0;
  for (let day = firstDay; day <= lastDay; day++) {
    const dayStart = day * DAY_MS;
    total += overlapMs(
      startTashMs,
      endTashMs,
      dayStart + cfg.startHour * HOUR_MS,
      dayStart + cfg.endHour * HOUR_MS,
    );
  }
  return total;
}

// Ish soatlari bo'yicha sof daqiqa: [start,end) dan ish soatlariga tushgan qismi,
// undan `excluded` oynalarning (zapchast kutish) ish soatlaridagi qismi ayiriladi.
export function effectiveWorkMinutes(
  startIso: string,
  endIso: string,
  excluded: TimeInterval[],
  cfg: WorkClockConfig,
): number {
  const start = toTashkentMs(startIso);
  const end = toTashkentMs(endIso);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;

  let ms = workingMsBetween(start, end, cfg);

  for (const ex of excluded) {
    const exStart = toTashkentMs(ex.start);
    const exEnd = toTashkentMs(ex.end);
    if (!Number.isFinite(exStart) || !Number.isFinite(exEnd) || exEnd <= exStart) continue;
    // Faqat asosiy oyna ichidagi qismi ayiriladi — tashqarisi allaqachon sanalmagan.
    const clippedStart = Math.max(start, exStart);
    const clippedEnd = Math.min(end, exEnd);
    if (clippedEnd <= clippedStart) continue;
    ms -= workingMsBetween(clippedStart, clippedEnd, cfg);
  }

  return Math.max(0, ms) / 60000;
}

export interface StatusLogEntry {
  bosqich?: string;
  vaqt?: string;
  xodim_id?: number;
  izoh?: string;
}

// status_log'dan zapchast kutilgan oynalarni ajratib olish.
// bot-ui/stage/route.ts 'zapchast_kutilmoqda' yozuvini qo'yadi, keyingi boshqa
// bosqichli yozuv (odatda 'tamirlanmoqda' — "Zapchast keldi") uni yopadi.
// Oyna yopilmagan bo'lsa (hali zapchast kelmagan) — `fallbackEnd` bilan yopiladi.
export function partsWaitIntervals(
  statusLog: StatusLogEntry[] | null | undefined,
  fallbackEnd: string,
): TimeInterval[] {
  if (!Array.isArray(statusLog)) return [];
  const intervals: TimeInterval[] = [];
  let openStart: string | null = null;

  for (const entry of statusLog) {
    if (!entry?.vaqt) continue;
    if (entry.bosqich === 'zapchast_kutilmoqda') {
      if (openStart === null) openStart = entry.vaqt;
    } else if (openStart !== null) {
      intervals.push({ start: openStart, end: entry.vaqt });
      openStart = null;
    }
  }
  if (openStart !== null) intervals.push({ start: openStart, end: fallbackEnd });

  return intervals;
}
