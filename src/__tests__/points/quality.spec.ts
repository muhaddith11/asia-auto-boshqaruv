import { describe, it, expect } from 'vitest';
import { evaluateQuality, type QualityOrderInput, type QualityCandidateOrder } from '@/lib/points/quality';

const ANCHOR = '2026-07-01T10:00:00.000Z';
const ORDER: QualityOrderInput = {
  id: 100,
  raqam: '01A123BC',
  tayyorVaqti: ANCHOR,
  services: [{ serviceIndex: 0, catalogId: 55, nom: 'Motor moyi almashtirish' }],
};

function candidate(overrides: Partial<QualityCandidateOrder>): QualityCandidateOrder {
  return {
    id: 200,
    raqam: '01A123BC',
    sana: '2026-07-05T10:00:00.000Z', // ANCHOR'dan 4 kun keyin
    services: [{ serviceIndex: 0, catalogId: 55, nom: 'Motor moyi almashtirish' }],
    ...overrides,
  };
}

describe('evaluateQuality', () => {
  it('nomzod yo\'q, oyna hali ochiq — pending, ball yozilmaydi', () => {
    const now = new Date('2026-07-03T00:00:00.000Z'); // ANCHOR + 2 kun, 14 kunlik oyna yopilmagan
    const [v] = evaluateQuality(ORDER, [], now, 14);
    expect(v.reason).toBe('pending');
    expect(v.points).toBe(0);
  });

  it('nomzod yo\'q, oyna yopilgan — toza ish, +1', () => {
    const now = new Date('2026-07-16T00:00:00.000Z'); // ANCHOR + 15 kun
    const [v] = evaluateQuality(ORDER, [], now, 14);
    expect(v.reason).toBe('clean_no_rework');
    expect(v.points).toBe(1);
  });

  it('bir xil raqam + bir xil catalogId, oyna ichida — qayta ta\'mirlash, -4', () => {
    const now = new Date('2026-07-16T00:00:00.000Z');
    const [v] = evaluateQuality(ORDER, [candidate({})], now, 14);
    expect(v.reason).toBe('rework_detected');
    expect(v.points).toBe(-4);
    expect(v.detail).toMatchObject({ rework_order_id: 200, days_later: 4 });
  });

  it('bir xil raqam, lekin BOSHQA xizmat — mos kelmaydi', () => {
    const now = new Date('2026-07-16T00:00:00.000Z');
    const other = candidate({ services: [{ serviceIndex: 0, catalogId: 77, nom: 'G\'ildirak almashtirish' }] });
    const [v] = evaluateQuality(ORDER, [other], now, 14);
    expect(v.reason).toBe('clean_no_rework');
  });

  it('BOSHQA davlat raqami — hech qachon mos kelmaydi', () => {
    const now = new Date('2026-07-16T00:00:00.000Z');
    const other = candidate({ raqam: '01B999ZZ' });
    const [v] = evaluateQuality(ORDER, [other], now, 14);
    expect(v.reason).toBe('clean_no_rework');
  });

  it('oynadan TASHQARIDA (15+ kun keyin) kelgan — mos emas', () => {
    const now = new Date('2026-08-01T00:00:00.000Z');
    const late = candidate({ sana: '2026-07-20T10:00:00.000Z' }); // ANCHOR + 19 kun, 14 kunlik oynadan tashqarida
    const [v] = evaluateQuality(ORDER, [late], now, 14);
    expect(v.reason).toBe('clean_no_rework');
  });

  it('catalogId yo\'q bo\'lsa nom bo\'yicha (normalizatsiya bilan) mos keladi', () => {
    const now = new Date('2026-07-16T00:00:00.000Z');
    const noId = candidate({ services: [{ serviceIndex: 0, catalogId: null, nom: '  MOTOR MOYI ALMASHTIRISH  ' }] });
    const [v] = evaluateQuality(ORDER, [noId], now, 14);
    expect(v.reason).toBe('rework_detected');
  });

  it('o\'sha buyurtmaning o\'zi (bir xil id) o\'z-o\'ziga mos kelmaydi', () => {
    const now = new Date('2026-07-16T00:00:00.000Z');
    const self = candidate({ id: ORDER.id, sana: ANCHOR });
    const [v] = evaluateQuality(ORDER, [self], now, 14);
    expect(v.reason).toBe('clean_no_rework');
  });

  it('davlat raqami boshqacha registr/bo\'shliq bilan yozilgan bo\'lsa ham mos keladi', () => {
    const now = new Date('2026-07-16T00:00:00.000Z');
    const spaced = candidate({ raqam: ' 01a 123 bc ' });
    const [v] = evaluateQuality(ORDER, [spaced], now, 14);
    expect(v.reason).toBe('rework_detected');
  });

  it('ikkalasida ham raqam bo\'sh bo\'lsa — mos kelmaydi (raqamsiz mashinalar bir-biriga ulanmaydi)', () => {
    const now = new Date('2026-07-16T00:00:00.000Z');
    const noPlateOrder: QualityOrderInput = { ...ORDER, raqam: '' };
    const noPlateCandidate = candidate({ raqam: '' });
    const [v] = evaluateQuality(noPlateOrder, [noPlateCandidate], now, 14);
    expect(v.reason).toBe('clean_no_rework');
  });
});
