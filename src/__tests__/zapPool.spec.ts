import { describe, it, expect } from 'vitest';
import {
  computeZapPool, computeZapPoolYigilgan, chiqimTotal, parseChiqimInput,
  type ZapPoolChiqim,
} from '@/lib/zapPool';

// "Kassaga tushmagan zapchast puli" — buyurtmalarda "alohida" belgilangan
// zapchastlar puli. Boshliq undan olib ishlatsa, chiqim yoziladi va QOLDIQ
// kamayadi. FOYDA ko'rsatkichi chiqimdan o'zgarmasligi shart.

const chiqim = (id: number, summa: number, izoh = ''): ZapPoolChiqim => ({
  id, summa, izoh, sana: '2026-09-28', created_at: '2026-09-28T10:00:00.000Z',
});

describe('computeZapPoolYigilgan', () => {
  it("faqat 'alohida' belgilangan zapchastni hisoblaydi", () => {
    const orders = [{
      holat: 'tulangan',
      zaps: [
        { nom: 'Disk', narx: 900000, sebestoimost: 600000, alohida: true },
        { nom: 'Filtr', narx: 200000, sebestoimost: 150000 }, // kassaga tushgan — kirmaydi
      ],
    }];
    expect(computeZapPoolYigilgan(orders, [])).toEqual({ tushum: 900000, foyda: 300000 });
  });

  it('bekor qilingan buyurtmani hisobga olmaydi', () => {
    const zaps = [{ narx: 500000, sebestoimost: 300000, alohida: true }];
    expect(computeZapPoolYigilgan([{ holat: 'bekor qilingan', zaps }], [])).toEqual({ tushum: 0, foyda: 0 });
    expect(computeZapPoolYigilgan([{ holat: 'bekor', zaps }], [])).toEqual({ tushum: 0, foyda: 0 });
  });

  it('tannarx buyurtmada yo\'q bo\'lsa ombordan olinadi (eski buyurtmalar)', () => {
    const orders = [{ holat: 'tulangan', zaps: [{ id: 7, narx: 500000, alohida: true }] }];
    expect(computeZapPoolYigilgan(orders, [{ id: 7, sebestoimost: 200000 }]))
      .toEqual({ tushum: 500000, foyda: 300000 });
  });

  it("narx miqdorga ko'paytirilmaydi (tizim bo'ylab izchil)", () => {
    const orders = [{ holat: 'tulangan', zaps: [{ narx: 100000, sebestoimost: 0, qty: 4, alohida: true }] }];
    expect(computeZapPoolYigilgan(orders, []).tushum).toBe(100000);
  });
});

describe('computeZapPool', () => {
  const orders = [{
    holat: 'tulangan',
    zaps: [{ nom: 'Disk', narx: 19150000, sebestoimost: 7714900, alohida: true }],
  }];

  it('chiqim QOLDIQdan ayiriladi, FOYDA o\'zgarmaydi', () => {
    const res = computeZapPool(orders, [], [chiqim(1, 5000000, "Ta'minotchiga")]);
    expect(res.tushum).toBe(19150000);
    expect(res.chiqim).toBe(5000000);
    expect(res.qoldiq).toBe(14150000);
    expect(res.foyda).toBe(11435100); // chiqimdan qat'i nazar
  });

  it('chiqim yo\'q bo\'lsa qoldiq = tushum', () => {
    const res = computeZapPool(orders, [], []);
    expect(res.qoldiq).toBe(res.tushum);
    expect(res.chiqim).toBe(0);
  });

  it('ortiqcha ayirilsa manfiy qoldiq ko\'rsatadi (yashirmaydi)', () => {
    expect(computeZapPool(orders, [], [chiqim(1, 20000000)]).qoldiq).toBe(-850000);
  });

  it('chiqimTotal bo\'sh ro\'yxatda 0', () => {
    expect(chiqimTotal([])).toBe(0);
    expect(chiqimTotal(null)).toBe(0);
  });
});

describe('parseChiqimInput', () => {
  it('summa va izohni qabul qiladi', () => {
    expect(parseChiqimInput({ summa: 500000, izoh: '  ta\'minotchi  ' }))
      .toEqual({ ok: true, value: { summa: 500000, izoh: "ta'minotchi" } });
  });

  it('summa yo\'q/nol/manfiy bo\'lsa xato', () => {
    expect(parseChiqimInput({ summa: 0 }).ok).toBe(false);
    expect(parseChiqimInput({ summa: -100 }).ok).toBe(false);
    expect(parseChiqimInput({}).ok).toBe(false);
    expect(parseChiqimInput(null).ok).toBe(false);
  });

  it('izoh ixtiyoriy va 300 belgiga qisqartiriladi', () => {
    const r = parseChiqimInput({ summa: 1000, izoh: 'a'.repeat(400) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.izoh).toHaveLength(300);
  });
});
