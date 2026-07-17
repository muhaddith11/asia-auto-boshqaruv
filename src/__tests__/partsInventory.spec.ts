import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@/store/useStore';
import type { Buyurtma, Zapchast } from '@/types';

// Eslatma: mavjud useStore.spec.ts kabi, fetch/Supabase mock qilinmaydi.
// updateBuyurtma/deleteBuyurtma/updateZapchast har biri optimistik `set()`ni
// async API chaqiruvidan OLDIN sinxron bajaradi — shu sabab natijani darhol
// (await siz) tekshirish mumkin, xuddi tarmoq javobi kelgandek.

const zapchast: Zapchast = {
  id: 1,
  nom: 'Svecha',
  sebestoimost: 10000,
  narx: 15000,
  bir: 'dona',
  kat: 'Boshqa',
  balance: 10,
};

const zapchast2: Zapchast = {
  id: 2,
  nom: 'Moy filtri',
  sebestoimost: 20000,
  narx: 30000,
  bir: 'dona',
  kat: 'Boshqa',
  balance: 5,
};

function makeOrder(overrides: Partial<Buyurtma>): Buyurtma {
  return {
    id: 100,
    ism: 'Test mijoz',
    mashina: 'Chevrolet Nexia',
    raqam: '01A123AA',
    sana: '2026-07-01',
    holat: 'yaratildi',
    assignments: [],
    services: [],
    zaps: [{ ...zapchast, qty: 2 }],
    srv: 0,
    zap: 30000,
    total: 30000,
    chegirma: 0,
    final: 30000,
    zarplata: 0,
    pribil: 0,
    createdAt: '2026-07-01T00:00:00Z',
    ...overrides,
  };
}

describe('buyurtma bekor qilinganda/o\'chirilganda ombor balansini qaytarish', () => {
  beforeEach(() => {
    useStore.setState({
      zapchastlar: [{ ...zapchast }],
      buyurtmalar: [],
    });
  });

  it('holat "bekor qilingan"ga o\'tsa — zapchast balansi qaytariladi', () => {
    useStore.setState({ buyurtmalar: [makeOrder({ holat: 'yaratildi' })] });

    useStore.getState().updateBuyurtma(100, { holat: 'bekor qilingan' });

    const part = useStore.getState().zapchastlar.find(z => z.id === 1);
    expect(part?.balance).toBe(12); // 10 + 2 (qty)
  });

  it('"bekor qilingan"dan qaytadan faollashtirilsa — balans yana ayiriladi', () => {
    useStore.setState({ buyurtmalar: [makeOrder({ holat: 'bekor qilingan' })] });

    useStore.getState().updateBuyurtma(100, { holat: 'tamirlanmoqda' });

    const part = useStore.getState().zapchastlar.find(z => z.id === 1);
    expect(part?.balance).toBe(8); // 10 - 2 (qty)
  });

  it('holat bekor qilingan bo\'lmasa, boshqa maydon o\'zgarsa ham balans tegilmaydi', () => {
    useStore.setState({ buyurtmalar: [makeOrder({ holat: 'yaratildi' })] });

    useStore.getState().updateBuyurtma(100, { muammo: 'Motor tovush chiqaryapti' });

    const part = useStore.getState().zapchastlar.find(z => z.id === 1);
    expect(part?.balance).toBe(10); // o'zgarmagan
  });

  it("faol buyurtma o'chirilsa — zapchast balansi qaytariladi", () => {
    useStore.setState({ buyurtmalar: [makeOrder({ holat: 'yaratildi' })] });

    useStore.getState().deleteBuyurtma(100);

    const part = useStore.getState().zapchastlar.find(z => z.id === 1);
    expect(part?.balance).toBe(12);
    expect(useStore.getState().buyurtmalar.find(b => b.id === 100)).toBeUndefined();
  });

  it("allaqachon bekor qilingan buyurtma o'chirilsa — balans takror qaytarilmaydi", () => {
    useStore.setState({ buyurtmalar: [makeOrder({ holat: 'bekor qilingan' })] });

    useStore.getState().deleteBuyurtma(100);

    const part = useStore.getState().zapchastlar.find(z => z.id === 1);
    expect(part?.balance).toBe(10); // o'zgarmagan — cancel paytida allaqachon qaytarilgan bo'lardi
  });
});

describe('faol buyurtmani tahrirlashda zapchastlar ro\'yxati o\'zgarsa ombor sinxronlansin', () => {
  beforeEach(() => {
    useStore.setState({
      zapchastlar: [{ ...zapchast }, { ...zapchast2 }],
      buyurtmalar: [],
    });
  });

  it('yangi zapchast qo\'shilsa — balans qo\'shimcha ayiriladi', () => {
    // Original: faqat zapchast#1, 2 dona
    useStore.setState({ buyurtmalar: [makeOrder({ holat: 'yaratildi' })] });

    // Tahrirlash: zapchast#1 (2 dona, o'zgarmagan) + zapchast#2 (3 dona, yangi)
    useStore.getState().updateBuyurtma(100, {
      zaps: [{ ...zapchast, qty: 2 }, { ...zapchast2, qty: 3 }],
    });

    expect(useStore.getState().zapchastlar.find(z => z.id === 1)?.balance).toBe(10); // o'zgarmagan (2 - 2 = 0 farq)
    expect(useStore.getState().zapchastlar.find(z => z.id === 2)?.balance).toBe(2); // 5 - 3
  });

  it('zapchast ro\'yxatdan olib tashlansa — balans qaytariladi', () => {
    useStore.setState({
      buyurtmalar: [makeOrder({
        holat: 'yaratildi',
        zaps: [{ ...zapchast, qty: 2 }, { ...zapchast2, qty: 3 }],
      })],
    });
    useStore.setState({ zapchastlar: [{ ...zapchast, balance: 8 }, { ...zapchast2, balance: 2 }] });

    // Tahrirlash: zapchast#2 butunlay olib tashlandi
    useStore.getState().updateBuyurtma(100, {
      zaps: [{ ...zapchast, qty: 2 }],
    });

    expect(useStore.getState().zapchastlar.find(z => z.id === 1)?.balance).toBe(8); // o'zgarmagan
    expect(useStore.getState().zapchastlar.find(z => z.id === 2)?.balance).toBe(5); // 2 + 3 qaytdi
  });

  it('miqdor o\'zgarsa — faqat farqi hisoblanadi', () => {
    useStore.setState({ buyurtmalar: [makeOrder({ holat: 'yaratildi', zaps: [{ ...zapchast, qty: 2 }] })] });

    // 2 donadan 5 donaga oshirildi
    useStore.getState().updateBuyurtma(100, {
      zaps: [{ ...zapchast, qty: 5 }],
    });

    expect(useStore.getState().zapchastlar.find(z => z.id === 1)?.balance).toBe(7); // 10 - (5-2)
  });

  it('bekor qilingan buyurtmada zaps o\'zgarsa — ombor balansi tegilmaydi', () => {
    useStore.setState({
      buyurtmalar: [makeOrder({ holat: 'bekor qilingan', zaps: [{ ...zapchast, qty: 2 }] })],
    });

    useStore.getState().updateBuyurtma(100, {
      zaps: [{ ...zapchast, qty: 2 }, { ...zapchast2, qty: 3 }],
    });

    expect(useStore.getState().zapchastlar.find(z => z.id === 1)?.balance).toBe(10);
    expect(useStore.getState().zapchastlar.find(z => z.id === 2)?.balance).toBe(5);
  });
});
