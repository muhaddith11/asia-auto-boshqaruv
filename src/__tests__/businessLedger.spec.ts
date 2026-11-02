import { describe, it, expect } from 'vitest';
import { buildLedgerRows, computeXarajatJami, type LedgerOpLike, type LedgerOrderLike, type LedgerSalaryLike, type LedgerWorkerLike } from '@/lib/businessLedger';

// Bu testlar /reports/business (Ishxona bo'yicha) va boshliqning buyurtma-markazli
// hisoboti IKKALASI ham ishlatadigan qator qurish mantig'ini "muzlatadi". Ikkala
// ko'rinish ham shu funksiyadan foydalanadi — shuning uchun ularning qatorlari
// va kirimi har doim bir xil bo'lishi kafolatlanadi.

const op = (overrides: Partial<LedgerOpLike>): LedgerOpLike => ({
  id: 1, type: 'income', amount: 1000, date: '2026-09-01', ...overrides,
});
const order = (overrides: Partial<LedgerOrderLike>): LedgerOrderLike => ({
  id: 1, holat: 'tulangan', sana: '2026-09-01', final: 1000, ...overrides,
});

describe('computeXarajatJami', () => {
  const FROM = '2026-11-01';
  const TO = '2026-11-30';
  const ops: LedgerOpLike[] = [
    op({ id: 1, type: 'expense', amount: 6960000, category: 'Ishxona', date: '2026-11-02' }),
    op({ id: 2, type: 'expense', amount: 70000, category: "Buyurtma bo'yicha to'lov", comment: 'Rasxod: Pampers (Buyurtma #2600)', date: '2026-11-02' }),
    op({ id: 3, type: 'expense', amount: 500000, category: 'Aylanmadan tashqari', date: '2026-11-02' }),
    op({ id: 4, type: 'income', amount: 8460000, category: "Buyurtma to'lovi", date: '2026-11-02' }),
    op({ id: 5, type: 'transfer', amount: 1000000, date: '2026-11-02' }),
    op({ id: 6, type: 'expense', amount: 9000000, category: 'Ishxona', date: '2026-10-31' }),
  ];
  const salaries: LedgerSalaryLike[] = [
    { id: 1, xodimId: 1, summa: 2040000, method: 'naqd', sana: '2026-11-02' },
    { id: 2, xodimId: 1, summa: 300000, method: 'shtraf', sana: '2026-11-02' },
    { id: 3, xodimId: 1, summa: 400000, method: 'tashqi', sana: '2026-11-02' },
  ];

  it("noyabr raqamlari: hamma chiqim yig'iladi, kirim va perevod kirmaydi", () => {
    expect(computeXarajatJami(ops, salaries, FROM, TO)).toEqual({
      ishxona: 6960000, ishXaqi: 2040000, rasxod: 70000, tashqari: 500000, jami: 9570000,
    });
  });

  it("muddat berilmasa — butun tarix", () => {
    expect(computeXarajatJami(ops, salaries, '', '').jami).toBe(18570000);
  });
});

describe('buildLedgerRows', () => {
  it("to'lovsiz buyurtmaning alohida zapchast puli kirimga yozilmaydi (#2609)", () => {
    const rows = buildLedgerRows(
      [order({ id: 2609, final: 150000, zaps: [{ nom: 'Svecha', narx: 150000, alohida: true }] })], [], [], [],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ _orderId: 2609, _amount: 0, _positive: true });
    expect(rows[0]._izoh).toContain('Alohida zapchast');
  });

  it("to'lovsiz buyurtmada faqat alohida bo'lmagan qism kirimga yoziladi", () => {
    const rows = buildLedgerRows(
      [order({ id: 7, final: 500000, zaps: [{ narx: 200000, alohida: true }, { narx: 100000 }] })], [], [], [],
    );
    expect(rows[0]._amount).toBe(300000);
  });

  it('operatsiyani kirim/chiqim qatoriga aylantiradi', () => {
    const rows = buildLedgerRows([], [op({ id: 5, type: 'expense', amount: 50000, category: 'Ishxona' })], [], []);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ _id: '5', _amount: 50000, _positive: false, _category: 'Ishxona' });
  });

  it("to'lov operatsiyasi bo'lmagan to'langan buyurtmani zaxira qator sifatida qo'shadi", () => {
    const rows = buildLedgerRows([order({ id: 42, final: 250000, mashina: 'Cobalt', ism: 'Aziz' })], [], [], []);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ _orderId: 42, _amount: 250000, _positive: true, _mijoz: 'Aziz', _category: "Buyurtma to'lovi" });
  });

  it("to'lov operatsiyasi BOR to'langan buyurtmani ikki marta qo'shmaydi", () => {
    const rows = buildLedgerRows(
      [order({ id: 42, final: 250000 })],
      [op({ id: 9, type: 'income', amount: 250000, category: "Buyurtma to'lovi", source: 'buyurtma', comment: 'Buyurtma #42 - Cobalt (Toliq)' })],
      [], [],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]._id).toBe('9');
  });

  it("operatsiyaning mijoz ismini order_id/comment orqali topadi", () => {
    const rows = buildLedgerRows(
      [order({ id: 7, ism: 'Botir' })],
      [op({ id: 3, type: 'income', source: 'buyurtma', comment: 'Buyurtma #7 - Nexia (Toliq)' })],
      [], [],
    );
    expect(rows[0]._mijoz).toBe('Botir');
    expect(rows[0]._orderId).toBe(7);
  });

  it("bot-ui rasxod operatsiyasini _isRasxod=true deb belgilaydi, lekin summasini yashirmaydi", () => {
    const rows = buildLedgerRows(
      [],
      [op({ id: 11, type: 'expense', amount: 45000, category: "Buyurtma bo'yicha to'lov", comment: 'Rasxod: Tormoz suyuqligi (Buyurtma #7)', source: 'Ustaxona' })],
      [], [],
    );
    expect(rows[0]._isRasxod).toBe(true);
    expect(rows[0]._orderId).toBe(7);
    expect(rows[0]._amount).toBe(45000); // summasi statistikada TO'LIQ qoladi
  });

  it("to'langan buyurtmaning rasxod qatori hisobotdan tushib ketadi, to'lanmaganiniki qoladi", () => {
    const ops = [
      op({ id: 21, type: 'expense', amount: 45000, category: "Buyurtma bo'yicha to'lov", comment: 'Rasxod: Tormoz (Buyurtma #7)', source: 'Ustaxona' }),
      op({ id: 22, type: 'expense', amount: 30000, category: "Buyurtma bo'yicha to'lov", comment: 'Rasxod: Moy (Buyurtma #8)', source: 'Ustaxona' }),
    ];
    const rows = buildLedgerRows(
      [order({ id: 7, holat: 'tulangan' }), order({ id: 8, holat: 'tulanmagan' })],
      ops, [], [],
    );
    expect(rows.map((r) => r._id)).toEqual(['22']);
  });

  it("qo'lda kiritilgan 'Buyurtma bo'yicha to'lov' (rasxod EMAS) _isRasxod=false qoladi", () => {
    const rows = buildLedgerRows(
      [],
      [op({ id: 12, type: 'expense', amount: 20000, category: "Buyurtma bo'yicha to'lov", comment: 'Buyurtma #7 uchun qo\'lda xarajat', source: 'admin' })],
      [], [],
    );
    expect(rows[0]._isRasxod).toBe(false);
  });

  it('shtraf/bonusni chiqarib tashlaydi, oddiy maoshni chiqim sifatida qo\'shadi', () => {
    const salaries: LedgerSalaryLike[] = [
      { id: 1, xodimId: 1, summa: 500000, method: 'naqd', sana: '2026-09-01' },
      { id: 2, xodimId: 1, summa: 10000, method: 'shtraf', sana: '2026-09-01' },
      { id: 3, xodimId: 1, summa: 20000, method: 'bonus', sana: '2026-09-01' },
    ];
    const workers: LedgerWorkerLike[] = [{ id: 1, ism: 'Sardor' }];
    const rows = buildLedgerRows([], [], salaries, workers);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ _amount: 500000, _positive: false, _mijoz: 'Sardor', _category: 'Ish xaqi' });
  });

  it("kassadan tashqari ('tashqi') maosh hisobotga kirmaydi", () => {
    const salaries: LedgerSalaryLike[] = [
      { id: 1, xodimId: 1, summa: 500000, method: 'naqd', sana: '2026-09-01' },
      { id: 2, xodimId: 1, summa: 31034000, method: 'tashqi', sana: '2026-09-02' },
    ];
    const rows = buildLedgerRows([], [], salaries, [{ id: 1, ism: 'Sardor' }]);
    expect(rows.map((r) => r._amount)).toEqual([500000]);
  });

  it('eng yangi sana birinchi keladi', () => {
    const rows = buildLedgerRows(
      [],
      [op({ id: 1, date: '2026-09-01' }), op({ id: 2, date: '2026-09-05' }), op({ id: 3, date: '2026-09-03' })],
      [], [],
    );
    expect(rows.map(r => r._id)).toEqual(['2', '3', '1']);
  });
});
