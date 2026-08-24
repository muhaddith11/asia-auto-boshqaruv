import { describe, it, expect } from 'vitest';
import { tashkentPeriod, tashkentMonthRangeUtc, previousTashkentPeriod } from '@/lib/points/period';

// Toshkent UTC+5 — server (Vercel) UTC'da ishlaydi. Bu testlar aynan
// accept/route.ts'dagi mavjud `sana` xatosiga o'xshash oy-chegara xatosini
// oldini olish uchun (00:00-05:00 Toshkent oralig'ida UTC kun almashinuvi bor).

describe('tashkentPeriod', () => {
  it("UTC kechqurun, lekin Toshkentda ertasi kun/oy — to'g'ri keyingi oyga tushadi", () => {
    // 2026-06-30 20:00 UTC = 2026-07-01 01:00 Toshkent
    expect(tashkentPeriod('2026-06-30T20:00:00.000Z')).toBe('2026-07');
  });

  it('kun ichida oddiy holat', () => {
    expect(tashkentPeriod('2026-07-15T08:00:00.000Z')).toBe('2026-07');
  });
});

describe('tashkentMonthRangeUtc', () => {
  it("2026-07 uchun UTC chegaralar — Toshkent 1-iyul 00:00 va 1-avgust 00:00", () => {
    const { start, end } = tashkentMonthRangeUtc('2026-07');
    expect(start).toBe('2026-06-30T19:00:00.000Z');
    expect(end).toBe('2026-07-31T19:00:00.000Z');
  });
});

describe('previousTashkentPeriod', () => {
  it("joriy oydan bir oy oldingisini qaytaradi", () => {
    expect(previousTashkentPeriod('2026-08-16T03:00:00.000Z')).toBe('2026-07');
  });

  it('yil chegarasidan o\'tadi', () => {
    expect(previousTashkentPeriod('2026-01-16T03:00:00.000Z')).toBe('2025-12');
  });
});
