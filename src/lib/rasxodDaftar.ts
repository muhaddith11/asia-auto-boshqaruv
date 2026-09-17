// ─────────────────────────────────────────────────────────────────────────────
// Rasxod daftari — mashinaga qilingan, lekin KASSADAN AYIRILMAGAN xarajatlarni
// qo'lda yozib borish (/reports/rasxod). Mashina kartochkasi (rasxod_cars) →
// uning xarajat qatorlari (rasxod_items). Mijoz pulni qaytarganda qator
// "to'landi" deb belgilanadi.
//
// KASSAGA TEGMAYDI — na rasxod yozilganda, na "to'landi" qilinganda. Bot orqali
// kiritiladigan rasxoddan (orders.zaps, @/lib/rasxodRecovery) butunlay alohida.
//
// Sof funksiyalar — client ham, server (API validatsiya) ham ishlatadi.
// Test: rasxodDaftar.spec.ts
// ─────────────────────────────────────────────────────────────────────────────

export interface RasxodItem {
  id: number;
  car_id: number;
  nom: string;
  summa: number;
  sana: string; // YYYY-MM-DD — xarajat qilingan kun
  tulandi: boolean; // summa TO'LIQ qaytdimi
  tulangan_summa: number; // qisman to'lov: hozirgacha qaytgan qism (tulandi=false bo'lganda ma'noli)
  tulangan_vaqt: string | null; // ISO — oxirgi to'lov (to'liq yoki qisman) vaqti
  created_at: string;
}

export interface RasxodCarRow {
  id: number;
  mashina: string;
  raqam: string | null;
  mijoz: string | null;
  tel: string | null;
  izoh: string | null;
  created_at: string;
  updated_at: string;
}

export interface RasxodCar extends RasxodCarRow {
  items: RasxodItem[];
}

export interface CarInput {
  mashina: string;
  raqam: string | null;
  mijoz: string | null;
  tel: string | null;
  izoh: string | null;
}

export interface ItemInput {
  nom: string;
  summa: number;
  sana: string;
}

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

// ── Sana (Toshkent, UTC+5 — yil bo'yi o'zgarmaydi; server UTC'da ishlaydi) ──

const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

export function tashkentDate(at: Date = new Date()): string {
  return new Date(at.getTime() + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
}

function dayNumber(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function isValidSana(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (y < 2000 || y > 2100) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// `sana` kunidan `to` vaqtining Toshkent kunigacha necha kun o'tgani (manfiy emas).
export function kunFarqi(sana: string, to: Date): number {
  return Math.max(0, dayNumber(tashkentDate(to)) - dayNumber(sana));
}

// 'YYYY-MM-DD' → 'DD.MM.YYYY'
export function fmtSana(ymd: string | null | undefined): string {
  if (!ymd) return '—';
  const [y, m, d] = ymd.slice(0, 10).split('-');
  return d && m && y ? `${d}.${m}.${y}` : ymd;
}

// ── Kiruvchi ma'lumotni tekshirish (API) ──

const MAX_SUMMA = 1_000_000_000_000; // ortiqcha nol yozib yuborishdan himoya
export const MAX_ITEMS_PER_REQUEST = 50;

function asObject(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

function text(value: unknown, max: number): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).trim().replace(/\s+/g, ' ').slice(0, max);
}

function optText(value: unknown, max: number): string | null {
  return text(value, max) || null;
}

export function normalizeRaqam(value: unknown): string | null {
  return text(value, 20).toUpperCase() || null;
}

// "+998" (faqat prefiks) yoki bo'sh telefon — yo'q deb hisoblanadi.
function normalizeTel(value: unknown): string | null {
  const tel = text(value, 30);
  return tel.replace(/\D/g, '').length > 3 ? tel : null;
}

export function parseSumma(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(/\s/g, ''));
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  return rounded > 0 && rounded <= MAX_SUMMA ? rounded : null;
}

/**
 * partial=false — yangi mashina (hamma maydon, mashina yoki raqam majburiy).
 * partial=true — tahrirlash: faqat yuborilgan maydonlar.
 */
export function parseCarInput(body: unknown, { partial = false } = {}): Parsed<Partial<CarInput>> {
  const b = asObject(body);
  const has = (key: string) => !partial || b[key] !== undefined;
  const out: Partial<CarInput> = {};

  if (has('mashina')) out.mashina = text(b.mashina, 100);
  if (has('raqam')) out.raqam = normalizeRaqam(b.raqam);
  if (has('mijoz')) out.mijoz = optText(b.mijoz, 100);
  if (has('tel')) out.tel = normalizeTel(b.tel);
  if (has('izoh')) out.izoh = optText(b.izoh, 500);

  if (partial && Object.keys(out).length === 0) {
    return { ok: false, error: "O'zgartirish uchun ma'lumot yuborilmadi" };
  }
  const clearsBoth = 'mashina' in out && 'raqam' in out && !out.mashina && !out.raqam;
  if (clearsBoth) return { ok: false, error: 'Mashina nomi yoki davlat raqamini kiriting' };
  return { ok: true, value: out };
}

/**
 * partial=false — yangi qator: nom va summa majburiy, sana berilmasa bugun.
 * partial=true — tahrirlash: faqat yuborilgan maydonlar.
 * `today` — Toshkent sanasi (kelajak sanani rad etish uchun, 1 kun zaxira bilan).
 */
export function parseItemInput(body: unknown, today: string, { partial = false } = {}): Parsed<Partial<ItemInput>> {
  const b = asObject(body);
  const has = (key: string) => !partial || b[key] !== undefined;
  const out: Partial<ItemInput> = {};

  if (has('nom')) {
    const nom = text(b.nom, 200);
    if (!nom) return { ok: false, error: 'Rasxod nima uchun qilinganini yozing' };
    out.nom = nom;
  }
  if (has('summa')) {
    const summa = parseSumma(b.summa);
    if (summa === null) return { ok: false, error: "Rasxod summasini to'g'ri kiriting" };
    out.summa = summa;
  }
  if (has('sana')) {
    const sana = b.sana === undefined || b.sana === null || b.sana === '' ? (partial ? '' : today) : text(b.sana, 10);
    if (!isValidSana(sana)) return { ok: false, error: "Sana noto'g'ri" };
    if (dayNumber(sana) > dayNumber(today) + 1) return { ok: false, error: "Sana kelajakda bo'lishi mumkin emas" };
    out.sana = sana;
  }

  if (partial && Object.keys(out).length === 0) {
    return { ok: false, error: "O'zgartirish uchun ma'lumot yuborilmadi" };
  }
  return { ok: true, value: out };
}

export function parseItemsInput(raw: unknown, today: string): Parsed<ItemInput[]> {
  const list = raw === undefined || raw === null ? [] : raw;
  if (!Array.isArray(list)) return { ok: false, error: "Rasxodlar ro'yxati noto'g'ri" };
  if (list.length > MAX_ITEMS_PER_REQUEST) {
    return { ok: false, error: `Bir martada ko'pi bilan ${MAX_ITEMS_PER_REQUEST} ta rasxod qo'shiladi` };
  }
  const items: ItemInput[] = [];
  for (const entry of list) {
    const parsed = parseItemInput(entry, today);
    if (!parsed.ok) return parsed;
    items.push(parsed.value as ItemInput);
  }
  return { ok: true, value: items };
}

// ── Hisob-kitob ──

function byChronology(a: RasxodItem, b: RasxodItem): number {
  return a.sana === b.sana ? a.id - b.id : a.sana < b.sana ? -1 : 1;
}

export function sortItems(items: RasxodItem[]): RasxodItem[] {
  return [...items].sort(byChronology);
}

export function joinCarsWithItems(cars: RasxodCarRow[], items: RasxodItem[]): RasxodCar[] {
  const byCar = new Map<number, RasxodItem[]>();
  for (const item of items) {
    const list = byCar.get(item.car_id);
    if (list) list.push(item);
    else byCar.set(item.car_id, [item]);
  }
  return cars.map((car) => ({ ...car, items: sortItems(byCar.get(car.id) ?? []) }));
}

// Bitta qatordan hozirgacha qaytgan summa — to'liq bo'lsa summa, aks holda qisman to'lov.
export function paidAmount(item: RasxodItem): number {
  if (item.tulandi) return item.summa;
  return Math.min(Math.max(item.tulangan_summa, 0), item.summa);
}

export type ItemHolat = 'kutilmoqda' | 'qisman' | 'tulandi';

export function itemHolat(item: RasxodItem): ItemHolat {
  if (item.tulandi) return 'tulandi';
  return paidAmount(item) > 0 ? 'qisman' : 'kutilmoqda';
}

// bosh — hali rasxod yozilmagan; qisman — bir qismi qaytgan.
export type CarHolat = 'bosh' | 'kutilmoqda' | 'qisman' | 'tulandi';

export interface CarStats {
  jami: number;
  tulangan: number;
  qoldiq: number;
  itemCount: number;
  unpaidCount: number;
  holat: CarHolat;
  // Eng eski to'lanmagan rasxoddan beri necha kun (to'lanmaganlar bo'lmasa null).
  kutishKuni: number | null;
  // Eng so'nggi "to'landi" vaqti (ISO).
  oxirgiTulov: string | null;
}

export function carStats(car: RasxodCar, now: Date = new Date()): CarStats {
  const stats: CarStats = {
    jami: 0, tulangan: 0, qoldiq: 0,
    itemCount: car.items.length, unpaidCount: 0,
    holat: 'bosh', kutishKuni: null, oxirgiTulov: null,
  };
  for (const item of car.items) {
    stats.jami += item.summa;
    const paid = paidAmount(item);
    stats.tulangan += paid;
    stats.qoldiq += item.summa - paid;
    if (item.tulandi) {
      if (item.tulangan_vaqt && (!stats.oxirgiTulov || item.tulangan_vaqt > stats.oxirgiTulov)) {
        stats.oxirgiTulov = item.tulangan_vaqt;
      }
    } else {
      stats.unpaidCount++;
      stats.kutishKuni = Math.max(stats.kutishKuni ?? 0, kunFarqi(item.sana, now));
    }
  }
  if (stats.itemCount > 0) {
    // Jami qoldiq 0 — hammasi qaytdi; hech narsa qaytmagan bo'lsa kutilmoqda;
    // aks holda (bitta qatorning bir qismi yoki ba'zi qatorlar to'liq qaytgan) — qisman.
    stats.holat = stats.qoldiq === 0 ? 'tulandi' : stats.tulangan > 0 ? 'qisman' : 'kutilmoqda';
  }
  return stats;
}

// To'langan qator necha kunda qaytgani (to'langan vaqti noma'lum bo'lsa null).
export function qaytishKuni(item: RasxodItem): number | null {
  return item.tulandi && item.tulangan_vaqt ? kunFarqi(item.sana, new Date(item.tulangan_vaqt)) : null;
}

export interface DaftarSummary {
  carCount: number;
  jami: number;
  itemCount: number;
  qoldiq: number;
  unpaidCount: number;
  kutayotganMashina: number;
  tulangan: number;
  paidCount: number;
  ortachaQaytish: number | null;
  engUzoq: { carId: number; mashina: string; raqam: string | null; kun: number } | null;
}

export function summarizeDaftar(cars: RasxodCar[], now: Date = new Date()): DaftarSummary {
  const s: DaftarSummary = {
    carCount: cars.length, jami: 0, itemCount: 0,
    qoldiq: 0, unpaidCount: 0, kutayotganMashina: 0,
    tulangan: 0, paidCount: 0, ortachaQaytish: null, engUzoq: null,
  };
  let daysSum = 0;
  let daysCount = 0;

  for (const car of cars) {
    const st = carStats(car, now);
    s.jami += st.jami;
    s.itemCount += st.itemCount;
    s.qoldiq += st.qoldiq;
    s.unpaidCount += st.unpaidCount;
    s.tulangan += st.tulangan;
    s.paidCount += st.itemCount - st.unpaidCount;
    if (st.unpaidCount > 0) s.kutayotganMashina++;
    if (st.kutishKuni !== null && (!s.engUzoq || st.kutishKuni > s.engUzoq.kun)) {
      s.engUzoq = { carId: car.id, mashina: car.mashina, raqam: car.raqam, kun: st.kutishKuni };
    }
    for (const item of car.items) {
      const days = qaytishKuni(item);
      if (days !== null) {
        daysSum += days;
        daysCount++;
      }
    }
  }

  if (daysCount > 0) s.ortachaQaytish = Math.round((daysSum / daysCount) * 10) / 10;
  return s;
}

// ── Ro'yxat: filtr, qidiruv, tartib ──

export type DaftarTab = 'kutilmoqda' | 'tulandi' | 'all';

export function matchesTab(stats: CarStats, tab: DaftarTab): boolean {
  if (tab === 'all') return true;
  // Rasxodi yozilmagan kartochka ham "Kutilmoqda"da — endi yaratilgan mashina ko'zdan yo'qolmasin.
  return tab === 'tulandi' ? stats.holat === 'tulandi' : stats.holat !== 'tulandi';
}

const compact = (value: string) => value.toLowerCase().replace(/[\s\-_.]/g, '');

export function matchesSearch(car: RasxodCar, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [car.mashina, car.raqam, car.mijoz, car.tel, car.izoh, ...car.items.map((i) => i.nom)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  // Raqam/telefon bo'shliq bilan ham, bo'shliqsiz ham topilsin ("40 J 928" = "40J928").
  return haystack.includes(q) || compact(haystack).includes(compact(q));
}

export function visibleCars(cars: RasxodCar[], tab: DaftarTab, query: string, now: Date = new Date()): RasxodCar[] {
  const list = cars
    .map((car) => ({ car, st: carStats(car, now) }))
    .filter(({ car, st }) => matchesTab(st, tab) && matchesSearch(car, query));

  list.sort((a, b) => {
    if (tab === 'kutilmoqda') {
      // Eng uzoq kutayotgan tepada — aynan shularga e'tibor kerak.
      const diff = (b.st.kutishKuni ?? -1) - (a.st.kutishKuni ?? -1);
      if (diff !== 0) return diff;
    } else if (tab === 'tulandi') {
      const pa = a.st.oxirgiTulov ?? '';
      const pb = b.st.oxirgiTulov ?? '';
      if (pa !== pb) return pb > pa ? 1 : -1;
    }
    return b.car.id - a.car.id; // yangi kartochka tepada
  });

  return list.map(({ car }) => car);
}

// ── Holatni yangilash (server javobini ro'yxatga qo'llash) ──

export function patchCar(cars: RasxodCar[], row: RasxodCarRow): RasxodCar[] {
  return cars.map((car) => (car.id === row.id ? { ...car, ...row, items: car.items } : car));
}

export function upsertItems(cars: RasxodCar[], items: RasxodItem[]): RasxodCar[] {
  if (items.length === 0) return cars;
  return cars.map((car) => {
    const mine = items.filter((item) => item.car_id === car.id);
    if (mine.length === 0) return car;
    const ids = new Set(mine.map((item) => item.id));
    return { ...car, items: sortItems([...car.items.filter((item) => !ids.has(item.id)), ...mine]) };
  });
}

export function removeItem(cars: RasxodCar[], carId: number, itemId: number): RasxodCar[] {
  return cars.map((car) => (car.id === carId ? { ...car, items: car.items.filter((item) => item.id !== itemId) } : car));
}

// ── Yangi mashina formasi uchun: buyurtma/mijoz bazasidan raqam bo'yicha taklif ──

export interface CarSuggestionSource {
  mashina?: string | null;
  raqam?: string | null;
  ism?: string | null;
  tel?: string | null;
}

export interface CarSuggestion {
  mashina: string;
  raqam: string;
  mijoz: string;
  tel: string;
}

// Bot buyurtmalari mijoz ismisiz shu nom bilan saqlanadi — haqiqiy ism emas.
const PLACEHOLDER_NAMES = new Set(['kunlik mijoz']);

export function plateKey(raqam: string | null | undefined): string {
  return (raqam ?? '').toUpperCase().replace(/[^0-9A-ZА-ЯЁЎҚҒҲ]/g, '');
}

// `sources` yangidan eskiga tartiblangan bo'lishi kerak — bir raqam uchun eng so'nggi ma'lumot olinadi.
export function suggestCars(query: string, sources: CarSuggestionSource[], limit = 6): CarSuggestion[] {
  const q = plateKey(query);
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const out: CarSuggestion[] = [];
  for (const src of sources) {
    const key = plateKey(src.raqam);
    if (!key || !key.includes(q) || seen.has(key)) continue;
    seen.add(key);
    const ism = (src.ism ?? '').trim();
    out.push({
      mashina: (src.mashina ?? '').trim(),
      raqam: (src.raqam ?? '').trim().toUpperCase(),
      mijoz: PLACEHOLDER_NAMES.has(ism.toLowerCase()) ? '' : ism,
      tel: (src.tel ?? '').trim(),
    });
    if (out.length >= limit) break;
  }
  return out;
}
