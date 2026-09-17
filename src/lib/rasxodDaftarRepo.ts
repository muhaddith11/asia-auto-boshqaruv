import supabase from '@/lib/supabaseClient';
import { fetchAllRows } from '@/lib/fetchAllRows';
import {
  joinCarsWithItems, sortItems,
  type CarInput, type ItemInput, type RasxodCar, type RasxodCarRow, type RasxodItem,
} from '@/lib/rasxodDaftar';

// ─────────────────────────────────────────────────────────────────────────────
// Rasxod daftari (rasxod_cars + rasxod_items) bilan ishlash — server-only.
// Kirish tekshiruvi route darajasida. KASSAGA TEGMAYDI (qarang: rasxodDaftar.ts).
// ─────────────────────────────────────────────────────────────────────────────

const CARS = 'rasxod_cars';
const ITEMS = 'rasxod_items';

// Mashina (yoki qator) topilmadi — route 404 qaytaradi.
export class NotFoundError extends Error {}

// Qisman to'lov summasi noto'g'ri (qoldiqdan katta yoki qator allaqachon to'liq to'langan) — route 400 qaytaradi.
export class ValidationError extends Error {}

function db() {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  return supabase;
}

type DbRow = Record<string, unknown>;

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const optStr = (v: unknown) => (v === null || v === undefined || v === '' ? null : String(v));

// numeric/bigint ustunlar ba'zan satr bo'lib keladi — sonlarga keltiramiz.
function toItem(row: DbRow): RasxodItem {
  return {
    id: Number(row.id),
    car_id: Number(row.car_id),
    nom: str(row.nom),
    summa: Number(row.summa) || 0,
    sana: str(row.sana).slice(0, 10),
    tulandi: row.tulandi === true,
    tulangan_summa: Number(row.tulangan_summa) || 0,
    tulangan_vaqt: optStr(row.tulangan_vaqt),
    created_at: str(row.created_at),
  };
}

function toCarRow(row: DbRow): RasxodCarRow {
  return {
    id: Number(row.id),
    mashina: str(row.mashina),
    raqam: optStr(row.raqam),
    mijoz: optStr(row.mijoz),
    tel: optStr(row.tel),
    izoh: optStr(row.izoh),
    created_at: str(row.created_at),
    updated_at: str(row.updated_at),
  };
}

export async function listCars(): Promise<RasxodCar[]> {
  const [cars, items] = await Promise.all([
    fetchAllRows<DbRow>((from, to, withCount) =>
      (withCount ? db().from(CARS).select('*', { count: 'exact' }) : db().from(CARS).select('*'))
        .order('id', { ascending: false })
        .range(from, to)),
    fetchAllRows<DbRow>((from, to, withCount) =>
      (withCount ? db().from(ITEMS).select('*', { count: 'exact' }) : db().from(ITEMS).select('*'))
        .order('id', { ascending: true })
        .range(from, to)),
  ]);
  return joinCarsWithItems(cars.map(toCarRow), items.map(toItem));
}

export async function createCar(car: CarInput, items: ItemInput[]): Promise<RasxodCar> {
  const { data, error } = await db().from(CARS).insert([car]).select();
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row) throw new Error('Mashina saqlanmadi');

  let created: RasxodItem[] = [];
  if (items.length > 0) {
    const res = await db().from(ITEMS).insert(items.map((item) => ({ ...item, car_id: row.id }))).select();
    if (res.error) {
      // Kartochka rasxodlarsiz yarim holatda qolib ketmasin.
      await db().from(CARS).delete().eq('id', row.id);
      throw new Error(res.error.message);
    }
    created = (res.data ?? []).map(toItem);
  }
  return { ...toCarRow(row), items: sortItems(created) };
}

export async function updateCar(id: number, patch: Partial<CarInput>): Promise<RasxodCarRow> {
  const { data, error } = await db()
    .from(CARS)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new NotFoundError('Mashina topilmadi');
  return toCarRow(data[0]);
}

// Qatorlari ham o'chadi (on delete cascade).
export async function deleteCar(id: number): Promise<RasxodCarRow> {
  const { data, error } = await db().from(CARS).delete().eq('id', id).select();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new NotFoundError('Mashina topilmadi');
  return toCarRow(data[0]);
}

export async function addItems(carId: number, items: ItemInput[]): Promise<RasxodItem[]> {
  const { data, error } = await db()
    .from(ITEMS)
    .insert(items.map((item) => ({ ...item, car_id: carId })))
    .select();
  if (error) {
    // 23503 — foreign key: mashina o'chirib yuborilgan.
    if (error.code === '23503') throw new NotFoundError('Mashina topilmadi');
    throw new Error(error.message);
  }
  return sortItems((data ?? []).map(toItem));
}

export async function updateItem(carId: number, itemId: number, patch: Partial<ItemInput>): Promise<RasxodItem> {
  const { data, error } = await db()
    .from(ITEMS)
    .update(patch)
    .eq('id', itemId)
    .eq('car_id', carId)
    .select();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new NotFoundError('Rasxod topilmadi');
  return toItem(data[0]);
}

export async function deleteItem(carId: number, itemId: number): Promise<RasxodItem> {
  const { data, error } = await db().from(ITEMS).delete().eq('id', itemId).eq('car_id', carId).select();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new NotFoundError('Rasxod topilmadi');
  return toItem(data[0]);
}

/**
 * Mijoz rasxodning bir qismini qaytardi: `summa` qatorning qoldig'iga qo'shiladi.
 * Qoldiq nolga tushsa qator avtomatik "tulandi" bo'ladi. Summa qoldiqdan katta
 * bo'lsa yoki qator allaqachon to'liq to'langan bo'lsa — ValidationError.
 */
export async function addPartialPayment(carId: number, itemId: number, summa: number): Promise<RasxodItem> {
  const { data: rows, error: selErr } = await db().from(ITEMS).select('*').eq('id', itemId).eq('car_id', carId);
  if (selErr) throw new Error(selErr.message);
  const current = rows?.[0];
  if (!current) throw new NotFoundError('Rasxod topilmadi');
  const item = toItem(current);
  if (item.tulandi) throw new ValidationError("Bu rasxod allaqachon to'liq to'langan");
  const qoldiq = item.summa - Math.min(item.tulangan_summa, item.summa);
  if (summa > qoldiq) throw new ValidationError("Summa qoldiqdan katta bo'lishi mumkin emas");

  const tulanganSumma = item.tulangan_summa + summa;
  const tulandi = tulanganSumma >= item.summa;
  const { data, error } = await db()
    .from(ITEMS)
    .update({ tulangan_summa: tulanganSumma, tulandi, tulangan_vaqt: new Date().toISOString() })
    .eq('id', itemId)
    .eq('car_id', carId)
    .select();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new NotFoundError('Rasxod topilmadi');
  return toItem(data[0]);
}

// Qisman to'lovni bekor qilish — qatorni yana "hech narsa qaytmagan" holatiga qaytaradi.
// To'liq to'langan qatorga tegmaydi (u Undo uchun setTulov(false) dan foydalanadi).
export async function resetPartialPayment(carId: number, itemId: number): Promise<RasxodItem> {
  const { data, error } = await db()
    .from(ITEMS)
    .update({ tulangan_summa: 0, tulangan_vaqt: null })
    .eq('id', itemId)
    .eq('car_id', carId)
    .eq('tulandi', false)
    .select();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new NotFoundError('Rasxod topilmadi');
  return toItem(data[0]);
}

/**
 * Mijoz pulni qaytardi (tulandi=true) yoki xato belgilangan edi (false).
 * itemIds berilmasa — mashinaning barcha qatorlari. Faqat holati haqiqatan
 * o'zgaradigan qatorlar yangilanadi: allaqachon to'langan qatorning
 * to'langan vaqti qayta yozilib ketmaydi.
 */
export async function setTulov(carId: number, tulandi: boolean, itemIds?: number[]): Promise<RasxodItem[]> {
  let query = db()
    .from(ITEMS)
    .update({ tulandi, tulangan_vaqt: tulandi ? new Date().toISOString() : null })
    .eq('car_id', carId)
    .eq('tulandi', !tulandi);
  if (itemIds) query = query.in('id', itemIds);
  const { data, error } = await query.select();
  if (error) throw new Error(error.message);
  return sortItems((data ?? []).map(toItem));
}
