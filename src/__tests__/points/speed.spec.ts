import { describe, it, expect } from 'vitest';
import { computeSpeedVerdicts, isSpeedEligible, type SpeedOrderInput } from '@/lib/points/speed';

// Persentil mantig'i: 9 ta bir xil murakkablikdagi (srv) buyurtma, davomiylik 10..90
// daqiqa (10 daqiqa qadam bilan). Kutilgan: eng tez 2 tasi +2, eng sekin 2 tasi -2,
// o'rtadagi 5 tasi 0 (neytral) — standart midpoint-persentil formulasi bilan mos.
function ordersOfDurations(durations: number[], srv = 100_000): SpeedOrderInput[] {
  return durations.map((durationMin, i) => ({ id: i + 1, srv, durationMin }));
}

describe('computeSpeedVerdicts', () => {
  it("bo'sh ro'yxat — bo'sh natija", () => {
    expect(computeSpeedVerdicts([]).size).toBe(0);
  });

  it('yagona buyurtma — reyting qilib bo\'lmaydi, neytral', () => {
    const v = computeSpeedVerdicts([{ id: 1, srv: 100_000, durationMin: 30 }]);
    expect(v.get('1')?.reason).toBe('neutral');
    expect(v.get('1')?.points).toBe(0);
  });

  it('9 ta bir xil murakkablikdagi buyurtma — eng tez 2tasi +2, eng sekin 2tasi -2, qolgani 0', () => {
    const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const v = computeSpeedVerdicts(ordersOfDurations(durations));

    expect(v.get('1')).toMatchObject({ points: 2, reason: 'fast_top_quartile' }); // 10 daq
    expect(v.get('2')).toMatchObject({ points: 2, reason: 'fast_top_quartile' }); // 20 daq
    expect(v.get('3')).toMatchObject({ points: 0, reason: 'neutral' });
    expect(v.get('5')).toMatchObject({ points: 0, reason: 'neutral' }); // o'rtacha (50 daq)
    expect(v.get('7')).toMatchObject({ points: 0, reason: 'neutral' });
    expect(v.get('8')).toMatchObject({ points: -2, reason: 'slow_bottom_quartile' }); // 80 daq
    expect(v.get('9')).toMatchObject({ points: -2, reason: 'slow_bottom_quartile' }); // 90 daq
  });

  it('murakkablik (srv) darajalari ALOHIDA reytinglanadi — past tier o\'zining eng tezini ballaydi', () => {
    // Past murakkablik (srv=100) — barchasi MUTLAQ sekinroq (50..90 daq).
    // Yuqori murakkablik (srv=100000) — barchasi MUTLAQ tezroq (5..9 daq).
    // Agar tierlash ishlamasa, past guruh hech qachon +2 ololmasdi (mutlaqda eng sekin).
    const low: SpeedOrderInput[] = [50, 60, 70, 80, 90].map((d, i) => ({ id: `low${i}`, srv: 100, durationMin: d }));
    const high: SpeedOrderInput[] = [5, 6, 7, 8, 9].map((d, i) => ({ id: `high${i}`, srv: 100_000, durationMin: d }));

    const v = computeSpeedVerdicts([...low, ...high]);

    expect(v.get('low0')?.reason).toBe('fast_top_quartile'); // 50 daq — past guruh ICHIDA eng tezi
    expect(v.get('low4')?.reason).toBe('slow_bottom_quartile'); // 90 daq — past guruh ichida eng sekini
    expect(v.get('high0')?.reason).toBe('fast_top_quartile');
    expect(v.get('high4')?.reason).toBe('slow_bottom_quartile');
  });
});

describe('isSpeedEligible', () => {
  const base = { bekorHolat: 'bekor', minDurationMinutes: 5 };

  it('vaqt maydonlaridan biri yo\'q bo\'lsa — mos emas', () => {
    expect(isSpeedEligible({ ...base, qabulVaqti: null, tayyorVaqti: '2026-01-01T10:00:00Z' })).toBe(false);
    expect(isSpeedEligible({ ...base, qabulVaqti: '2026-01-01T09:00:00Z', tayyorVaqti: undefined })).toBe(false);
  });

  it("bekor qilingan buyurtma — mos emas", () => {
    expect(isSpeedEligible({
      ...base, holat: 'bekor',
      qabulVaqti: '2026-01-01T09:00:00Z', tayyorVaqti: '2026-01-01T10:00:00Z',
    })).toBe(false);
  });

  it('5 daqiqadan kam — mos emas (shoshilinch belgilash)', () => {
    expect(isSpeedEligible({
      ...base,
      qabulVaqti: '2026-01-01T09:00:00Z', tayyorVaqti: '2026-01-01T09:02:00Z',
    })).toBe(false);
  });

  it('5 daqiqadan ko\'p, bekor emas — mos', () => {
    expect(isSpeedEligible({
      ...base,
      qabulVaqti: '2026-01-01T09:00:00Z', tayyorVaqti: '2026-01-01T09:10:00Z',
    })).toBe(true);
  });
});
