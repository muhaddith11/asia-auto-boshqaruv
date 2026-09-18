import { describe, it, expect } from 'vitest';
import {
  buildArchiveRows, diffRemovedZaps, isRasxodZap, removedRasxodTotal,
  type ZapLike,
} from '@/lib/zapArchive';

// Zapchastlar hisoboti doimiy bo'lishi uchun: buyurtma zaps'i o'zgarganda qaysi
// qatorlar OLIB TASHLANGANI shu sof funksiyalar bilan aniqlanadi. Rasxod qatorlarida
// pul bor (kassaga qaytariladi) — shuning uchun ularning mosligi qat'iy tekshiriladi.

const filtr: ZapLike = { id: 5, nom: 'Filtr', narx: 50000, qty: 1, sebestoimost: 30000 };
const svecha: ZapLike = { id: 6, nom: 'Svecha', narx: 20000, qty: 4, sebestoimost: 12000 };
const taxi15: ZapLike = { id: -1, nom: 'Taxi', narx: 15000, qty: 1, kat: 'Rasxod', rasxod: true, xodim_nomi: 'Abdulazizxon', vaqt: '2026-09-17T06:40:00.000Z' };
const taxi20: ZapLike = { id: -2, nom: 'Taxi', narx: 20000, qty: 1, kat: 'Rasxod', rasxod: true, xodim_nomi: 'Abdulazizxon' };

describe('isRasxodZap', () => {
  it('rasxod:true yoki kat=Rasxod bo\'lsa true', () => {
    expect(isRasxodZap({ rasxod: true })).toBe(true);
    expect(isRasxodZap({ kat: 'Rasxod' })).toBe(true);
    expect(isRasxodZap(filtr)).toBe(false);
    expect(isRasxodZap(null)).toBe(false);
  });
});

describe('diffRemovedZaps', () => {
  it('o\'zgarmagan ro\'yxat — hech narsa olib tashlanmagan', () => {
    expect(diffRemovedZaps([filtr, taxi15], [filtr, taxi15])).toEqual([]);
  });

  it('oddiy zapchast o\'chirilsa — faqat shu qator qaytadi', () => {
    expect(diffRemovedZaps([filtr, svecha], [svecha])).toEqual([filtr]);
  });

  it('rasxod o\'chirilsa — faqat rasxod qaytadi', () => {
    expect(diffRemovedZaps([filtr, taxi15], [filtr])).toEqual([taxi15]);
  });

  it('hammasi o\'chirilsa (bo\'sh ro\'yxat) — hammasi qaytadi', () => {
    expect(diffRemovedZaps([filtr, taxi15], [])).toEqual([filtr, taxi15]);
  });

  it('bir xil nomli ikki rasxoddan NARXI mos kelmagani olib tashlangan hisoblanadi', () => {
    // Taxi 15k va Taxi 20k bor, 20k qoldi → 15k o'chirilgan (nom bo'yicha juftlab yuborilmaydi).
    expect(diffRemovedZaps([taxi15, taxi20], [taxi20])).toEqual([taxi15]);
    expect(diffRemovedZaps([taxi15, taxi20], [taxi15])).toEqual([taxi20]);
  });

  it('miqdor (qty) o\'zgarishi yoki "alohida" galochkasi — olib tashlash emas', () => {
    expect(diffRemovedZaps([filtr], [{ ...filtr, qty: 3, alohida: true }])).toEqual([]);
  });

  it('bir xil zapchast ikki marta bo\'lsa va bittasi o\'chirilsa — bittasi qaytadi', () => {
    expect(diffRemovedZaps([filtr, { ...filtr }], [filtr])).toEqual([filtr]);
  });

  it('boshqa zapchastga almashtirilsa — eskisi olib tashlangan hisoblanadi', () => {
    expect(diffRemovedZaps([filtr], [svecha])).toEqual([filtr]);
  });

  it('qo\'lda kiritilgan qator (id yo\'q) tahrirlashda katalogga bog\'lansa ham olib tashlanmagan (nom bo\'yicha)', () => {
    const custom: ZapLike = { id: null, nom: 'Filtr', narx: 50000, qty: 1 };
    expect(diffRemovedZaps([custom], [{ ...filtr }])).toEqual([]);
  });

  it('katalogda nomi o\'zgargan zapchast (id bir xil) olib tashlanmagan', () => {
    expect(diffRemovedZaps([filtr], [{ ...filtr, nom: 'Filtr yangi' }])).toEqual([]);
  });

  it('nom registri va bo\'sh joylar farq qilmaydi', () => {
    expect(diffRemovedZaps([{ id: null, nom: ' Filtr ' }], [{ id: null, nom: 'filtr' }])).toEqual([]);
  });

  it('null/undefined/massiv bo\'lmagan kirish — bo\'sh natija (yiqilmaydi)', () => {
    expect(diffRemovedZaps(null, [filtr])).toEqual([]);
    expect(diffRemovedZaps(undefined, undefined)).toEqual([]);
    expect(diffRemovedZaps([filtr], null)).toEqual([filtr]);
    expect(diffRemovedZaps('x' as unknown as ZapLike[], [filtr])).toEqual([]);
  });

  it('legacy name/price maydonlari ham tanilishi', () => {
    const legacy: ZapLike = { id: null, name: 'Yog\'', price: 300000, rasxod: true };
    expect(diffRemovedZaps([legacy], [])).toEqual([legacy]);
    expect(diffRemovedZaps([legacy], [{ ...legacy }])).toEqual([]);
  });
});

describe('removedRasxodTotal', () => {
  it('faqat rasxod qatorlarining summasini yig\'adi', () => {
    expect(removedRasxodTotal([filtr, taxi15, taxi20])).toBe(35000);
  });

  it('rasxod bo\'lmasa 0', () => {
    expect(removedRasxodTotal([filtr, svecha])).toBe(0);
    expect(removedRasxodTotal([])).toBe(0);
  });
});

describe('buildArchiveRows', () => {
  const order = {
    id: 2163, mashina: 'Chevrolet Equinox 2', raqam: '01S007AB', ism: 'Kunlik Mijoz',
    qabul_xodim_nomi: 'Anvar', created_at: '2026-09-17T05:00:00+00:00', holat: 'tulanmagan',
  };

  it('buyurtma nusxasi va olib tashlash sababini yozadi', () => {
    const [row] = buildArchiveRows(order, [filtr], 'tahrirlandi');
    expect(row).toMatchObject({
      order_id: 2163, mashina: 'Chevrolet Equinox 2', raqam: '01S007AB', ism: 'Kunlik Mijoz',
      order_holat: 'tulanmagan', sabab: 'tahrirlandi', zap: filtr,
    });
  });

  it('xodim: oddiy zapchastda qabul qilgan xodim, rasxodda uni kiritgan xodim', () => {
    const rows = buildArchiveRows(order, [filtr, taxi15], 'tahrirlandi');
    expect(rows[0].xodim).toBe('Anvar');
    expect(rows[1].xodim).toBe('Abdulazizxon');
  });

  it('sana: avval zap.vaqt, keyin buyurtma yaratilgan vaqt (olib tashlangan vaqt emas)', () => {
    const rows = buildArchiveRows(order, [taxi15, filtr], 'buyurtma_ochirildi');
    expect(rows[0].sana).toBe('2026-09-17T06:40:00.000Z');
    expect(rows[1].sana).toBe('2026-09-17T05:00:00.000Z');
  });

  it('yaroqsiz sana null bo\'ladi (bazaga yaroqsiz timestamptz yozilmaydi)', () => {
    const [row] = buildArchiveRows({ ...order, created_at: 'kecha' }, [{ ...filtr, vaqt: 'hozir' }], 'tahrirlandi');
    expect(row.sana).toBeNull();
  });

  it('buyurtma maydonlari bo\'sh bo\'lsa bo\'sh satr, holat null', () => {
    const [row] = buildArchiveRows({ id: '7' }, [filtr], 'tahrirlandi');
    expect(row).toMatchObject({ order_id: 7, mashina: '', raqam: '', ism: '', xodim: '', order_holat: null });
  });

  it('bo\'sh ro\'yxat — bo\'sh natija', () => {
    expect(buildArchiveRows(order, [], 'tahrirlandi')).toEqual([]);
  });
});
