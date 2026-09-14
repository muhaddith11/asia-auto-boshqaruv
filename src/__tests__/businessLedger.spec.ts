import { describe, it, expect } from 'vitest';
import { buildLedgerRows, type LedgerOpLike, type LedgerOrderLike, type LedgerSalaryLike, type LedgerWorkerLike } from '@/lib/businessLedger';

// Bu testlar /reports/business (Ishxona bo'yicha) va boshliqning buyurtma-markazli
// hisoboti IKKALASI ham ishlatadigan qator qurish mantig'ini "muzlatadi". Ikkala
// ko'rinish ham shu funksiyadan foydalanadi — shuning uchun ularning
// Daromad/Xarajat raqamlari har doim bir xil bo'lishi kafolatlanadi.

const op = (overrides: Partial<LedgerOpLike>): LedgerOpLike => ({
  id: 1, type: 'income', amount: 1000, date: '2026-09-01', ...overrides,
});
const order = (overrides: Partial<LedgerOrderLike>): LedgerOrderLike => ({
  id: 1, holat: 'tulangan', sana: '2026-09-01', final: 1000, ...overrides,
});

describe('buildLedgerRows', () => {
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

  it('eng yangi sana birinchi keladi', () => {
    const rows = buildLedgerRows(
      [],
      [op({ id: 1, date: '2026-09-01' }), op({ id: 2, date: '2026-09-05' }), op({ id: 3, date: '2026-09-03' })],
      [], [],
    );
    expect(rows.map(r => r._id)).toEqual(['2', '3', '1']);
  });
});
