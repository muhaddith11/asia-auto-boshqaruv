import { describe, it, expect } from 'vitest';
import { effectiveQtyMap, computeStockDeltas } from '@/lib/stock';

// Ombor balansi endi SERVER tomonda applyStockDelta orqali boshqariladi.
// applyStockDelta Supabase'ga bog'liq (yon ta'sir), lekin uning YURAGI —
// sof funksiyalar effectiveQtyMap va computeStockDeltas — bu yerda sinaladi.
// delta = yangi_effektiv - eski_effektiv; balance -= delta.

describe('effectiveQtyMap', () => {
  it('faol buyurtma zaps miqdorlarini id bo\'yicha yig\'adi', () => {
    const m = effectiveQtyMap([{ id: 1, qty: 2 }, { id: 2, qty: 3 }], 'yaratildi');
    expect(m.get(1)).toBe(2);
    expect(m.get(2)).toBe(3);
  });

  it('bir xil id bir necha marta kelsa — jamlaydi', () => {
    const m = effectiveQtyMap([{ id: 1, qty: 2 }, { id: 1, qty: 3 }], 'tulanmagan');
    expect(m.get(1)).toBe(5);
  });

  it('bekor qilingan buyurtma bo\'sh map qaytaradi (ombordan hech narsa chiqmaydi)', () => {
    const m = effectiveQtyMap([{ id: 1, qty: 2 }], 'bekor qilingan');
    expect(m.size).toBe(0);
  });

  it('id yo\'q (qo\'lda kiritilgan) zapchast e\'tiborga olinmaydi', () => {
    const m = effectiveQtyMap([{ id: null, qty: 2 }, { id: 5, qty: 1 }], 'yaratildi');
    expect(m.has(5)).toBe(true);
    expect(m.size).toBe(1);
  });

  it('quantity (legacy/bot) ham qty sifatida qabul qilinadi, standart 1', () => {
    const m = effectiveQtyMap([{ id: 1, quantity: 4 }, { id: 2 }], 'yaratildi');
    expect(m.get(1)).toBe(4);
    expect(m.get(2)).toBe(1);
  });
});

describe('computeStockDeltas (delta = yangi - eski)', () => {
  it('yangi buyurtma: eski yo\'q → zaps miqdori ayiriladi (musbat delta)', () => {
    const d = computeStockDeltas(null, { zaps: [{ id: 1, qty: 2 }], holat: 'yaratildi' });
    expect(d.get(1)).toBe(2); // balance -= 2
  });

  it('o\'chirish: yangi yo\'q → miqdor qaytadi (manfiy delta)', () => {
    const d = computeStockDeltas({ zaps: [{ id: 1, qty: 2 }], holat: 'yaratildi' }, null);
    expect(d.get(1)).toBe(-2); // balance -= -2 → +2 qaytadi
  });

  it('bekor qilinsa: effektiv 0 → miqdor qaytadi', () => {
    const d = computeStockDeltas(
      { zaps: [{ id: 1, qty: 2 }], holat: 'yaratildi' },
      { zaps: [{ id: 1, qty: 2 }], holat: 'bekor qilingan' },
    );
    expect(d.get(1)).toBe(-2);
  });

  it('bekordan qaytsa: yana ayiriladi', () => {
    const d = computeStockDeltas(
      { zaps: [{ id: 1, qty: 2 }], holat: 'bekor qilingan' },
      { zaps: [{ id: 1, qty: 2 }], holat: 'tamirlanmoqda' },
    );
    expect(d.get(1)).toBe(2);
  });

  it('tahrirlashda yangi zapchast qo\'shilsa — faqat u ayiriladi', () => {
    const d = computeStockDeltas(
      { zaps: [{ id: 1, qty: 2 }], holat: 'yaratildi' },
      { zaps: [{ id: 1, qty: 2 }, { id: 2, qty: 3 }], holat: 'yaratildi' },
    );
    expect(d.has(1)).toBe(false); // o'zgarmagan
    expect(d.get(2)).toBe(3);
  });

  it('tahrirlashda zapchast olib tashlansa — u qaytadi', () => {
    const d = computeStockDeltas(
      { zaps: [{ id: 1, qty: 2 }, { id: 2, qty: 3 }], holat: 'yaratildi' },
      { zaps: [{ id: 1, qty: 2 }], holat: 'yaratildi' },
    );
    expect(d.has(1)).toBe(false);
    expect(d.get(2)).toBe(-3); // 3 dona qaytadi
  });

  it('soni o\'zgarsa — faqat farqi hisoblanadi', () => {
    const d = computeStockDeltas(
      { zaps: [{ id: 1, qty: 2 }], holat: 'yaratildi' },
      { zaps: [{ id: 1, qty: 5 }], holat: 'yaratildi' },
    );
    expect(d.get(1)).toBe(3); // 3 dona qo'shimcha ayiriladi
  });

  it('holat/zaps o\'zgarmasa (masalan faqat to\'lov) — delta bo\'sh', () => {
    const same = { zaps: [{ id: 1, qty: 2 }], holat: 'tulanmagan' };
    const d = computeStockDeltas(same, { ...same, holat: 'tulangan' });
    expect(d.size).toBe(0); // ikkalasi ham faol, zaps bir xil
  });
});
