import { describe, it, expect } from 'vitest';
import {
  buildQismanTolovMap, kassaFoyda, realizedProfit, QISMAN_TOLOV_BOSHLANISHI,
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

// Qaror (2026-11-02): "alohida" zapchast puli kassaga tushmaydi, shuning uchun
// uning foydasi sherik ulushiga KIRMAYDI. Raqamlar haqiqiy buyurtmalardan.
describe('realizedProfit — alohida zapchast', () => {
  const svecha = { narx: 150000, sebestoimost: 72000, alohida: true };

  it('#2609: faqat alohida zapchast sotilgan — foyda hisobga kirmaydi', () => {
    const b = { holat: 'tulangan', pribil: 78000, final: 150000, zarplata: 0, zaps: [svecha] };
    expect(kassaFoyda(b)).toBe(0);
    expect(realizedProfit(b)).toBe(0);
  });

  it('#2608: xizmat foydasi qoladi, zapchast ustamasi (39 200) chiqadi', () => {
    const b = {
      holat: 'tulangan', pribil: 187700, final: 210000, zarplata: 1500,
      zaps: [
        { narx: 50000, sebestoimost: 16800, alohida: true },
        { narx: 10000, sebestoimost: 4000, alohida: true },
      ],
    };
    expect(realizedProfit(b)).toBe(148500);
  });

  it('#2600: rasxod tannarxi ayirilgan holda qoladi, tannarxsiz alohida to\'liq chiqadi', () => {
    const b = {
      holat: 'tulangan', pribil: 978000, final: 1150000, zarplata: 102000,
      zaps: [
        { narx: 70000, sebestoimost: 70000, rasxod: true },
        { narx: 400000, sebestoimost: 0, alohida: true },
      ],
    };
    expect(realizedProfit(b)).toBe(578000);
  });

  it('#1890: eski buyurtma foydasida zapchast puli yo\'q — ikkinchi marta ayirilmaydi', () => {
    const b = {
      holat: 'tulangan', pribil: 127500, final: 550000, zarplata: 22500,
      zaps: [{ narx: 400000, sebestoimost: 0, alohida: true }],
    };
    expect(realizedProfit(b)).toBe(127500);
  });

  it('qisman to\'lov kassa foydasidan oshmaydi', () => {
    const b = { holat: 'tulanmagan', pribil: 187700, final: 210000, zarplata: 1500,
      zaps: [{ narx: 60000, sebestoimost: 20800, alohida: true }] };
    expect(realizedProfit(b, 200000)).toBe(148500);
    expect(realizedProfit(b, 100000)).toBe(100000);
  });

  it('alohida zapchast bo\'lmasa foyda aynan saqlanadi', () => {
    const b = { holat: 'tulangan', pribil: 500000, final: 800000, zarplata: 100000,
      zaps: [{ narx: 300000, sebestoimost: 200000 }] };
    expect(realizedProfit(b)).toBe(500000);
  });
});
