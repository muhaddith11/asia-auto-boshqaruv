// Toshkent vaqti (UTC+5, yil bo'yi o'zgarmaydi) bilan ishlaydigan oy chegaralari.
// Server har doim UTC'da ishlaydi (Vercel) — oddiy Date.getMonth() xato beradi
// (accept/route.ts'dagi mavjud `sana` xatosiga o'xshab). Shu sabab aniq +5 surish ishlatiladi.

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export function tashkentPeriod(iso: string): string {
  const d = new Date(new Date(iso).getTime() + TASHKENT_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// 'YYYY-MM' davrga mos Toshkent oyining UTC chegaralari: [start, end) — end kirmaydi.
export function tashkentMonthRangeUtc(period: string): { start: string; end: string } {
  const [y, m] = period.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0) - TASHKENT_OFFSET_MS);
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0) - TASHKENT_OFFSET_MS);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function previousTashkentPeriod(fromIso: string = new Date().toISOString()): string {
  const d = new Date(new Date(fromIso).getTime() + TASHKENT_OFFSET_MS);
  d.setUTCMonth(d.getUTCMonth() - 1);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
