import { describe, it, expect } from 'vitest';
import { evaluateSpeedAgainstNorm, sumOrderNorm } from '@/lib/points/speed';

// Egasi tanlagan sozlama: sabr oynasi = normaning 30% i, min ishonchli vaqt 5 daqiqa.
const T = { minDurationMinutes: 5, gracePercent: 30, fastBonusRatio: 0.6 };

describe('evaluateSpeedAgainstNorm', () => {
  // Norma 60 daqiqa (injektor tozalash). Sabr = 18 daq.
  // <=36 → +3 | 36..59 → +2 | 60..78 → 0 | 78..96 → -2 | >96 → -4
  const NORMA = 60;

  it('normadan ancha tez (<=60%) — +3', () => {
    expect(evaluateSpeedAgainstNorm(30, NORMA, T)).toMatchObject({ points: 3, reason: 'much_faster_than_norm' });
    expect(evaluateSpeedAgainstNorm(36, NORMA, T)).toMatchObject({ points: 3 });
  });

  it('normadan tez — +2', () => {
    expect(evaluateSpeedAgainstNorm(45, NORMA, T)).toMatchObject({ points: 2, reason: 'faster_than_norm' });
    expect(evaluateSpeedAgainstNorm(59, NORMA, T)).toMatchObject({ points: 2 });
  });

  it('normada yoki sabr oynasi ichida — 0', () => {
    expect(evaluateSpeedAgainstNorm(60, NORMA, T)).toMatchObject({ points: 0, reason: 'within_norm' });
    expect(evaluateSpeedAgainstNorm(78, NORMA, T)).toMatchObject({ points: 0, reason: 'within_norm' });
  });

  it('sabr oynasidan oshdi — -2', () => {
    expect(evaluateSpeedAgainstNorm(79, NORMA, T)).toMatchObject({ points: -2, reason: 'over_norm' });
    expect(evaluateSpeedAgainstNorm(96, NORMA, T)).toMatchObject({ points: -2 });
  });

  it('ancha oshirib yubordi — -4', () => {
    expect(evaluateSpeedAgainstNorm(97, NORMA, T)).toMatchObject({ points: -4, reason: 'far_over_norm' });
    expect(evaluateSpeedAgainstNorm(600, NORMA, T)).toMatchObject({ points: -4 });
  });

  it('20 daqiqalik ish (svecha): 30% sabr = 6 daqiqa', () => {
    expect(evaluateSpeedAgainstNorm(15, 20, T)).toMatchObject({ points: 2 }); // erta
    expect(evaluateSpeedAgainstNorm(12, 20, T)).toMatchObject({ points: 3 }); // <=60%
    expect(evaluateSpeedAgainstNorm(26, 20, T)).toMatchObject({ points: 0 }); // sabr oynasi chekkasi
    expect(evaluateSpeedAgainstNorm(27, 20, T)).toMatchObject({ points: -2 });
  });

  it('norma belgilanmagan — NEYTRAL, jarima ham bonus ham yo\'q', () => {
    const v = evaluateSpeedAgainstNorm(500, null, T);
    expect(v).toMatchObject({ points: 0, reason: 'no_norm' });
    expect(v.detail.norma_min).toBeNull();
  });

  it('5 daqiqadan kam — baholanmaydi (botda ikkala tugma ketma-ket bosilgan)', () => {
    // Aks holda eng katta bonus (+3) aynan tugmani shoshib bosganga tegib qolardi.
    expect(evaluateSpeedAgainstNorm(0.25, 60, T)).toMatchObject({ points: 0, reason: 'too_short_to_judge' });
    expect(evaluateSpeedAgainstNorm(4.9, 60, T)).toMatchObject({ points: 0, reason: 'too_short_to_judge' });
  });

  it('detail hisob-kitobni tushuntiradi', () => {
    expect(evaluateSpeedAgainstNorm(90, 60, T).detail).toMatchObject({
      work_min: 90, norma_min: 60, grace_min: 18, ratio: 1.5,
    });
  });
});

describe('sumOrderNorm', () => {
  it('barcha normalar bor — yig\'indi', () => {
    expect(sumOrderNorm([60, 20, 15])).toBe(95);
  });

  it('bitta xizmatning normasi yo\'q — butun buyurtma neytral (null)', () => {
    // Yarim-yorti yig'indi bilan solishtirish xodimni nohaq jarimaga qo'yardi.
    expect(sumOrderNorm([60, null])).toBeNull();
  });

  it('xizmat yo\'q — null', () => {
    expect(sumOrderNorm([])).toBeNull();
  });
});
