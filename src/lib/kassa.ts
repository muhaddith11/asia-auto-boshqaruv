import supabase from '@/lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Kassa qoldig'ini FAQAT shu fayl orqali o'zgartiring.
//
// Ilgari klient brauzerdagi raqamga qo'shib, natijani ABSOLYUT yozardi. Oradan
// bot rasxodi yoki boshqa tab yozgan bo'lsa, o'sha o'zgarish bosib ketilardi.
// Endi server faqat "shuncha qo'sh/ayir" deydi, baza buni bitta UPDATE ichida
// bajaradi (db/kassa_ozgartir.sql).
// ─────────────────────────────────────────────────────────────────────────────

export interface KassaDelta {
  naqd: number;
  karta: number;
}

export interface KassaBalance {
  naqd: number;
  karta: number;
}

type KassaMethod = 'naqd' | 'karta';

const isKassaMethod = (value: unknown): value is KassaMethod => value === 'naqd' || value === 'karta';

const methodDelta = (method: KassaMethod, amount: number): KassaDelta => ({
  naqd: method === 'naqd' ? amount : 0,
  karta: method === 'karta' ? amount : 0,
});

export async function changeKassa(delta: KassaDelta): Promise<KassaBalance> {
  const { data, error } = await supabase.rpc('kassa_ozgartir', { p_naqd: delta.naqd, p_karta: delta.karta });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Kassa qatori topilmadi');
  return { naqd: Number(row.naqd) || 0, karta: Number(row.karta) || 0 };
}

export const invertDelta = (delta: KassaDelta): KassaDelta => ({
  naqd: 0 - delta.naqd,
  karta: 0 - delta.karta,
});

// income — kirim, expense — chiqim, transfer — ikki hisob orasida.
// Boshqa turdagi yoki noto'g'ri summali yozuv kassaga tegmaydi (null).
export function operationDelta(op: {
  type?: unknown;
  method?: unknown;
  tomethod?: unknown;
  amount?: unknown;
}): KassaDelta | null {
  const amount = Number(op.amount);
  if (!Number.isFinite(amount) || amount <= 0 || !isKassaMethod(op.method)) return null;

  if (op.type === 'income') return methodDelta(op.method, amount);
  if (op.type === 'expense') return methodDelta(op.method, 0 - amount);
  if (op.type === 'transfer' && isKassaMethod(op.tomethod) && op.tomethod !== op.method) {
    const from = methodDelta(op.method, 0 - amount);
    const to = methodDelta(op.tomethod, amount);
    return { naqd: from.naqd + to.naqd, karta: from.karta + to.karta };
  }
  return null;
}

// Maosh kassadan chiqadi. shtraf, bonus va tashqi kassaga tegmaydi.
export function salaryDelta(salary: { method?: unknown; amount?: unknown }): KassaDelta | null {
  const amount = Number(salary.amount);
  if (!Number.isFinite(amount) || amount <= 0 || !isKassaMethod(salary.method)) return null;
  return methodDelta(salary.method, 0 - amount);
}
