import { describe, it, expect } from 'vitest';
import { orderPaid, realizedProfit } from '@/lib/realizedProfit';

// Boshliq qoidasi (2026-09-28): kassaga tushgan pul FOYDA hisobiga boradi —
// buyurtma to'liq yopilishini kutmaydi. Lekin buyurtmaning o'z foydasidan
// oshmaydi. To'liq to'langan buyurtmalarda eski xulq aynan saqlanishi shart
// (raqamlar orqaga qarab o'zgarmasin).

describe('orderPaid', () => {
  it("to'liq to'langan buyurtma — `paid` bo'sh bo'lsa ham to'liq summa", () => {
    expect(orderPaid({ holat: 'tulangan', final: 1000000 })).toBe(1000000);
    expect(orderPaid({ holat: 'tulangan', final: 1000000, paid: 1000000 })).toBe(1000000);
  });

  it("qisman to'langan — `paid` ustuni", () => {
    expect(orderPaid({ holat: 'tulanmagan', final: 30350000, paid: 20000000 })).toBe(20000000);
  });

  it('bekor qilingan — 0 (puli qaytarilgan)', () => {
    expect(orderPaid({ holat: 'bekor qilingan', final: 1000000, paid: 1000000 })).toBe(0);
    expect(orderPaid({ holat: 'bekor', final: 1000000, paid: 1000000 })).toBe(0);
  });
});

describe('realizedProfit', () => {
  it("boshliq misoli #1439: 30 350 000 lik buyurtmadan 20 000 000 to'langan → 20 000 000", () => {
    // Tushgan pul foydadan hisoblanadi: sherik (30%) 6 000 000 oladi
    const foyda = realizedProfit({ holat: 'tulanmagan', pribil: 21720600, final: 30350000, paid: 20000000 });
    expect(foyda).toBe(20000000);
    expect(Math.round(foyda * 0.3)).toBe(6000000);
  });

  it('buyurtma foydasidan OSHMAYDI (ortig\'i zapchast tannarxi qaytimi)', () => {
    // 1 835 000 to'lovdan 1 330 000 tushgan, lekin buyurtma foydasi 680 000
    expect(realizedProfit({ holat: 'tulanmagan', pribil: 680000, final: 1835000, paid: 1330000 })).toBe(680000);
  });

  it("to'liq to'langanda foyda to'liq hisobga olinadi", () => {
    expect(realizedProfit({ holat: 'tulangan', pribil: 21720600, final: 30350000, paid: 30350000 })).toBe(21720600);
    // eski yozuv: `paid` yo'q, lekin holat 'tulangan'
    expect(realizedProfit({ holat: 'tulangan', pribil: 500000, final: 800000 })).toBe(500000);
  });

  it("puli tushmagan buyurtma foyda bermaydi", () => {
    expect(realizedProfit({ holat: 'tulanmagan', pribil: 900000, final: 1000000, paid: 0 })).toBe(0);
    expect(realizedProfit({ holat: 'yaratildi', pribil: 900000, final: 1000000 })).toBe(0);
  });

  it('bekor qilingan buyurtma foyda bermaydi', () => {
    expect(realizedProfit({ holat: 'bekor qilingan', pribil: 5000000, final: 6000000, paid: 6000000 })).toBe(0);
  });

  it("manfiy yoki yo'q foyda 0 beradi", () => {
    expect(realizedProfit({ holat: 'tulangan', pribil: -500000, final: 100000 })).toBe(0);
    expect(realizedProfit({ holat: 'tulangan', final: 100000 })).toBe(0);
    expect(realizedProfit(null)).toBe(0);
  });
});
