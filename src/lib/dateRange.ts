// ─────────────────────────────────────────────────────────────────────────────
// Hisobot filtrlari uchun sana oralig'i — yagona, sof (pure) manba.
//
// MUHIM: sana MAHALLIY vaqt bo'yicha formatlanadi.
// Ilgari filtrlarda `new Date(...).toISOString().split('T')[0]` ishlatilardi —
// u UTC'ga o'giradi. Toshkent (UTC+5) uchun mahalliy yarim tun UTC'da OLDINGI
// kunga tushadi, shuning uchun oyning oxirgi kuni bir kun orqaga surilardi
// (30-sentyabr → "2026-09-29") va "OY" filtri oyning OXIRGI KUNINI umuman
// ko'rsatmasdi — o'sha kungi kirim/chiqim foyda hisobidan tushib qolardi.
// Shu bugni takrorlamaslik uchun sana shu yerda yig'iladi.
//
// Test: dateRange.spec.ts
// ─────────────────────────────────────────────────────────────────────────────

export type QuickRangeKind = 'hafta' | 'oy' | 'yil';

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

// Sanani mahalliy vaqt bo'yicha YYYY-MM-DD ko'rinishida beradi.
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Joriy oy: 1-sanadan oyning OXIRGI kunigacha (oxirgi kun ham KIRADI).
export function monthRange(now: Date = new Date()): DateRange {
  return {
    from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

// Joriy hafta: dushanbadan yakshanbagacha.
export function weekRange(now: Date = new Date()): DateRange {
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() + (day === 0 ? -6 : 1 - day));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { from: ymd(mon), to: ymd(sun) };
}

// Joriy yil.
export function yearRange(now: Date = new Date()): DateRange {
  return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
}

export function quickRange(kind: QuickRangeKind, now: Date = new Date()): DateRange {
  if (kind === 'hafta') return weekRange(now);
  if (kind === 'yil') return yearRange(now);
  return monthRange(now);
}
