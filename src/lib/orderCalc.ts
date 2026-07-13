// ─────────────────────────────────────────────────────────────────────────────
// Buyurtma hisob-kitobi — yagona, sof (pure) manba.
//
// MUHIM: bu mavjud mantiqning AYNAN nusxasi (yangi buyurtma sahifasidagi).
// Hech qanday formulani o'zgartirmang — faqat bitta joyda jamlash va test bilan
// himoyalash uchun ajratildi. O'zgartirsangiz testlar buziladi.
// ─────────────────────────────────────────────────────────────────────────────

export interface ServiceLine {
  narx: number; // xizmat narxi (custom yoki katalog)
  foiz: number; // usta ulushi (%). Usta tanlanmagan bo'lsa 0.
}

export interface PartLine {
  narx: number; // zapchast sotish narxi
  qty: number;  // miqdori
}

export interface OrderTotals {
  servicesTotal: number;
  zarplataTotal: number;
  partsTotal: number;
  subTotal: number;
  finalTotal: number;
  chegirmaRatio: number;
  zarplataAdjusted: number;
  netProfit: number;
}

export function computeOrderTotals(
  services: ServiceLine[],
  parts: PartLine[],
  chegirma: number,
): OrderTotals {
  const discount = chegirma || 0;

  const servicesTotal = services.reduce((sum, s) => {
    const n = s.narx;
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const zarplataTotal = services.reduce((sum, s) => {
    const n = s.narx;
    const foiz = s.foiz || 0;
    return sum + (isNaN(n) ? 0 : n * foiz / 100);
  }, 0);

  // Zapchast narxi miqdorga KO'PAYTIRILMAYDI — narx qanday bo'lsa shundayligicha.
  // Miqdor (qty) faqat ma'lumot uchun saqlanadi.
  const partsTotal = parts.reduce((sum, p) => {
    return sum + (p.narx || 0);
  }, 0);

  const subTotal = servicesTotal + partsTotal;
  const finalTotal = Math.max(0, subTotal - discount);

  // Chegirma usta ulushiga proporsional ta'sir qiladi
  const chegirmaRatio = servicesTotal > 0
    ? Math.max(0, servicesTotal - discount) / servicesTotal
    : 1;
  const zarplataAdjusted = Math.round(zarplataTotal * chegirmaRatio);

  // pribil = chegirmadan keyingi xizmat summasi − ustalar maoshi
  const netProfit = Math.max(0, servicesTotal - discount - zarplataAdjusted);

  return {
    servicesTotal,
    zarplataTotal,
    partsTotal,
    subTotal,
    finalTotal,
    chegirmaRatio,
    zarplataAdjusted,
    netProfit,
  };
}
