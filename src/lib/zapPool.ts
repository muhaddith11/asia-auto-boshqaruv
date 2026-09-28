// ─────────────────────────────────────────────────────────────────────────────
// "Kassaga tushmagan zapchast puli" — yagona, sof (pure) manba.
//
// Buyurtmalarda "alohida" (galochka) belgilangan zapchastlarning puli KASSAGA
// TUSHMAYDI (PaymentModal uni kassa summasidan chiqarib tashlaydi) — u alohida
// yig'ilib boradi. Ehtiyot qismlar sahifasidagi banner shuni ko'rsatadi.
//
// Boshliq o'sha puldan olib ishlatishi mumkin (masalan ta'minotchiga berish) —
// har bir olingan summa `zap_puli_chiqim` jadvaliga yoziladi va bannerdagi
// QOLDIQ shunga kamayadi:
//     qoldiq = yig'ilgan tushum − chiqimlar
//
// FOYDA (narx − tannarx) chiqimdan o'zgarmaydi: chiqim pulning qayerga ketganini
// yozadi, zapchastdan topilgan foydani kamaytirmaydi.
//
// Kassa/operations bilan bog'liqligi YO'Q — bu pul kassada hech qachon bo'lmagan.
//
// Test: zapPool.spec.ts
// ─────────────────────────────────────────────────────────────────────────────

import { isCancelledHolat } from './stock';

export interface ZapPoolZapLike {
  id?: number | string | null;
  narx?: number | string;
  price?: number | string;
  sebestoimost?: number | string;
  alohida?: boolean;
}

export interface ZapPoolOrderLike {
  holat?: string;
  zaps?: ZapPoolZapLike[] | null;
}

// Ombordagi zapchast (eski buyurtmalarda tannarx saqlanmagan bo'lsa — shundan olinadi)
export interface ZapPoolPartLike {
  id: number | string;
  sebestoimost?: number | string;
}

// Bazadagi chiqim qatori
export interface ZapPoolChiqim {
  id: number;
  summa: number;
  izoh: string;
  sana: string; // YYYY-MM-DD
  created_at: string;
}

export interface ZapPoolHisob {
  tushum: number; // yig'ilgan (alohida zapchastlar sotish narxi)
  foyda: number;  // narx − tannarx
  chiqim: number; // banner ostidagi ayirilgan summalar
  qoldiq: number; // tushum − chiqim (manfiy bo'lishi mumkin — yashirilmaydi)
}

const num = (v: unknown) => Number(v ?? 0) || 0;

// Buyurtmalardagi "alohida" zapchastlar bo'yicha tushum va foyda.
// Bekor qilingan buyurtmalar hisobga olinmaydi. Narx miqdorga KO'PAYTIRILMAYDI
// (butun tizimda shunday — orderCalc.ts, bot-ui/submit).
export function computeZapPoolYigilgan(
  orders: ZapPoolOrderLike[] | null | undefined,
  parts: ZapPoolPartLike[] | null | undefined,
): { tushum: number; foyda: number } {
  const partById = new Map<string, ZapPoolPartLike>((parts || []).map((p) => [String(p.id), p]));

  return (orders || []).reduce(
    (acc, b) => {
      if (!b || isCancelledHolat(b.holat)) return acc;
      for (const z of b.zaps || []) {
        if (!z || z.alohida !== true) continue;
        const narx = num(z.narx ?? z.price);
        // Kelish narxi buyurtma ichida saqlangan bo'lsa o'shani, aks holda
        // (eski buyurtmalar) zapchast ID orqali joriy ombordan olamiz.
        let sebestoimost = num(z.sebestoimost);
        if (!sebestoimost && z.id !== null && z.id !== undefined) {
          sebestoimost = num(partById.get(String(z.id))?.sebestoimost);
        }
        acc.tushum += narx;
        acc.foyda += narx - sebestoimost;
      }
      return acc;
    },
    { tushum: 0, foyda: 0 },
  );
}

export function chiqimTotal(chiqimlar: ZapPoolChiqim[] | null | undefined): number {
  return (chiqimlar || []).reduce((s, c) => s + num(c?.summa), 0);
}

// Banner uchun to'liq hisob.
export function computeZapPool(
  orders: ZapPoolOrderLike[] | null | undefined,
  parts: ZapPoolPartLike[] | null | undefined,
  chiqimlar: ZapPoolChiqim[] | null | undefined,
): ZapPoolHisob {
  const { tushum, foyda } = computeZapPoolYigilgan(orders, parts);
  const chiqim = chiqimTotal(chiqimlar);
  return { tushum, foyda, chiqim, qoldiq: tushum - chiqim };
}

// ── API kirish ma'lumotini tekshirish ────────────────────────────────────────

export interface ChiqimInput {
  summa: number;
  izoh: string;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseChiqimInput(body: Record<string, unknown> | null | undefined): ParseResult<ChiqimInput> {
  const summa = Math.round(Number(body?.summa ?? 0));
  if (!Number.isFinite(summa) || summa <= 0) return { ok: false, error: 'Summani kiriting' };
  const izoh = String(body?.izoh ?? '').trim().slice(0, 300);
  return { ok: true, value: { summa, izoh } };
}
