import supabase from '@/lib/supabaseClient';
import { fetchAllRows } from '@/lib/fetchAllRows';
import {
  joinCarsWithItems, paidAmount, sortItems, tashkentDate,
  type CarInput, type ItemInput, type RasxodCar, type RasxodCarRow, type RasxodItem,
} from '@/lib/rasxodDaftar';

// ─────────────────────────────────────────────────────────────────────────────
// Rasxod daftari (rasxod_cars + rasxod_items) bilan ishlash — server-only.
// Kirish tekshiruvi route darajasida. KASSAGA TEGMAYDI (qarang: rasxodDaftar.ts),
// faqat writeOffToIshxona / undoWriteOff bundan mustasno.
// ─────────────────────────────────────────────────────────────────────────────

const CARS = 'rasxod_cars';
const ITEMS = 'rasxod_items';
const ISHXONA_LOCKED = "Bu rasxod ishxonaga yozilgan — avval «Qaytarish» bilan chiqimni bekor qiling";

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
    ishxona_op_id: row.ishxona_op_id === null || row.ishxona_op_id === undefined ? null : Number(row.ishxona_op_id),
    ishxona_vaqt: optStr(row.ishxona_vaqt),
    created_at: str(row.created_at),
  };
}

async function getItem(carId: number, itemId: number): Promise<RasxodItem> {
  const { data, error } = await db().from(ITEMS).select('*').eq('id', itemId).eq('car_id', carId);
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new NotFoundError('Rasxod topilmadi');
  return toItem(data[0]);
}

// Shartli update/delete hech narsaga tegmasa — sabab: qator yo'qmi yoki ishxonaga yozilganmi.
async function lockedOrMissing(carId: number, itemId: number): Promise<never> {
  await getItem(carId, itemId); // yo'q bo'lsa NotFoundError
  throw new ValidationError(ISHXONA_LOCKED);
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

// Qatorlari ham o'chadi (on delete cascade). Ishxonaga yozilgan qatori bo'lsa — rad
// etiladi: kassadan chiqqan pulning izi daftardan yo'qolmasin.
export async function deleteCar(id: number): Promise<RasxodCarRow> {
  const locked = await db().from(ITEMS).select('id').eq('car_id', id).not('ishxona_op_id', 'is', null).limit(1);
  if (locked.error) throw new Error(locked.error.message);
  if (locked.data?.length) throw new ValidationError(ISHXONA_LOCKED);

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

// Ishxonaga yozilgan qatorning summasi o'zgarmaydi — aks holda chiqim bilan mos kelmay qoladi.
export async function updateItem(carId: number, itemId: number, patch: Partial<ItemInput>): Promise<RasxodItem> {
  let query = db()
    .from(ITEMS)
    .update(patch)
    .eq('id', itemId)
    .eq('car_id', carId);
  if (patch.summa !== undefined) query = query.is('ishxona_op_id', null);
  const { data, error } = await query.select();
  if (error) throw new Error(error.message);
  if (!data?.[0]) {
    if (patch.summa !== undefined) return lockedOrMissing(carId, itemId);
    throw new NotFoundError('Rasxod topilmadi');
  }
  return toItem(data[0]);
}

export async function deleteItem(carId: number, itemId: number): Promise<RasxodItem> {
  const { data, error } = await db()
    .from(ITEMS)
    .delete()
    .eq('id', itemId)
    .eq('car_id', carId)
    .is('ishxona_op_id', null)
    .select();
  if (error) throw new Error(error.message);
  if (!data?.[0]) return lockedOrMissing(carId, itemId);
  return toItem(data[0]);
}

/**
 * Mijoz rasxodning bir qismini qaytardi: `summa` qatorning qoldig'iga qo'shiladi.
 * Qoldiq nolga tushsa qator avtomatik "tulandi" bo'ladi. Summa qoldiqdan katta
 * bo'lsa yoki qator allaqachon to'liq to'langan bo'lsa — ValidationError.
 */
export async function addPartialPayment(carId: number, itemId: number, summa: number): Promise<RasxodItem> {
  const item = await getItem(carId, itemId);
  if (item.tulandi) throw new ValidationError("Bu rasxod allaqachon to'liq to'langan");
  if (item.ishxona_op_id !== null) throw new ValidationError(ISHXONA_LOCKED);
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
    .is('ishxona_op_id', null) // ishxona summasi = yozilgan paytdagi qoldiq — o'zgarmasin
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
  // "Hammasi to'landi" ishxonaga yozilgan qatorni ham to'langan qilib qo'ymasin.
  if (tulandi) query = query.is('ishxona_op_id', null);
  if (itemIds) query = query.in('id', itemIds);
  const { data, error } = await query.select();
  if (error) throw new Error(error.message);
  return sortItems((data ?? []).map(toItem));
}

// Kassadagi naqd pulni `delta` ga o'zgartiradi. Absolyut qiymat yoziladi — bot rasxodi
// (/api/bot-ui/rasxod) va /api/orders/[id]/payment bilan bir xil semantika.
async function shiftNaqd(delta: number): Promise<void> {
  const { data: kassa, error: readErr } = await db().from('kassa').select('naqd, karta').eq('id', 1).maybeSingle();
  if (readErr) throw new Error(readErr.message);
  const { error } = await db()
    .from('kassa')
    .upsert({ id: 1, naqd: Number(kassa?.naqd || 0) + delta, karta: Number(kassa?.karta || 0), updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export interface IshxonaResult {
  item: RasxodItem;
  opId: number;
  amount: number;
}

/**
 * Mijoz qaytarmaydigan rasxodni ishxona ko'taradi: qatorning qoldig'i 'Ishxona'
 * chiqimi bo'lib yoziladi va naqd kassadan ayiriladi. Qator yopiladi (ishxona_op_id).
 * Biror qadam o'tmasa, oldingilari orqaga qaytariladi — kassa izsiz o'zgarmasin.
 */
export async function writeOffToIshxona(carId: number, itemId: number): Promise<IshxonaResult> {
  const item = await getItem(carId, itemId);
  if (item.tulandi) throw new ValidationError("Bu rasxod allaqachon to'langan");
  if (item.ishxona_op_id !== null) throw new ValidationError('Bu rasxod allaqachon ishxonaga yozilgan');
  const amount = item.summa - paidAmount(item);
  if (amount <= 0) throw new ValidationError("Bu rasxodning qoldig'i yo'q");

  const { data: carRows, error: carErr } = await db().from(CARS).select('mashina, raqam').eq('id', carId);
  if (carErr) throw new Error(carErr.message);
  const car = carRows?.[0];
  if (!car) throw new NotFoundError('Mashina topilmadi');
  const carLabel = [str(car.mashina), str(car.raqam)].filter(Boolean).join(' ');

  const { data: op, error: opErr } = await db()
    .from('operations')
    .insert([{
      date: tashkentDate(),
      type: 'expense',
      method: 'naqd',
      amount,
      category: 'Ishxona',
      comment: `Rasxod daftari: ${item.nom}${carLabel ? ` — ${carLabel}` : ''}`,
      source: 'manual',
    }])
    .select()
    .single();
  if (opErr || !op) throw new Error(opErr?.message || 'Chiqim yozilmadi');
  const opId = Number(op.id);
  const dropOp = () => db().from('operations').delete().eq('id', opId);

  // Qatorni band qilamiz — ikki marta bosilsa yoki shu payt to'langan bo'lsa, ikkinchi chiqim qolmaydi.
  const { data: claimed, error: claimErr } = await db()
    .from(ITEMS)
    .update({ ishxona_op_id: opId, ishxona_vaqt: new Date().toISOString() })
    .eq('id', itemId)
    .eq('car_id', carId)
    .eq('tulandi', false)
    .is('ishxona_op_id', null)
    .select();
  if (claimErr || !claimed?.[0]) {
    await dropOp();
    if (claimErr) throw new Error(claimErr.message);
    throw new ValidationError("Rasxod holati o'zgargan — sahifani yangilang");
  }

  try {
    await shiftNaqd(-amount);
  } catch (err) {
    await dropOp(); // FK qatorning ishxona_op_id'sini o'zi tozalaydi
    await db().from(ITEMS).update({ ishxona_vaqt: null }).eq('id', itemId);
    throw new Error(`Kassa yangilanmadi: ${err instanceof Error ? err.message : String(err)}`);
  }
  return { item: toItem(claimed[0]), opId, amount };
}

/**
 * Adashib bosilgan "Ishxonaga"ni qaytarish: chiqim o'chadi, pul naqd kassaga qaytadi,
 * qator yana ochiq bo'ladi. Chiqim boshqa joydan allaqachon o'chirilgan bo'lsa
 * (FK qatorni o'zi ochadi) — kassaga tegilmaydi.
 */
export async function undoWriteOff(carId: number, itemId: number): Promise<IshxonaResult> {
  const item = await getItem(carId, itemId);
  const opId = item.ishxona_op_id;
  if (opId === null) throw new ValidationError('Bu rasxod ishxonaga yozilmagan');

  const { data: deleted, error: delErr } = await db().from('operations').delete().eq('id', opId).select();
  if (delErr) throw new Error(delErr.message);
  const amount = Number(deleted?.[0]?.amount) || 0;

  const { data, error } = await db()
    .from(ITEMS)
    .update({ ishxona_op_id: null, ishxona_vaqt: null })
    .eq('id', itemId)
    .eq('car_id', carId)
    .select();
  if (error) throw new Error(error.message);
  if (!data?.[0]) throw new NotFoundError('Rasxod topilmadi');

  if (amount > 0) {
    try {
      await shiftNaqd(amount);
    } catch (err) {
      throw new Error(
        `Chiqim o'chirildi, lekin kassa yangilanmadi — ${amount.toLocaleString('ru-RU')} so'mni kassaga qo'lda qaytaring (${err instanceof Error ? err.message : String(err)})`,
      );
    }
  }
  return { item: toItem(data[0]), opId, amount };
}
