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

  it('zapchastlar to\'lovga qo\'shiladi (narx miqdorga ko\'paytirilmaydi) va sof foyda (narx − tannarx) ham foydaga qo\'shiladi', () => {
    const t = computeOrderTotals(
      [{ narx: 100000, foiz: 40 }],
      [{ narx: 45000, qty: 4, sebestoimost: 30000 }, { narx: 20000, qty: 1, sebestoimost: 12000 }],
      0,
    );
    // Narx miqdorga ko'paytirilmaydi: 45000 + 20000 = 65000
    expect(t.partsTotal).toBe(65000);
    expect(t.partsCostTotal).toBe(42000);
    expect(t.subTotal).toBe(165000);
    expect(t.finalTotal).toBe(165000);
    expect(t.zarplataAdjusted).toBe(40000);
    // foyda = final − usta ulushi − zapchast tannarxi = 165000 − 40000 − 42000
    expect(t.netProfit).toBe(83000);
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

  it('faqat zapchast, xizmatsiz — chegirmaRatio 1, foyda zapchast sof foydasidan', () => {
    const t = computeOrderTotals([], [{ narx: 50000, qty: 2, sebestoimost: 35000 }], 10000);
    expect(t.servicesTotal).toBe(0);
    // Narx miqdorga ko'paytirilmaydi: 50000
    expect(t.partsTotal).toBe(50000);
    expect(t.finalTotal).toBe(40000);
    expect(t.chegirmaRatio).toBe(1);
    expect(t.zarplataAdjusted).toBe(0);
    // foyda = final(40000, chegirma zapchastdan emas xizmatdan yo'q bo'lgani uchun
    // to'g'ridan-to'g'ri subTotal-chegirma) − maosh(0) − tannarx(35000)
    expect(t.netProfit).toBe(5000);
  });

  it('chegirma xizmat foydasidan katta bo\'lsa, qolgani zapchast foydasidan kamayadi', () => {
    // #1976 haqiqiy holat: 50000 xizmat, 1_700_000 zapchast (tannarxsiz),
    // 1_500_000 chegirma → final 250000, usta ulushi 0 gacha kamayadi,
    // qolgan hammasi (250000) sof foyda.
    const t = computeOrderTotals(
      [{ narx: 50000, foiz: 15 }],
      [{ narx: 1700000, qty: 1, sebestoimost: 0 }],
      1500000,
    );
    expect(t.finalTotal).toBe(250000);
    expect(t.zarplataAdjusted).toBe(0);
    expect(t.netProfit).toBe(250000);
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
