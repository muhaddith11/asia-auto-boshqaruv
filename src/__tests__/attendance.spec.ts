import { describe, it, expect } from 'vitest';
import {
  buildDayView,
  lateArrivalText,
  normalizeHM,
  normalizeMac,
  summaryText,
  tashkentDay,
  tashkentHM,
} from '@/lib/attendance';

// Toshkent = UTC+5. '2026-10-21T03:00:00Z' = Toshkentda 08:00.
const at = (hm: string) => `2026-10-21T${String(Number(hm.slice(0, 2)) - 5).padStart(2, '0')}:${hm.slice(3)}:00.000Z`;

const workers = [
  { id: 3, ism: 'Abdulazizxon' },
  { id: 7, ism: 'Ismoil aka' },
  { id: 11, ism: 'Mirzo ' },
  { id: 13, ism: 'Anvar' }, // telefoni bog'lanmagan
];

const devices = [
  { mac: 'aa:00:00:00:00:03', worker_id: 3 },
  { mac: 'aa:00:00:00:00:07', worker_id: 7 },
  { mac: 'ba:00:00:00:00:07', worker_id: 7 }, // ikkinchi telefoni
  { mac: 'aa:00:00:00:00:11', worker_id: 11 },
];

describe('davomat — yordamchilar', () => {
  it('Toshkent kuni va vaqti UTC+5 bo\'yicha', () => {
    expect(tashkentDay('2026-10-21T19:30:00Z')).toBe('2026-10-22'); // Toshkentda 00:30
    expect(tashkentHM('2026-10-21T03:05:00Z')).toBe('08:05');
  });

  it('MAC: turli yozuvlar bir xil bo\'ladi, broadcast/multicast tashlanadi', () => {
    expect(normalizeMac('0C-EF-15-85-11-08')).toBe('0c:ef:15:85:11:08');
    expect(normalizeMac('0cef.1585.1108')).toBe('0c:ef:15:85:11:08');
    expect(normalizeMac('FF-FF-FF-FF-FF-FF')).toBeNull();
    expect(normalizeMac('01-00-5E-00-00-16')).toBeNull();
    expect(normalizeMac('xyz')).toBeNull();
  });

  it('Postgres time → HH:MM', () => {
    expect(normalizeHM('09:00:00')).toBe('09:00');
    expect(normalizeHM('9:30')).toBe('09:30');
    expect(normalizeHM('25:00', '08:00')).toBe('08:00');
  });
});

describe('davomat — kun ko\'rinishi', () => {
  const dayRow = { scanner_first: at('07:30'), scanner_last: at('09:30'), report_sent_at: null, late_notified: [] };

  it('kelgan vaqti = xodim telefonlarining eng erta ko\'rinishi; kechikish ish boshlanishiga nisbatan', () => {
    const view = buildDayView({
      day: '2026-10-21',
      workStart: '09:00',
      workers,
      devices,
      dayRow,
      presence: [
        { mac: 'aa:00:00:00:00:03', first_seen: at('08:12'), last_seen: at('09:30') },
        { mac: 'aa:00:00:00:00:07', first_seen: at('09:20'), last_seen: at('09:30') },
        { mac: 'ba:00:00:00:00:07', first_seen: at('08:47'), last_seen: at('09:00') },
      ],
    });

    expect(view.rows.map((r) => r.workerId)).toEqual([3, 7, 11]); // Anvar yo'q — telefoni bog'lanmagan
    expect(view.present.map((r) => [r.ism, tashkentHM(r.arrivedAt!), r.late])).toEqual([
      ['Abdulazizxon', '08:12', false],
      ['Ismoil aka', '08:47', false],
    ]);
    expect(tashkentHM(view.present[1].lastSeenAt!)).toBe('09:30');
    expect(view.absent.map((r) => r.ism)).toEqual(['Mirzo']);
  });

  it('skaner kech yoqilsa — birinchi skanda ko\'ringanlar "gacha" (kechikkan emas)', () => {
    const view = buildDayView({
      day: '2026-10-21',
      workStart: '09:00',
      workers,
      devices,
      dayRow: { ...dayRow, scanner_first: at('10:50') },
      presence: [
        { mac: 'aa:00:00:00:00:03', first_seen: at('10:50'), last_seen: at('11:00') },
        { mac: 'aa:00:00:00:00:11', first_seen: at('10:58'), last_seen: at('11:00') },
      ],
    });

    const [aziz, mirzo] = view.present;
    expect(aziz).toMatchObject({ approx: true, late: false });
    expect(mirzo).toMatchObject({ approx: false, late: true });

    const text = summaryText(view, at('11:00'));
    expect(text).toContain('Abdulazizxon — 10:50 gacha');
    expect(text).toContain('Mirzo — 10:58 ⏰ kechikdi');
    expect(text).toContain('Ismoil aka');
    expect(text).toContain('Skaner bugun 10:50 da yoqilgan');
  });

  it('hisobotdan keyingi xabar', () => {
    const view = buildDayView({
      day: '2026-10-21',
      workStart: '09:00',
      workers,
      devices,
      dayRow,
      presence: [{ mac: 'aa:00:00:00:00:11', first_seen: at('10:05'), last_seen: at('10:06') }],
    });
    expect(lateArrivalText(view.present, '09:00')).toBe('⏰ Mirzo keldi — 10:05 (kechikdi, ish 09:00 da)');
  });
});
