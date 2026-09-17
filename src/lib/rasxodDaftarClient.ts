import { handleJson } from '@/lib/api';
import type { CarInput, ItemInput, RasxodCar, RasxodCarRow, RasxodItem } from '@/lib/rasxodDaftar';

// Rasxod daftari API'si (/api/rasxod-daftar) uchun client funksiyalar.
// Xato bo'lsa server xabari bilan Error tashlaydi (handleJson).

const BASE = '/api/rasxod-daftar';

function send(method: string, body?: unknown): RequestInit {
  return body === undefined
    ? { method }
    : { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } };
}

export async function fetchDaftar(): Promise<RasxodCar[]> {
  const res = await handleJson<{ cars: RasxodCar[] }>(await fetch(BASE, { cache: 'no-store' }));
  return res.cars;
}

export async function createDaftarCar(car: CarInput, items: ItemInput[]): Promise<RasxodCar> {
  const res = await handleJson<{ car: RasxodCar }>(await fetch(BASE, send('POST', { ...car, items })));
  return res.car;
}

export async function updateDaftarCar(id: number, car: CarInput): Promise<RasxodCarRow> {
  const res = await handleJson<{ car: RasxodCarRow }>(await fetch(`${BASE}/${id}`, send('PATCH', car)));
  return res.car;
}

export async function deleteDaftarCar(id: number): Promise<void> {
  await handleJson(await fetch(`${BASE}/${id}`, send('DELETE')));
}

export async function addDaftarItem(carId: number, item: ItemInput): Promise<RasxodItem[]> {
  const res = await handleJson<{ items: RasxodItem[] }>(await fetch(`${BASE}/${carId}/items`, send('POST', item)));
  return res.items;
}

export async function updateDaftarItem(carId: number, itemId: number, patch: Partial<ItemInput>): Promise<RasxodItem> {
  const res = await handleJson<{ item: RasxodItem }>(
    await fetch(`${BASE}/${carId}/items/${itemId}`, send('PATCH', patch)),
  );
  return res.item;
}

export async function deleteDaftarItem(carId: number, itemId: number): Promise<void> {
  await handleJson(await fetch(`${BASE}/${carId}/items/${itemId}`, send('DELETE')));
}

// itemIds berilmasa — mashinaning barcha qatorlari. Javobda faqat holati o'zgargan qatorlar.
export async function setDaftarTulov(carId: number, tulandi: boolean, itemIds?: number[]): Promise<RasxodItem[]> {
  const res = await handleJson<{ items: RasxodItem[] }>(
    await fetch(`${BASE}/${carId}/tulov`, send('POST', { tulandi, itemIds })),
  );
  return res.items;
}

// Qisman to'lov: `summa` qatorning qoldig'iga qo'shiladi (to'liq to'lansa avtomatik "tulandi").
export async function addDaftarPartialPayment(carId: number, itemId: number, summa: number): Promise<RasxodItem> {
  const res = await handleJson<{ item: RasxodItem }>(
    await fetch(`${BASE}/${carId}/items/${itemId}/tulov`, send('POST', { summa })),
  );
  return res.item;
}

// Qisman to'lovni bekor qilish.
export async function resetDaftarPartialPayment(carId: number, itemId: number): Promise<RasxodItem> {
  const res = await handleJson<{ item: RasxodItem }>(
    await fetch(`${BASE}/${carId}/items/${itemId}/tulov`, send('DELETE')),
  );
  return res.item;
}
