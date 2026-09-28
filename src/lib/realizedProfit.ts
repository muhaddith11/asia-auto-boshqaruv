// ─────────────────────────────────────────────────────────────────────────────
// Buyurtmadan HISOBGA OLINADIGAN foyda — yagona, sof (pure) manba.
//
// Biznes qoidasi (boshliq ko'rsatmasi, 2026-09-28): sherik ulushi buyurtma
// TO'LIQ yopilishini kutmaydi — kassaga tushgan pul FOYDA hisobiga boradi.
// Ilgari faqat `holat='tulangan'` buyurtmalar sanalardi: 30 mln lik mashinadan
// 20 mln kassaga tushgan bo'lsa ham, qarzi qolgani uchun sherik undan bir so'm
// ham olmasdi.
//
// Qoida ("to'langan pul foydadan"):
//   • bekor qilingan     → 0 (puli mijozga qaytarilgan)
//   • holat='tulangan'   → foyda TO'LIQ (eski xulq aynan saqlanadi, eski
//                          raqamlar orqaga qarab o'zgarmaydi)
//   • qisman to'langan   → min(hisobga olinadigan to'lov, buyurtma foydasi)
//
// Ya'ni tushgan pul avval FOYDA sifatida sanaladi, buyurtma foydasi tugagach
// ortig'i (zapchast/tannarx qaytimi) qo'shilmaydi — shu sababli ulush hech
// qachon buyurtmaning o'z foydasidan oshmaydi.
//
// MUHIM — SANA CHEGARASI: qisman to'lovlar faqat QISMAN_TOLOV_BOSHLANISHI
// sanasidan boshlab hisobga olinadi. Undan oldingi qisman to'lovlar boshliq
// bilan allaqachon hisob-kitob qilingan (Zeekr 007 #1439 dan boshqa 17 ta
// mashinaning puli "qo'shilgan edi"), shuning uchun ular QAYTA qo'shilmaydi.
//
// Misol (#1439 Zeekr 007): foyda 21 720 600, 2026-09-28 da 20 000 000
// to'langan → hisobga 20 000 000 kiradi → sherik (30%) 6 000 000 oladi.
//
// Test: realizedProfit.spec.ts
// ─────────────────────────────────────────────────────────────────────────────

import { isCancelledHolat } from './stock';

// Qisman to'lovlar shu kundan (va keyin) hisobga olinadi — YYYY-MM-DD.
export const QISMAN_TOLOV_BOSHLANISHI = '2026-09-28';

export interface RealizedProfitOrderLike {
  id?: number | string;
  holat: string;
  pribil?: number;
  final?: number;
  total?: number;
  paid?: number;
}

export interface PaymentOpLike {
  type?: string;
  category?: string;
  source?: string;
  amount?: number;
  comment?: string;
  date?: string;
  createdAt?: string;
  created_at?: string;
  orderId?: string | number;
  order_id?: string | number;
}

// Operatsiya kuni (YYYY-MM-DD) — dailyReport.ts dagi opDay bilan bir xil tartib.
function opDay(op: PaymentOpLike): string {
  return String(op.date || op.createdAt || op.created_at || '').slice(0, 10);
}

// To'lov operatsiyasi qaysi buyurtmaga tegishli (DB'da order_id ustuni yo'q —
// bog'lanish comment orqali: "Buyurtma #123 ...").
function paymentOrderId(op: PaymentOpLike): number | null {
  const direct = op.order_id ?? op.orderId;
  if (direct !== null && direct !== undefined && direct !== '') {
    const n = Number(direct);
    return Number.isFinite(n) ? n : null;
  }
  const m = op.comment ? op.comment.match(/Buyurtma #(\d+)/) : null;
  return m ? Number(m[1]) : null;
}

// Buyurtma id → belgilangan sanadan boshlab kassaga tushgan to'lov summasi.
export function buildQismanTolovMap(
  ops: PaymentOpLike[] | null | undefined,
  boshlanish: string = QISMAN_TOLOV_BOSHLANISHI,
): Map<number, number> {
  const map = new Map<number, number>();
  for (const op of ops || []) {
    if (!op || op.type !== 'income') continue;
    const isOrderPayment = op.source === 'buyurtma' || op.category === "Buyurtma to'lovi";
    if (!isOrderPayment) continue;
    const day = opDay(op);
    if (!day || day < boshlanish) continue;
    const oid = paymentOrderId(op);
    if (oid === null || Number.isNaN(oid)) continue;
    map.set(oid, (map.get(oid) || 0) + (Number(op.amount) || 0));
  }
  return map;
}

// Shu buyurtmadan foyda hisobiga kiradigan summa.
// `qismanTolov` — buildQismanTolovMap'dan olingan, sana chegarasidan keyingi
// to'lov summasi. Berilmasa (yoki 0) qisman to'lov hisobga olinmaydi.
// Manfiy foyda 0 sifatida olinadi — mavjud hisob-kitoblar bilan izchil.
export function realizedProfit(
  order: RealizedProfitOrderLike | null | undefined,
  qismanTolov?: number,
): number {
  if (!order || isCancelledHolat(order.holat)) return 0;
  const pribil = Math.max(0, Number(order.pribil) || 0);
  if (pribil === 0) return 0;
  if (order.holat === 'tulangan') return pribil;
  return Math.min(Math.max(0, Number(qismanTolov) || 0), pribil);
}
