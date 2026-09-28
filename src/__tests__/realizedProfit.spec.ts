import { describe, it, expect } from 'vitest';
import {
  buildQismanTolovMap, realizedProfit, QISMAN_TOLOV_BOSHLANISHI,
  type PaymentOpLike,
} from '@/lib/realizedProfit';

// Boshliq qoidasi (2026-09-28): kassaga tushgan pul FOYDA hisobiga boradi —
// buyurtma to'liq yopilishini kutmaydi, lekin buyurtmaning o'z foydasidan
// oshmaydi. To'liq to'langan buyurtmalarda eski xulq aynan saqlanishi shart.
//
// SANA CHEGARASI: chegaradan OLDINGI qisman to'lovlar hisobga olinmaydi —
// ular boshliq bilan allaqachon hisob-kitob qilingan (faqat Zeekr 007 #1439
// ning puli qo'shilmagan edi).

const pay = (o: Partial<PaymentOpLike>): PaymentOpLike => ({
  type: 'income', category: "Buyurtma to'lovi", source: 'buyurtma', amount: 0, ...o,
});

describe('buildQismanTolovMap', () => {
  it('chegara kunidagi va keyingi to\'lovlarni yig\'adi', () => {
    const map = buildQismanTolovMap([
      pay({ amount: 20000000, comment: 'Buyurtma #1439 - Kunlik Mijoz (Qisman)', date: '2026-09-28' }),
      pay({ amount: 5000000, comment: 'Buyurtma #1439 (Qisman)', date: '2026-09-30' }),
    ]);
    expect(map.get(1439)).toBe(25000000);
  });

  it('chegaradan OLDINGI to\'lovni hisobga olmaydi', () => {
    const map = buildQismanTolovMap([
      pay({ amount: 13400000, comment: 'Buyurtma #1516 (Qisman)', date: '2026-07-29' }),
      pay({ amount: 1330000, comment: 'Buyurtma #2202 (Qisman)', date: '2026-09-26' }),
    ]);
    expect(map.get(1516)).toBeUndefined();
    expect(map.get(2202)).toBeUndefined();
  });

  it('buyurtma id sini order_id ustunidan ham oladi', () => {
    const map = buildQismanTolovMap([pay({ amount: 700000, order_id: 55, date: '2026-10-05' })]);
    expect(map.get(55)).toBe(700000);
  });

  it('chiqim va boshqa kategoriyali kirimlarni hisobga olmaydi', () => {
    const map = buildQismanTolovMap([
      pay({ type: 'expense', amount: 400000, comment: 'Rasxod: Yulkiro (Buyurtma #1439)', date: '2026-09-29' }),
      pay({ category: 'Boshqa', source: 'manual', amount: 900000, comment: 'Buyurtma #1439', date: '2026-09-29' }),
    ]);
    expect(map.get(1439)).toBeUndefined();
  });

  it('chegara sanasi 2026-09-28 (Zeekr 007 to\'lovi kuni)', () => {
    expect(QISMAN_TOLOV_BOSHLANISHI).toBe('2026-09-28');
  });
});

describe('realizedProfit', () => {
  const zeekr = { id: 1439, holat: 'tulanmagan', pribil: 21720600, final: 30350000, paid: 20000000 };

  it("boshliq misoli #1439: 20 000 000 hisobga kiradi → sherik 6 000 000", () => {
    const foyda = realizedProfit(zeekr, 20000000);
    expect(foyda).toBe(20000000);
    expect(Math.round(foyda * 0.3)).toBe(6000000);
  });

  it('chegaradan oldin to\'langan mashina hisobga KIRMAYDI', () => {
    // #1516 Porsche Taycan: 13.4 mln iyulda to'langan → map bo'sh → 0
    expect(realizedProfit({ id: 1516, holat: 'tulanmagan', pribil: 19828000, final: 24200000, paid: 13400000 }))
      .toBe(0);
  });

  it('buyurtma foydasidan OSHMAYDI (ortig\'i zapchast tannarxi qaytimi)', () => {
    expect(realizedProfit({ holat: 'tulanmagan', pribil: 680000, final: 1835000 }, 1330000)).toBe(680000);
  });

  it("to'liq to'langanda foyda to'liq hisobga olinadi (qisman to'lovdan qat'i nazar)", () => {
    expect(realizedProfit({ holat: 'tulangan', pribil: 21720600, final: 30350000 })).toBe(21720600);
    expect(realizedProfit({ holat: 'tulangan', pribil: 500000, final: 800000 }, 0)).toBe(500000);
  });

  it('bekor qilingan buyurtma foyda bermaydi', () => {
    expect(realizedProfit({ holat: 'bekor qilingan', pribil: 5000000, final: 6000000 }, 6000000)).toBe(0);
    expect(realizedProfit({ holat: 'bekor', pribil: 5000000, final: 6000000 }, 6000000)).toBe(0);
  });

  it("manfiy yoki yo'q foyda 0 beradi", () => {
    expect(realizedProfit({ holat: 'tulangan', pribil: -500000, final: 100000 })).toBe(0);
    expect(realizedProfit({ holat: 'tulangan', final: 100000 })).toBe(0);
    expect(realizedProfit(null)).toBe(0);
  });
});
