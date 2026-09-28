// ─────────────────────────────────────────────────────────────────────────────
// Boshliqning "Ishxona bo'yicha" hisoboti uchun FOYDA hisob-kitobi — yagona,
// sof (pure) manba.
//
// Boshliq ko'radigan ASOSIY raqam endi KIRIM emas, ISHXONA FOYDASI:
//
//   Foyda = Kirim − Zapchast − To'langan ish xaqi − Ishxona xarajati
//
// Har bir qism nimani anglatadi va NEGA hech narsa ikki marta ayirilmaydi:
//
// 1) KIRIM — davr ichida kassaga tushgan hamma pul (buyurtma to'lovlari +
//    boshqa kirimlar). buildLedgerRows'dagi musbat qatorlar yig'indisi.
//
// 2) ZAPCHAST — o'sha to'lovlar ICHIDAGI zapchast puli. Zapchast puli
//    ishxonaning topgani emas: u zapchastga ketadi. Shuning uchun kirimdan
//    chiqariladi. Ikki muhim nuqta:
//      • "alohida" belgilangan zapchast puli KASSAGA umuman tushmaydi
//        (PaymentModal uni kassa summasidan chiqarib tashlaydi) — demak
//        kirimda ham yo'q, shuning uchun bu yerda ham AYIRILMAYDI;
//      • "Rasxod" qatorlari (xodim bot orqali mashinaga sotib olgan zapchast)
//        zapchast sifatida AYIRILADI — shuning uchun ularning kassa chiqim
//        operatsiyasi (_isRasxod) "Ishxona xarajati"dan chiqarib tashlanadi.
//        Aks holda bitta pul ikki marta ayirilardi.
//
// 3) TO'LANGAN ISH XAQI — davr ichida kassadan HAQIQATAN chiqqan maoshlar
//    (maoshTarixi; shtraf/bonus kirmaydi). Buyurtmadagi "usta ulushi"
//    (order.zarplata) EMAS — aks holda ish haqi ikki marta ayirilardi.
//    To'langan maosh usta ulushidan kattaroq (oylik xodimlar, sherik ulushi
//    ham shu yerda), shuning uchun foyda shishirilmaydi.
//
// 4) ISHXONA XARAJATI — qolgan barcha chiqimlar (ijara, kommunal, asbob,
//    soliq va h.k.) — rasxod operatsiyalaridan tashqari (2-bandga qarang).
//
// Test: bossProfit.spec.ts
// ─────────────────────────────────────────────────────────────────────────────

import type { LedgerRow } from './businessLedger';

export interface BossZapLike {
  nom?: string;
  name?: string;
  narx?: number;
  price?: number;
  qty?: number;
  quantity?: number;
  alohida?: boolean;
  rasxod?: boolean;
  kat?: string;
}

export interface BossOrderLike {
  id: number | string;
  final?: number; // chegirma AYIRILGAN yakuniy summa
  zaps?: BossZapLike[] | null;
}

export interface BossPartLine {
  nom: string;
  qty: number;
  narx: number;
  rasxod: boolean;  // xodim bot orqali kiritgan xarajat qatori
  alohida: boolean; // puli kassaga tushmagan
}

// Zapchast qatori "Rasxod" (xodim sotib olgan xarajat) qatorimi?
export function isRasxodZap(z: BossZapLike | null | undefined): boolean {
  return !!z && (z.rasxod === true || z.kat === 'Rasxod');
}

// Zapchast narxi. Narx miqdorga KO'PAYTIRILMAYDI — butun tizimda shunday
// (orderCalc.ts, bot-ui/submit), miqdor faqat ma'lumot uchun saqlanadi.
export function zapNarx(z: BossZapLike | null | undefined): number {
  return Number(z?.narx ?? z?.price ?? 0) || 0;
}

// Buyurtmaning zapchastlari — ro'yxat ko'rinishida (rasxod qatorlari ham
// KIRADI, chunki ular ham kirimdan ayiriladigan zapchast puli).
export function orderPartLines(zaps: BossZapLike[] | null | undefined): BossPartLine[] {
  return (zaps || [])
    .filter((z): z is BossZapLike => !!z)
    .map((z) => ({
      nom: z.nom || z.name || 'Nomsiz',
      qty: Number(z.qty ?? z.quantity ?? 1) || 1,
      narx: zapNarx(z),
      rasxod: isRasxodZap(z),
      alohida: z.alohida === true,
    }));
}

// Buyurtmadagi KASSAGA TUSHGAN zapchast puli — "alohida" belgilanganlar
// kirimga umuman qo'shilmagani uchun bu yerda ham hisobga olinmaydi.
export function orderPartsCash(order: BossOrderLike | null | undefined): number {
  return orderPartLines(order?.zaps).reduce((s, p) => (p.alohida ? s : s + p.narx), 0);
}

// Buyurtma bo'yicha KASSAGA tushishi kerak bo'lgan summa:
//   yakuniy narx (CHEGIRMA allaqachon ayirilgan) − "alohida" zapchastlar puli.
// PaymentModal aynan shu summani kassaga oladi — zapchastni to'lovlarga
// taqsimlashda shu raqam "maxraj" bo'ladi.
export function orderKassaTotal(order: BossOrderLike | null | undefined): number {
  const final = Number(order?.final) || 0;
  const alohida = orderPartLines(order?.zaps).reduce((s, p) => (p.alohida ? s + p.narx : s), 0);
  return Math.max(0, final - alohida);
}

export interface BossOrderRowLike {
  row: Pick<LedgerRow, '_id' | '_amount' | '_orderId'>;
  order?: BossOrderLike | null;
}

export type WithProfit<T> = T & { zapchast: number; foyda: number };

// Har bir to'lov qatoriga zapchast ulushini biriktiradi.
//
// Zapchast TO'LANGAN ULUSHGA qarab ayiriladi: mijoz buyurtmaning yarmini
// to'lagan bo'lsa, zapchastning ham yarmi ayiriladi. Shu sababli:
//   • qisman to'langan mashina "katta zarar" bo'lib ko'rinmaydi (qolgan puli
//     kelganda o'z ulushi o'sha kunga tushadi);
//   • bir buyurtma ikki oyga bo'linib to'lansa, zapchast ikkala oyga TO'LIQ
//     emas, har oyga o'z ulushi bo'lib tushadi;
//   • to'liq to'langanda zapchast to'la ayiriladi (yaxlitlash qoldig'i oxirgi
//     qatorga beriladi — yig'indi tiyinigacha mos keladi).
// Maxraj — buyurtmaning kassaga tushishi kerak bo'lgan summasi (CHEGIRMA
// ayirilgan): chegirma qancha katta bo'lsa, ayni to'lovga shuncha ko'p
// zapchast to'g'ri keladi, ya'ni chegirma foydadan chiqadi.
export function attachOrderProfit<T extends BossOrderRowLike>(rows: T[]): WithProfit<T>[] {
  const groups = new Map<string, T[]>();
  for (const r of rows) {
    const key = r.row._orderId != null ? `o${r.row._orderId}` : `r${r.row._id}`;
    const list = groups.get(key);
    if (list) list.push(r);
    else groups.set(key, [r]);
  }

  const out = new Map<string, WithProfit<T>>();
  for (const list of groups.values()) {
    const order = list[0].order;
    const zapTotal = orderPartsCash(order);
    const tolangan = list.reduce((s, r) => s + (Number(r.row._amount) || 0), 0);
    // Ortiqcha to'lov yoki narx noma'lum bo'lsa — to'langan summaning o'ziga
    // tayanamiz (aks holda zapchast ulushi 100% dan oshib ketardi).
    const baza = Math.max(orderKassaTotal(order), tolangan);
    const toliq = baza <= 0 || tolangan >= baza; // qarz qolmagan
    let qoldiq = zapTotal;
    list.forEach((r, i) => {
      const amount = Number(r.row._amount) || 0;
      const oxirgi = i === list.length - 1;
      // To'liq to'langanda oxirgi qatorga qoldiqni beramiz — yaxlitlash tufayli
      // bir-ikki so'm yo'qolib/ortib qolmasligi uchun.
      const zapchast = oxirgi && toliq
        ? qoldiq
        : Math.round(zapTotal * (baza > 0 ? amount / baza : 0));
      qoldiq -= zapchast;
      out.set(r.row._id, { ...r, zapchast, foyda: amount - zapchast });
    });
  }

  // Kirish tartibini saqlaymiz
  return rows.map((r) => out.get(r.row._id) as WithProfit<T>);
}

export interface BossStats {
  kirim: number;          // davr ichida kassaga tushgan hamma pul
  zapchast: number;       // o'sha kirim ichidagi zapchast puli
  ishXaqi: number;        // to'langan maoshlar
  ishxonaXarajat: number; // qolgan chiqimlar (rasxod operatsiyalaridan tashqari)
  foyda: number;          // ISHXONA FOYDASI
}

// Statistika. `zapchast` — attachOrderProfit bergan qatorlardan yig'iladi
// (shu sababli jadvaldagi ustun bilan raqam har doim bir xil).
export function computeBossStats(filtered: LedgerRow[], zapchast: number): BossStats {
  let kirim = 0;
  let ishXaqi = 0;
  let ishxonaXarajat = 0;

  for (const r of filtered) {
    const amount = Number(r._amount) || 0;
    if (r._positive) {
      kirim += amount;
    } else if (r._category === 'Ish xaqi') {
      ishXaqi += amount;
    } else if (!r._isRasxod) {
      // Rasxod — zapchast sifatida allaqachon ayirilgan (yuqoridagi 2-band)
      ishxonaXarajat += amount;
    }
  }

  return {
    kirim,
    zapchast,
    ishXaqi,
    ishxonaXarajat,
    foyda: kirim - zapchast - ishXaqi - ishxonaXarajat,
  };
}
