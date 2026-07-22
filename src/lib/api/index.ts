import { Mijoz, Buyurtma, Xodim, Zapchast, Kassa, ZapPurchase } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api';

// ─────────────────────────────────────────────────────────────────────────────
// Bu modul faqat @/store/useStore.ts tomonidan ishlatiladi. Route handlerlar
// (server) xato bo'lsa non-2xx status bilan qaytaradi va handleJson shuni
// Error qilib tashlaydi — shuning uchun muvaffaqiyatli javobda `error` maydoni
// odatda bo'lmaydi. Baribir chaqiruvchi tomon (useStore) buni himoya sifatida
// tekshiradi, shu sabab Maybe<T> orqali `error`/`message` ham ruxsat etiladi.
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiErrorShape {
  error?: string;
  message?: string;
}

export type Maybe<T> = T & ApiErrorShape;

export interface DeleteResult {
  success?: boolean;
  deleted?: unknown;
  error?: string;
}

// `services_list` jadvalidagi qator (DB sxema — snake_case, Xizmat dan farqli).
export interface ServiceRow {
  id: number;
  name: string;
  price: number;
  brand: string;
  car_model: string;
  stavka?: number;
}

// `cars_list` jadvalidagi qator.
export interface CarRow {
  brand: string;
  name: string;
}

// `salaries` jadvalidagi qator.
export interface SalaryRow {
  id: number;
  worker_id: number;
  amount: number;
  method: string;
  date: string;
  comment?: string;
  created_at: string;
}

// `operations` jadvalidagi qator.
export interface OperationRow {
  id: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  method: 'naqd' | 'karta';
  amount: number;
  category: string;
  comment?: string;
  source: string;
  tomethod?: string | null;
  created_at: string;
}

async function handleJson<T>(res: Response): Promise<T> {
  // Sessiya tugagan/yo'q — foydalanuvchini login sahifasiga qaytaramiz.
  // Aks holda sahifa ochiq turaveradi va har bir saqlash jim ravishda
  // "Avtorizatsiya talab qilinadi" xatosi bilan yiqiladi.
  //
  // ⚠️ Login sahifasida yo'naltirmaymiz! Login sahifasi (dashboard) guruhi
  // ichida bo'lgani uchun u yerda ham API chaqiriladi va sessiyasiz 401
  // qaytaradi — bu cheksiz qayta yuklanish halqasini hosil qiladi.
  if (
    res.status === 401 &&
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith('/login') &&
    !window.location.pathname.startsWith('/bot-ui')
  ) {
    window.location.href = '/login';
    throw new Error('Sessiya muddati tugagan. Qaytadan tizimga kiring.');
  }
  if (!res.ok) {
    const errorData: ApiErrorShape = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getClients(): Promise<Mijoz[]> {
  const res = await fetch(`${API_BASE}/clients`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createClient(data: Partial<Mijoz>): Promise<Maybe<Mijoz>> {
  const res = await fetch(`${API_BASE}/clients`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updateClient(id: number | string, data: Partial<Mijoz>): Promise<Maybe<Mijoz>> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function deleteClient(id: number | string): Promise<DeleteResult> {
  const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getOrders(): Promise<Buyurtma[]> {
  const res = await fetch(`${API_BASE}/orders`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createOrder(data: Partial<Buyurtma>): Promise<Maybe<Buyurtma>> {
  const res = await fetch(`${API_BASE}/orders`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updateOrder(id: number | string, data: Partial<Buyurtma>): Promise<Maybe<Buyurtma>> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function deleteOrder(id: number | string): Promise<DeleteResult> {
  const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getWorkers(): Promise<Xodim[]> {
  const res = await fetch(`${API_BASE}/workers`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createWorker(data: Partial<Xodim>): Promise<Maybe<Xodim>> {
  const res = await fetch(`${API_BASE}/workers`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export const updateWorker = (id: number | string, w: Partial<Xodim>): Promise<Maybe<Xodim>> =>
  fetch(`${API_BASE}/workers/${id}`, {
    method: 'POST', // Use POST for stability
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(w)
  }).then((res) => handleJson<Maybe<Xodim>>(res));

export async function deleteWorker(id: number | string): Promise<DeleteResult> {
  const res = await fetch(`${API_BASE}/workers/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getParts(): Promise<Zapchast[]> {
  const res = await fetch(`${API_BASE}/parts`, { cache: 'no-store' });
  return handleJson(res);
}

export async function getCars(): Promise<CarRow[]> {
  const res = await fetch(`${API_BASE}/cars`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createPart(data: Partial<Zapchast>): Promise<Maybe<Zapchast>> {
  const res = await fetch(`${API_BASE}/parts`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updatePart(id: number | string, data: Partial<Zapchast>): Promise<Maybe<Zapchast>> {
  const res = await fetch(`${API_BASE}/parts/${id}`, {
    method: 'POST', // Use POST for stability
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function deletePart(id: number | string): Promise<DeleteResult> {
  const res = await fetch(`${API_BASE}/parts/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getReports(): Promise<unknown> {
  const res = await fetch(`${API_BASE}/reports`, { cache: 'no-store' });
  return handleJson(res);
}

export async function getServices(carModel?: string): Promise<ServiceRow[]> {
  const url = carModel ? `${API_BASE}/services?car_model=${encodeURIComponent(carModel)}` : `${API_BASE}/services`;
  const res = await fetch(url, { cache: 'no-store' });
  return handleJson(res);
}

// POST /api/services upsertlaydi (batch qo'llab-quvvatlaydi) va bazadan
// har doim massiv qaytaradi — lekin chaqiruvchi (addXizmat) tarixiy sababларга
// ko'ra bittalik javobni ham hisobga oladi, shu sabab ikkalasini ham ruxsat beramiz.
export async function createService(data: Partial<ServiceRow>): Promise<Maybe<ServiceRow | ServiceRow[]>> {
  const res = await fetch(`${API_BASE}/services`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updateService(id: string | number, data: Partial<ServiceRow>): Promise<Maybe<ServiceRow>> {
  const res = await fetch(`${API_BASE}/services/${id}`, {
    method: 'POST', // Use POST for stability
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function deleteService(id: string | number): Promise<DeleteResult> {
  const res = await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

// Financial Endpoints
export async function getKassa(): Promise<Kassa> {
  const res = await fetch(`${API_BASE}/kassa`, { cache: 'no-store' });
  return handleJson(res);
}

export async function updateKassaState(data: { naqd: number; karta: number }): Promise<Maybe<Kassa>> {
  const res = await fetch(`${API_BASE}/kassa`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function getOperations(): Promise<OperationRow[]> {
  const res = await fetch(`${API_BASE}/operations`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createOperation(data: Partial<OperationRow> & { toMethod?: string }): Promise<Maybe<OperationRow>> {
  const res = await fetch(`${API_BASE}/operations`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function deleteOperation(id: string | number): Promise<DeleteResult> {
  const res = await fetch(`${API_BASE}/operations/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getSalaries(): Promise<SalaryRow[]> {
  const res = await fetch(`${API_BASE}/salaries`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createSalary(data: { worker_id: number; amount: number; method: string; date: string; comment?: string }): Promise<Maybe<SalaryRow>> {
  const res = await fetch(`${API_BASE}/salaries`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function getPurchases(): Promise<ZapPurchase[]> {
  const res = await fetch(`${API_BASE}/purchases`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createPurchase(data: Partial<ZapPurchase>): Promise<Maybe<ZapPurchase>> {
  const res = await fetch(`${API_BASE}/purchases`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

// POST /api/cars data[0] emas, to'liq massivni qaytaradi (upsert natijasi).
export async function createCar(brand: string, name: string): Promise<Maybe<CarRow[]>> {
  const res = await fetch(`${API_BASE}/cars`, {
    method: 'POST',
    body: JSON.stringify({ brand, name }),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}
