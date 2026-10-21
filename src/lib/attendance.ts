// ─────────────────────────────────────────────────────────────────────────────
// Davomat — sof (pure) mantiq. Ma'lumot bazadan attendanceRepo.ts orqali keladi.
//
// Manba: ishxona tarmog'idagi skaner har daqiqada ulangan qurilmalarni (MAC)
// yuboradi → wifi_presence (qurilma × kun: birinchi/oxirgi ko'rinish).
// Xodim davomati shu yerda hisoblanadi: xodimga bog'langan qurilmalarning
// o'sha kungi eng erta va eng kech ko'rinishi.
//
// MUHIM: skaner kech yoqilsa (masalan laptop 10:50 da ochildi), ishxonada
// allaqachon turganlar ham "10:50 da keldi" bo'lib ko'rinadi. Shuning uchun
// skanerning birinchi aylanishida ko'ringanlar "approx" — haqiqatda undan
// OLDIN kelgan bo'lishi mumkin, kechikkan deb hisoblanmaydi.
// ─────────────────────────────────────────────────────────────────────────────

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

// Skaner yoqilgandan keyin shu vaqt ichida ko'ringanlar — "skaner yoqilganda bor edi".
export const SCANNER_GRACE_MS = 3 * 60 * 1000;
// Shu vaqt ichida ko'ringan qurilma "hozir tarmoqda" hisoblanadi.
export const ONLINE_MS = 3 * 60 * 1000;

const shift = (d: Date | string) => new Date(new Date(d).getTime() + TASHKENT_OFFSET_MS);

// Toshkent kuni 'YYYY-MM-DD' (server UTC'da ishlaydi).
export function tashkentDay(d: Date | string = new Date()): string {
  return shift(d).toISOString().slice(0, 10);
}

// Toshkent vaqti 'HH:MM'.
export function tashkentHM(d: Date | string): string {
  return shift(d).toISOString().slice(11, 16);
}

// Postgres `time` ('09:00:00') yoki '9:00' → '09:00'.
export function normalizeHM(t: string | null | undefined, fallback = '09:00'): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t || ''));
  if (!m) return fallback;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return fallback;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

// 'AA-BB-CC-DD-EE-FF' / 'aa:bb:...' → 'aa:bb:cc:dd:ee:ff'. Yaroqsiz, broadcast, bo'sh → null.
export function normalizeMac(raw: unknown): string | null {
  const hex = String(raw ?? '').toLowerCase().replace(/[^0-9a-f]/g, '');
  if (hex.length !== 12) return null;
  if (hex === '000000000000' || hex === 'ffffffffffff') return null;
  // Multicast manzil (1-bayt toq) — qurilma emas.
  if (parseInt(hex.slice(0, 2), 16) & 1) return null;
  return hex.match(/../g)!.join(':');
}

// Telefonlarning "yashirin" (lokal boshqariladigan) MAC manzili — 2-belgi 2/6/a/e.
export function isRandomMac(mac: string): boolean {
  return '26ae'.includes(mac.charAt(1));
}

export interface WorkerLite {
  id: number;
  ism: string;
}

export interface DeviceLite {
  mac: string;
  worker_id: number | null;
}

export interface PresenceLite {
  mac: string;
  first_seen: string;
  last_seen: string;
}

export interface DayLite {
  scanner_first: string;
  scanner_last: string;
  report_sent_at: string | null;
  late_notified: number[] | null;
}

export interface AttendanceRow {
  workerId: number;
  ism: string;
  arrivedAt: string | null;
  lastSeenAt: string | null;
  approx: boolean; // skaner yoqilganda allaqachon bor edi — aniq vaqti noma'lum
  late: boolean;
}

export interface DayView {
  day: string;
  workStart: string;
  scannerFirst: string | null;
  rows: AttendanceRow[]; // telefoni bog'langan barcha xodimlar
  present: AttendanceRow[];
  absent: AttendanceRow[];
}

export function buildDayView(input: {
  day: string;
  workStart: string;
  workers: WorkerLite[];
  devices: DeviceLite[];
  presence: PresenceLite[];
  dayRow: DayLite | null;
}): DayView {
  const { day, workStart, workers, devices, presence, dayRow } = input;
  const byMac = new Map(presence.map((p) => [p.mac, p]));
  const scannerFirst = dayRow?.scanner_first ?? null;
  const scannerFirstMs = scannerFirst ? new Date(scannerFirst).getTime() : null;

  const rows: AttendanceRow[] = [];
  for (const w of workers) {
    const macs = devices.filter((d) => d.worker_id === w.id).map((d) => d.mac);
    if (macs.length === 0) continue;

    let arrived: string | null = null;
    let last: string | null = null;
    for (const mac of macs) {
      const p = byMac.get(mac);
      if (!p) continue;
      if (!arrived || p.first_seen < arrived) arrived = p.first_seen;
      if (!last || p.last_seen > last) last = p.last_seen;
    }

    const approx =
      arrived !== null &&
      scannerFirstMs !== null &&
      new Date(arrived).getTime() - scannerFirstMs <= SCANNER_GRACE_MS;
    const late = arrived !== null && !approx && tashkentHM(arrived) > workStart;

    rows.push({ workerId: w.id, ism: w.ism.trim(), arrivedAt: arrived, lastSeenAt: last, approx, late });
  }

  // Kelganlar — kelgan vaqti bo'yicha, kelmaganlar — ism bo'yicha.
  const present = rows
    .filter((r) => r.arrivedAt)
    .sort((a, b) => a.arrivedAt!.localeCompare(b.arrivedAt!));
  const absent = rows.filter((r) => !r.arrivedAt).sort((a, b) => a.ism.localeCompare(b.ism));

  return { day, workStart, scannerFirst, rows, present, absent };
}

function fmtDay(day: string): string {
  const [y, m, d] = day.split('-');
  return `${d}.${m}.${y}`;
}

function arrivalLabel(r: AttendanceRow): string {
  if (!r.arrivedAt) return '';
  const t = tashkentHM(r.arrivedAt);
  if (r.approx) return `${t} gacha`;
  return r.late ? `${t} ⏰ kechikdi` : t;
}

// Boshliqqa kunlik hisobot (report_time da bir marta).
export function summaryText(view: DayView, nowIso: string): string {
  const lines: string[] = [`📋 Davomat — ${fmtDay(view.day)} (${tashkentHM(nowIso)} holati)`];

  lines.push('', `✅ Keldi (${view.present.length}):`);
  if (view.present.length === 0) lines.push('   —');
  for (const r of view.present) lines.push(`   • ${r.ism} — ${arrivalLabel(r)}`);

  lines.push('', `❌ Kelmadi (${view.absent.length}):`);
  if (view.absent.length === 0) lines.push('   —');
  for (const r of view.absent) lines.push(`   • ${r.ism}`);

  if (view.scannerFirst && tashkentHM(view.scannerFirst) > view.workStart) {
    const t = tashkentHM(view.scannerFirst);
    lines.push('', `⚠️ Skaner bugun ${t} da yoqilgan — undan oldin kelganlar "${t} gacha" deb ko'rsatildi.`);
  }

  lines.push('', `🕘 Ish boshlanishi: ${view.workStart}`);
  return lines.join('\n');
}

// Hisobotdan keyin kelganlar uchun qisqa xabar.
export function lateArrivalText(rows: AttendanceRow[], workStart: string): string {
  return rows
    .map((r) => {
      const t = tashkentHM(r.arrivedAt!);
      return r.late
        ? `⏰ ${r.ism} keldi — ${t} (kechikdi, ish ${workStart} da)`
        : `✅ ${r.ism} keldi — ${t}`;
    })
    .join('\n');
}
