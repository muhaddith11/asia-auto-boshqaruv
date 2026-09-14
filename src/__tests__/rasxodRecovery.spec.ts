import { describe, it, expect } from 'vitest';
import { buildRasxodRows, summarizeRasxod, type RasxodOrderLike } from '@/lib/rasxodRecovery';
import type { DailyOpLike } from '@/lib/dailyReport';

// bot-ui/rasxod/route.ts qanday zap yozishini aynan takrorlaydi.
const rasxodZap = (nom: string, narx: number, vaqt: string, xodim_nomi = 'Sardor') => ({
  id: -1, nom, narx, sebestoimost: narx, qty: 1, bir: 'dona',
  kat: 'Rasxod', rasxod: true, xodim_nomi, vaqt,
});
const realZap = (nom: string, narx: number) => ({ id: 1, nom, narx, kat: 'Boshqa', qty: 1, bir: 'dona' });

const payOp = (orderId: number, day: string): DailyOpLike => ({
  type: 'income', source: 'buyurtma', category: "Buyurtma to'lovi",
  amount: 1, date: `${day}T10:00:00.000Z`, comment: `Buyurtma #${orderId} - Mijoz (To'liq)`,
});

describe('buildRasxodRows', () => {
  it("to'langan buyurtmadagi rasxod 'qaytdi' deb belgilanadi va kunini hisoblaydi", () => {
    const orders: RasxodOrderLike[] = [{
      id: 10, holat: 'tulangan', mashina: 'Cobalt', ism: 'Aziz',
      zaps: [rasxodZap('Akkumulyator', 500_000, '2026-09-01T08:00:00.000Z')],
    }];
    const rows = buildRasxodRows(orders, [payOp(10, '2026-09-04')]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: 'qaytdi', summa: 500_000, qaytishKuni: 3, mashina: 'Cobalt' });
  });

  it("hali to'lanmagan buyurtmadagi rasxod 'kutilmoqda' deb belgilanadi va kutish kunini hisoblaydi", () => {
    const orders: RasxodOrderLike[] = [{
      id: 11, holat: 'tamirlanmoqda', mashina: 'Nexia',
      zaps: [rasxodZap('Svecha', 100_000, '2026-09-10T08:00:00.000Z')],
    }];
    const now = new Date('2026-09-14T08:00:00.000Z');
    const rows = buildRasxodRows(orders, [], now);
    expect(rows[0]).toMatchObject({ status: 'kutilmoqda', kutishKuni: 4, qaytishKuni: null });
  });

  it("bekor qilingan buyurtmadagi rasxod 'bekor' deb belgilanadi (bot-ui 'bekor' qiymati ham)", () => {
    const orders: RasxodOrderLike[] = [
      { id: 12, holat: 'bekor qilingan', mashina: 'Spark', zaps: [rasxodZap('Filtr', 40_000, '2026-09-01T00:00:00Z')] },
      { id: 13, holat: 'bekor', mashina: 'Malibu', zaps: [rasxodZap('Yog', 60_000, '2026-09-02T00:00:00Z')] },
    ];
    const rows = buildRasxodRows(orders, []);
    expect(rows.every((r) => r.status === 'bekor')).toBe(true);
  });

  it('haqiqiy zapchastlarni (rasxod bo\'lmagan) e\'tiborsiz qoldiradi', () => {
    const orders: RasxodOrderLike[] = [{
      id: 14, holat: 'tulangan', mashina: 'Onix',
      zaps: [realZap('Pampers', 30_000), rasxodZap('Taxi', 20_000, '2026-09-01T00:00:00Z')],
    }];
    const rows = buildRasxodRows(orders, []);
    expect(rows).toHaveLength(1);
    expect(rows[0].nom).toBe('Taxi');
  });

  it('0 yoki manfiy summali rasxodni chiqarib tashlaydi', () => {
    const orders: RasxodOrderLike[] = [{
      id: 15, holat: 'tulangan', zaps: [rasxodZap('Bekor xato', 0, '2026-09-01T00:00:00Z')],
    }];
    expect(buildRasxodRows(orders, [])).toHaveLength(0);
  });

  it('eng yangi rasxod birinchi keladi', () => {
    const orders: RasxodOrderLike[] = [{
      id: 16, holat: 'tulanmagan',
      zaps: [rasxodZap('Eski', 10_000, '2026-09-01T00:00:00Z'), rasxodZap('Yangi', 20_000, '2026-09-10T00:00:00Z')],
    }];
    const rows = buildRasxodRows(orders, []);
    expect(rows.map((r) => r.nom)).toEqual(['Yangi', 'Eski']);
  });
});

describe('summarizeRasxod', () => {
  it('holat bo\'yicha to\'g\'ri guruhlaydi va o\'rtacha qaytish kunini hisoblaydi', () => {
    const orders: RasxodOrderLike[] = [
      { id: 1, holat: 'tulangan', zaps: [rasxodZap('A', 100_000, '2026-09-01T00:00:00Z')] },
      { id: 2, holat: 'tamirlanmoqda', zaps: [rasxodZap('B', 200_000, '2026-09-05T00:00:00Z')] },
      { id: 3, holat: 'bekor', zaps: [rasxodZap('C', 50_000, '2026-09-01T00:00:00Z')] },
    ];
    const ops = [payOp(1, '2026-09-03')]; // 2 kunda qaytdi
    const rows = buildRasxodRows(orders, ops, new Date('2026-09-10T00:00:00Z'));
    const s = summarizeRasxod(rows);
    expect(s.totalCount).toBe(3);
    expect(s.totalAmount).toBe(350_000);
    expect(s.recoveredAmount).toBe(100_000);
    expect(s.outstandingAmount).toBe(200_000);
    expect(s.lostAmount).toBe(50_000);
    expect(s.avgRecoveryDays).toBe(2);
  });

  it('bo\'sh ro\'yxatda nol qiymatlar va avgRecoveryDays=null qaytaradi', () => {
    const s = summarizeRasxod([]);
    expect(s).toMatchObject({ totalCount: 0, totalAmount: 0, avgRecoveryDays: null });
  });
});
