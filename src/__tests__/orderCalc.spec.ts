import { describe, it, expect } from 'vitest';
import { computeOrderTotals } from '@/lib/orderCalc';

// Bu testlar mavjud hisob-kitob mantig'ini "muzlatadi" — kelajakda formulani
// tasodifan o'zgartirib qo'yilsa, shu yerda buziladi.

describe('computeOrderTotals', () => {
  it('bitta xizmat, usta 40%, chegirmasiz', () => {
    const t = computeOrderTotals([{ narx: 100000, foiz: 40 }], [], 0);
    expect(t.servicesTotal).toBe(100000);
    expect(t.partsTotal).toBe(0);
    expect(t.finalTotal).toBe(100000);
    expect(t.zarplataAdjusted).toBe(40000);
    expect(t.netProfit).toBe(60000);
  });

  it('chegirma usta ulushiga proporsional ta\'sir qiladi', () => {
    // 1mln xizmat, 50% usta, 500k chegirma → usta 500k dan hisoblaydi
    const t = computeOrderTotals([{ narx: 1000000, foiz: 50 }], [], 500000);
    expect(t.finalTotal).toBe(500000);
    expect(t.chegirmaRatio).toBe(0.5);
    expect(t.zarplataAdjusted).toBe(250000);
    expect(t.netProfit).toBe(250000);
  });

  it('zapchastlar to\'lovga qo\'shiladi, lekin foydaga ta\'sir qilmaydi', () => {
    const t = computeOrderTotals(
      [{ narx: 100000, foiz: 40 }],
      [{ narx: 45000, qty: 4 }, { narx: 20000, qty: 1 }],
      0,
    );
    expect(t.partsTotal).toBe(200000);
    expect(t.subTotal).toBe(300000);
    expect(t.finalTotal).toBe(300000);
    expect(t.zarplataAdjusted).toBe(40000);
    expect(t.netProfit).toBe(60000); // foyda faqat xizmatdan
  });

  it('usta tanlanmagan xizmat (foiz 0) — maosh 0, foyda to\'liq', () => {
    const t = computeOrderTotals([{ narx: 100000, foiz: 0 }], [], 0);
    expect(t.zarplataAdjusted).toBe(0);
    expect(t.netProfit).toBe(100000);
  });

  it('chegirma summadan katta — final va foyda 0 dan past tushmaydi', () => {
    const t = computeOrderTotals([{ narx: 100000, foiz: 40 }], [], 150000);
    expect(t.finalTotal).toBe(0);
    expect(t.chegirmaRatio).toBe(0);
    expect(t.zarplataAdjusted).toBe(0);
    expect(t.netProfit).toBe(0);
  });

  it('faqat zapchast, xizmatsiz — chegirmaRatio 1, foyda 0', () => {
    const t = computeOrderTotals([], [{ narx: 50000, qty: 2 }], 10000);
    expect(t.servicesTotal).toBe(0);
    expect(t.partsTotal).toBe(100000);
    expect(t.finalTotal).toBe(90000);
    expect(t.chegirmaRatio).toBe(1);
    expect(t.zarplataAdjusted).toBe(0);
    expect(t.netProfit).toBe(0);
  });

  it('bir nechta xizmat, aralash ustalar', () => {
    const t = computeOrderTotals(
      [{ narx: 200000, foiz: 30 }, { narx: 100000, foiz: 0 }],
      [],
      0,
    );
    expect(t.servicesTotal).toBe(300000);
    expect(t.zarplataAdjusted).toBe(60000);
    expect(t.netProfit).toBe(240000);
  });

  it('bo\'sh buyurtma — hammasi 0', () => {
    const t = computeOrderTotals([], [], 0);
    expect(t.servicesTotal).toBe(0);
    expect(t.finalTotal).toBe(0);
    expect(t.zarplataAdjusted).toBe(0);
    expect(t.netProfit).toBe(0);
  });
});
