import { describe, it, expect } from 'vitest';
import { computePayouts, type LedgerRowForPayout } from '@/lib/points/payout';

const row = (id: number, worker_id: number, points: number): LedgerRowForPayout => ({ id, worker_id, points });

describe('computePayouts', () => {
  it('bir xodimning ballari qo\'shiladi va so\'mga o\'tkaziladi', () => {
    const [r] = computePayouts(
      [row(1, 7, 1), row(2, 7, 2), row(3, 7, 3)],
      { somPerBall: 5000 },
    );
    expect(r).toMatchObject({ worker_id: 7, net_points: 6, final_som: 30000, method: 'bonus' });
    expect(r.ledger_ids).toEqual([1, 2, 3]);
  });

  it('musbat va manfiy ballar bir-birini qoplaydi — oxirida BITTA yakuniy raqam', () => {
    // +18 toza, +12 tez, -4 qayta ta'mirlash, -4 kechikish = +22
    const [r] = computePayouts(
      [row(1, 7, 18), row(2, 7, 12), row(3, 7, -4), row(4, 7, -4)],
      { somPerBall: 5000 },
    );
    expect(r.net_points).toBe(22);
    expect(r.final_som).toBe(110000);
    expect(r.method).toBe('bonus');
  });

  it('sof ball manfiy — shtraf yoziladi', () => {
    const [r] = computePayouts([row(1, 7, -4), row(2, 7, -4), row(3, 7, 1)], { somPerBall: 5000 });
    expect(r.net_points).toBe(-7);
    expect(r.final_som).toBe(-35000);
    expect(r.method).toBe('shtraf');
  });

  it('sof ball nol — hech narsa yozilmaydi', () => {
    const [r] = computePayouts([row(1, 7, 4), row(2, 7, -4)], { somPerBall: 5000 });
    expect(r.final_som).toBe(0);
    expect(r.method).toBeUndefined();
  });

  it('chegara 0 (standart) — cheksiz, ishlab topganidan oshsa ham to\'liq beriladi', () => {
    // Egasi chegarani ataylab olib tashladi.
    const [r] = computePayouts([row(1, 7, 100)], {
      somPerBall: 5000,
      maxPercentOfEarned: 0,
      earnedByWorker: new Map([[7, 100_000]]),
    });
    expect(r.final_som).toBe(500000);
    expect(r.capped).toBe(false);
  });

  it('chegara yoqilsa — ikki tomonlama cheklaydi', () => {
    const earned = new Map([[7, 400_000]]); // 20% = 80 000
    const [bonus] = computePayouts([row(1, 7, 100)], {
      somPerBall: 5000, maxPercentOfEarned: 20, earnedByWorker: earned,
    });
    expect(bonus.final_som).toBe(80000);
    expect(bonus.capped).toBe(true);

    const [shtraf] = computePayouts([row(1, 7, -100)], {
      somPerBall: 5000, maxPercentOfEarned: 20, earnedByWorker: earned,
    });
    expect(shtraf.final_som).toBe(-80000);
    expect(shtraf.capped).toBe(true);
  });

  it('bir necha xodim alohida hisoblanadi', () => {
    const res = computePayouts([row(1, 7, 5), row(2, 8, -3), row(3, 7, 1)], { somPerBall: 5000 });
    expect(res).toHaveLength(2);
    const a = res.find((r) => r.worker_id === 7)!;
    const b = res.find((r) => r.worker_id === 8)!;
    expect(a.final_som).toBe(30000);
    expect(b.final_som).toBe(-15000);
  });

  it('bo\'sh ro\'yxat — bo\'sh natija', () => {
    expect(computePayouts([], { somPerBall: 5000 })).toEqual([]);
  });

  it('har bir xodimning ledger qatorlari ajratiladi (to\'langan deb belgilash uchun)', () => {
    const res = computePayouts([row(1, 7, 1), row(2, 8, 1), row(3, 7, 1)], { somPerBall: 5000 });
    expect(res.find((r) => r.worker_id === 7)!.ledger_ids).toEqual([1, 3]);
    expect(res.find((r) => r.worker_id === 8)!.ledger_ids).toEqual([2]);
  });
});
