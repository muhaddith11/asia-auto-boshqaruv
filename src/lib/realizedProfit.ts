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
//   • qisman to'langan   → min(to'langan pul, buyurtma foydasi)
//
// Ya'ni tushgan pul avval FOYDA sifatida sanaladi, buyurtma foydasi tugagach
// ortig'i (zapchast/tannarx qaytimi) qo'shilmaydi — shu sababli ulush hech
// qachon buyurtmaning o'z foydasidan oshmaydi.
//
// Misol (#1439 Zeekr 007): foyda 21 720 600, to'langan 20 000 000 →
// hisobga olinadi 20 000 000 → sherik (30%) 6 000 000 oladi.
//
// Test: realizedProfit.spec.ts
// ─────────────────────────────────────────────────────────────────────────────

import { isCancelledHolat } from './stock';

export interface RealizedProfitOrderLike {
  holat: string;
  pribil?: number;
  final?: number;
  total?: number;
  paid?: number;
}

// Buyurtmaga qancha pul tushgani. `holat='tulangan'` bo'lsa — to'liq summa
// (eski yozuvlarda `paid` ustuni bo'sh bo'lishi mumkin, holat yetarli).
export function orderPaid(order: RealizedProfitOrderLike | null | undefined): number {
  if (!order || isCancelledHolat(order.holat)) return 0;
  const narx = Number(order.final ?? order.total) || 0;
  if (order.holat === 'tulangan') return Math.max(narx, Number(order.paid) || 0);
  return Math.max(0, Number(order.paid) || 0);
}

// Shu buyurtmadan foyda hisobiga kiradigan summa.
// Manfiy foyda 0 sifatida olinadi — mavjud hisob-kitoblar bilan izchil.
export function realizedProfit(order: RealizedProfitOrderLike | null | undefined): number {
  if (!order || isCancelledHolat(order.holat)) return 0;
  const pribil = Math.max(0, Number(order.pribil) || 0);
  if (pribil === 0) return 0;
  if (order.holat === 'tulangan') return pribil;
  return Math.min(orderPaid(order), pribil);
}
