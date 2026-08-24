import { describe, it, expect } from 'vitest';
import { effectiveWorkMinutes, partsWaitIntervals } from '@/lib/points/workClock';

// Ustaxona 09:00–21:00 (Toshkent, UTC+5). Toshkent 09:00 = UTC 04:00, 21:00 = UTC 16:00.
const CFG = { startHour: 9, endHour: 21 };
const tash = (day: string, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const utcH = h - 5; // Toshkent → UTC
  const d = new Date(`${day}T00:00:00.000Z`);
  d.setUTCMinutes(d.getUTCMinutes() + utcH * 60 + m);
  return d.toISOString();
};

describe('effectiveWorkMinutes', () => {
  it('bitta kun ichida, to\'liq ish soatida — xom vaqtga teng', () => {
    expect(effectiveWorkMinutes(tash('2026-08-10', '10:00'), tash('2026-08-10', '11:30'), [], CFG)).toBe(90);
  });

  it('kechasi qolib ketgan ish — faqat ish soatlari sanaladi', () => {
    // Bu aynan tizimni buzayotgan holat edi: 20:50 da qabul, ertasi 09:10 da tayyor.
    // Xom vaqt 12 soat 20 daqiqa; haqiqiy ish oynasi esa 10 + 10 = 20 daqiqa.
    const work = effectiveWorkMinutes(tash('2026-08-10', '20:50'), tash('2026-08-11', '09:10'), [], CFG);
    expect(work).toBe(20);
  });

  it('ish soatidan oldin boshlanib, keyin tugagan — kesib olinadi', () => {
    // 07:00 dan 23:00 gacha = xom 16 soat, ish oynasi esa 09:00–21:00 = 12 soat.
    expect(effectiveWorkMinutes(tash('2026-08-10', '07:00'), tash('2026-08-10', '23:00'), [], CFG)).toBe(12 * 60);
  });

  it('bir necha kun — har kunning ish oynasi qo\'shiladi', () => {
    // 10-avgust 18:00 → 12-avgust 10:00: 3 soat + 12 soat + 1 soat = 16 soat.
    const work = effectiveWorkMinutes(tash('2026-08-10', '18:00'), tash('2026-08-12', '10:00'), [], CFG);
    expect(work).toBe(16 * 60);
  });

  it('butunlay ish soatidan tashqarida — 0', () => {
    expect(effectiveWorkMinutes(tash('2026-08-10', '22:00'), tash('2026-08-10', '23:30'), [], CFG)).toBe(0);
  });

  it('zapchast kutilgan oyna chiqarib tashlanadi', () => {
    // 10:00–16:00 = 6 soat ish oynasi; 11:00–14:00 zapchast kutildi (3 soat) → 3 soat.
    const excluded = [{ start: tash('2026-08-10', '11:00'), end: tash('2026-08-10', '14:00') }];
    expect(effectiveWorkMinutes(tash('2026-08-10', '10:00'), tash('2026-08-10', '16:00'), excluded, CFG)).toBe(180);
  });

  it('kechasi cho\'zilgan zapchast kutish — faqat ish soatidagi qismi ayiriladi', () => {
    // 10-avgust 10:00 → 11-avgust 12:00. Ish oynasi: 11 + 3 = 14 soat.
    // Zapchast 10-avgust 20:00 → 11-avgust 10:00: ish soatidagi qismi 1 + 1 = 2 soat.
    const excluded = [{ start: tash('2026-08-10', '20:00'), end: tash('2026-08-11', '10:00') }];
    const work = effectiveWorkMinutes(tash('2026-08-10', '10:00'), tash('2026-08-11', '12:00'), excluded, CFG);
    expect(work).toBe(12 * 60);
  });

  it('teskari yoki nol oraliq — 0', () => {
    expect(effectiveWorkMinutes(tash('2026-08-10', '12:00'), tash('2026-08-10', '12:00'), [], CFG)).toBe(0);
    expect(effectiveWorkMinutes(tash('2026-08-10', '14:00'), tash('2026-08-10', '12:00'), [], CFG)).toBe(0);
  });
});

describe('partsWaitIntervals', () => {
  it('zapchast oynasi ochilib yopiladi', () => {
    const log = [
      { bosqich: 'qabul_qilindi', vaqt: '2026-08-10T05:00:00.000Z' },
      { bosqich: 'zapchast_kutilmoqda', vaqt: '2026-08-10T06:00:00.000Z' },
      { bosqich: 'tamirlanmoqda', vaqt: '2026-08-10T09:00:00.000Z' },
      { bosqich: 'tayyor', vaqt: '2026-08-10T10:00:00.000Z' },
    ];
    expect(partsWaitIntervals(log, '2026-08-10T10:00:00.000Z')).toEqual([
      { start: '2026-08-10T06:00:00.000Z', end: '2026-08-10T09:00:00.000Z' },
    ]);
  });

  it('yopilmagan oyna — fallbackEnd bilan yopiladi', () => {
    const log = [
      { bosqich: 'qabul_qilindi', vaqt: '2026-08-10T05:00:00.000Z' },
      { bosqich: 'zapchast_kutilmoqda', vaqt: '2026-08-10T06:00:00.000Z' },
    ];
    expect(partsWaitIntervals(log, '2026-08-10T10:00:00.000Z')).toEqual([
      { start: '2026-08-10T06:00:00.000Z', end: '2026-08-10T10:00:00.000Z' },
    ]);
  });

  it('zapchast kutilmagan — bo\'sh', () => {
    const log = [
      { bosqich: 'qabul_qilindi', vaqt: '2026-08-10T05:00:00.000Z' },
      { bosqich: 'tayyor', vaqt: '2026-08-10T06:00:00.000Z' },
    ];
    expect(partsWaitIntervals(log, '2026-08-10T06:00:00.000Z')).toEqual([]);
  });

  it('status_log yo\'q — bo\'sh', () => {
    expect(partsWaitIntervals(null, '2026-08-10T06:00:00.000Z')).toEqual([]);
  });
});
