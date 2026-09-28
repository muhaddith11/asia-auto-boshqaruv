import { describe, it, expect } from 'vitest';
import {
  orderPartsCash, orderPartLines, attachOrderProfit, computeBossStats,
  type BossOrderLike,
} from '@/lib/bossProfit';
import type { LedgerRow } from '@/lib/businessLedger';

// Boshliqning "Ishxona bo'yicha" hisobotidagi FOYDA formulasini "muzlatadi":
//   Foyda = Kirim − Zapchast − To'langan ish xaqi − Ishxona xarajati
// Eng muhimi — hech bir pul IKKI marta ayirilmasligi (rasxod, alohida zapchast,
// qisman to'lovlar).

const row = (o: Partial<LedgerRow>): LedgerRow => ({
  _id: '1', _date: '2026-09-01', _displayDate: '01.09.2026', _rawDate: '2026-09-01',
  _category: "Buyurtma to'lovi", _izoh: '', _mijoz: '', _amount: 0, _method: 'NAQD',
  _positive: true, _orderId: null, _isRasxod: false, ...o,
});

const order = (id: number, zaps: BossOrderLike['zaps']): BossOrderLike => ({ id, zaps });

describe('orderPartsCash', () => {
  it("oddiy zapchast pulini qo'shadi (narx miqdorga ko'paytirilmaydi)", () => {
    expect(orderPartsCash(order(1, [{ nom: 'Babina', narx: 500000, qty: 4 }]))).toBe(500000);
  });

  it("'alohida' zapchastni hisobga olmaydi — uning puli kassaga tushmagan", () => {
    const o = order(1, [{ nom: 'Filtr', narx: 200000 }, { nom: 'Disk', narx: 900000, alohida: true }]);
    expect(orderPartsCash(o)).toBe(200000);
  });

  it('rasxod (xodim sotib olgan) zapchastni HISOBGA OLADI', () => {
    const o = order(1, [{ nom: 'Injektr', narx: 2360000, rasxod: true, kat: 'Rasxod' }]);
    expect(orderPartsCash(o)).toBe(2360000);
    expect(orderPartLines(o.zaps).map((p) => p.rasxod)).toEqual([true]);
  });

  it("zapchastsiz buyurtma 0 beradi", () => {
    expect(orderPartsCash(order(1, []))).toBe(0);
    expect(orderPartsCash(null)).toBe(0);
  });
});

describe('attachOrderProfit', () => {
  it("boshliq misoli: 1 000 000 lik buyurtmadan 500 000 zapchast → foyda 500 000", () => {
    const rows = [{ row: row({ _id: 'a', _amount: 1000000, _orderId: 7 }), order: order(7, [{ nom: 'Babina', narx: 500000 }]) }];
    const [r] = attachOrderProfit(rows);
    expect(r.zapchast).toBe(500000);
    expect(r.foyda).toBe(500000);
  });

  it('qisman to\'lovlarda zapchastni proporsional taqsimlaydi (ikki marta sanamaydi)', () => {
    const o = order(7, [{ nom: 'Disk', narx: 300000 }]);
    const rows = [
      { row: row({ _id: 'a', _amount: 600000, _orderId: 7 }), order: o },
      { row: row({ _id: 'b', _amount: 400000, _orderId: 7 }), order: o },
    ];
    const res = attachOrderProfit(rows);
    expect(res.map((r) => r.zapchast)).toEqual([180000, 120000]);
    expect(res.reduce((s, r) => s + r.zapchast, 0)).toBe(300000); // aynan bir marta
    expect(res.reduce((s, r) => s + r.foyda, 0)).toBe(700000);
  });

  it('qisman to\'langan buyurtmada zapchastning FAQAT to\'langan ulushi ayiriladi', () => {
    // 1 000 000 lik buyurtma, 400 000 zapchast, mijoz hozircha 250 000 to'ladi
    const o = { ...order(7, [{ nom: 'Injektor', narx: 400000 }]), final: 1000000 };
    const [r] = attachOrderProfit([{ row: row({ _id: 'a', _amount: 250000, _orderId: 7 }), order: o }]);
    expect(r.zapchast).toBe(100000); // 400 000 × 250/1000
    expect(r.foyda).toBe(150000);    // "katta zarar" bo'lib ko'rinmaydi
  });

  it('chegirma foydadan chiqadi (kirim kamayadi, zapchast to\'liq ayiriladi)', () => {
    // 1 000 000 lik buyurtma (200 000 zapchast), 100 000 chegirma → final 900 000
    const o = { ...order(7, [{ nom: 'Filtr', narx: 200000 }]), final: 900000 };
    const [r] = attachOrderProfit([{ row: row({ _id: 'a', _amount: 900000, _orderId: 7 }), order: o }]);
    expect(r.zapchast).toBe(200000);
    expect(r.foyda).toBe(700000); // chegirmasiz 800 000 bo'lardi — farq aynan chegirma
  });

  it('chegirma zapchast pulidan ham katta bo\'lsa — zarar ko\'rinadi (yashirilmaydi)', () => {
    const o = { ...order(7, [{ nom: 'Akumlator', narx: 1700000 }]), final: 250000 };
    const [r] = attachOrderProfit([{ row: row({ _id: 'a', _amount: 250000, _orderId: 7 }), order: o }]);
    expect(r.zapchast).toBe(1700000);
    expect(r.foyda).toBe(-1450000);
  });

  it('buyurtmasi topilmagan qatorda zapchast 0, foyda = to\'lov', () => {
    const [r] = attachOrderProfit([{ row: row({ _id: 'a', _amount: 250000, _orderId: 99 }), order: null }]);
    expect(r.zapchast).toBe(0);
    expect(r.foyda).toBe(250000);
  });
});

describe('computeBossStats', () => {
  it('Foyda = Kirim − Zapchast − Ish xaqi − Ishxona xarajati', () => {
    const rows: LedgerRow[] = [
      row({ _id: '1', _amount: 1000000, _positive: true, _orderId: 7 }),
      row({ _id: '2', _amount: 200000, _positive: true, _category: 'Boshqa' }),
      row({ _id: '3', _amount: 150000, _positive: false, _category: 'Ish xaqi' }),
      row({ _id: '4', _amount: 300000, _positive: false, _category: 'Ishxona' }),
    ];
    const s = computeBossStats(rows, 500000);
    expect(s).toMatchObject({ kirim: 1200000, zapchast: 500000, ishXaqi: 150000, ishxonaXarajat: 300000 });
    expect(s.foyda).toBe(250000);
  });

  it('rasxod chiqimini xarajatga QO\'SHMAYDI — u zapchast sifatida ayirilgan', () => {
    const rows: LedgerRow[] = [
      row({ _id: '1', _amount: 1200000, _positive: true, _orderId: 7 }),
      row({ _id: '2', _amount: 200000, _positive: false, _category: "Buyurtma bo'yicha to'lov", _isRasxod: true, _orderId: 7 }),
    ];
    // Zapchast (rasxod) 200 000 kirimdan ayirilgan → chiqim tarafida yana ayirilmaydi
    const s = computeBossStats(rows, 200000);
    expect(s.ishxonaXarajat).toBe(0);
    expect(s.foyda).toBe(1000000);
  });

  it("qo'lda kiritilgan 'Buyurtma bo'yicha to'lov' (rasxod emas) xarajatda qoladi", () => {
    const rows: LedgerRow[] = [
      row({ _id: '1', _amount: 1000000, _positive: true }),
      row({ _id: '2', _amount: 200000, _positive: false, _category: "Buyurtma bo'yicha to'lov", _isRasxod: false }),
    ];
    expect(computeBossStats(rows, 0).ishxonaXarajat).toBe(200000);
  });

  it("zarar bo'lsa manfiy foyda ko'rsatadi (yashirmaydi)", () => {
    const rows: LedgerRow[] = [
      row({ _id: '1', _amount: 500000, _positive: true }),
      row({ _id: '2', _amount: 900000, _positive: false, _category: 'Ishxona' }),
    ];
    expect(computeBossStats(rows, 0).foyda).toBe(-400000);
  });
});
