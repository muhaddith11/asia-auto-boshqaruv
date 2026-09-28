import { describe, it, expect } from 'vitest';
import { ymd, monthRange, weekRange, yearRange, quickRange } from '@/lib/dateRange';

// Eng muhim talab: "OY" filtri oyning OXIRGI KUNINI ham qamrab olishi.
// Ilgari toISOString() (UTC) tufayli 30-sentyabr "2026-09-29" bo'lib qolar,
// oyning oxirgi kunidagi kirim/chiqim hisobotga tushmasdi.

describe('dateRange', () => {
  it('ymd — mahalliy sanani beradi (UTC ga surilmaydi)', () => {
    const d = new Date(2026, 8, 30, 0, 0, 0); // 30-sentyabr, mahalliy yarim tun
    expect(ymd(d)).toBe('2026-09-30');
  });

  it("monthRange oyning oxirgi kunini QAMRAB oladi", () => {
    expect(monthRange(new Date(2026, 8, 15))).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });

  it('monthRange 31 kunlik va kabisa oyini ham to\'g\'ri beradi', () => {
    expect(monthRange(new Date(2026, 0, 5))).toEqual({ from: '2026-01-01', to: '2026-01-31' });
    expect(monthRange(new Date(2028, 1, 5))).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });

  it('weekRange dushanbadan yakshanbagacha', () => {
    // 2026-09-16 — chorshanba
    expect(weekRange(new Date(2026, 8, 16))).toEqual({ from: '2026-09-14', to: '2026-09-20' });
    // yakshanba — o'sha haftaga tegishli (oldingi dushanbadan boshlanadi)
    expect(weekRange(new Date(2026, 8, 20))).toEqual({ from: '2026-09-14', to: '2026-09-20' });
  });

  it('yearRange — yilning boshi va oxiri', () => {
    expect(yearRange(new Date(2026, 5, 5))).toEqual({ from: '2026-01-01', to: '2026-12-31' });
  });

  it('quickRange turini to\'g\'ri tanlaydi', () => {
    const now = new Date(2026, 8, 16);
    expect(quickRange('hafta', now)).toEqual(weekRange(now));
    expect(quickRange('oy', now)).toEqual(monthRange(now));
    expect(quickRange('yil', now)).toEqual(yearRange(now));
  });
});
