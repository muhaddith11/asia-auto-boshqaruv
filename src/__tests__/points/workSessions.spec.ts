import { describe, it, expect } from 'vitest';
import { summarizeSessions, type WorkSessionRow } from '@/lib/points/workSessions';

const s = (start: string, end: string | null, worker = 1): WorkSessionRow => ({
  worker_id: worker,
  started_at: start,
  ended_at: end,
});

describe('summarizeSessions', () => {
  it('bitta yopilgan sessiya — davomiyligi', () => {
    const r = summarizeSessions([s('2026-08-10T05:00:00Z', '2026-08-10T05:45:00Z')], null);
    expect(r.reliable).toBe(true);
    expect(r.totalMinutes).toBe(45);
    expect(r.sessionCount).toBe(1);
  });

  it('bir necha sessiya qo\'shiladi (tushlik uchun to\'xtatilgan)', () => {
    const r = summarizeSessions(
      [
        s('2026-08-10T05:00:00Z', '2026-08-10T06:00:00Z'), // 60
        s('2026-08-10T08:00:00Z', '2026-08-10T08:30:00Z'), // 30
      ],
      null,
    );
    expect(r.totalMinutes).toBe(90);
    expect(r.reliable).toBe(true);
  });

  it('sessiyasiz buyurtma — baholanmaydi', () => {
    const r = summarizeSessions([], '2026-08-10T10:00:00Z');
    expect(r.reliable).toBe(false);
    expect(r.reason).toBe('no_sessions');
  });

  it('ochiq sessiya tayyor_vaqti bilan yopiladi', () => {
    const r = summarizeSessions([s('2026-08-10T05:00:00Z', null)], '2026-08-10T06:00:00Z');
    expect(r.reliable).toBe(true);
    expect(r.totalMinutes).toBe(60);
  });

  it('ochiq sessiya, yopish uchun vaqt yo\'q — hali tugamagan', () => {
    const r = summarizeSessions([s('2026-08-10T05:00:00Z', null)], null);
    expect(r.reliable).toBe(false);
    expect(r.reason).toBe('still_open');
  });

  it('juda uzun sessiya — xodim "tugatdim" bosishni unutgan, baholanmaydi', () => {
    // Bu eng muhim himoya: aks holda unutilgan tugma normadan 30 barobar
    // oshgandek ko'rinib, nohaq -4 jarima yozilardi.
    const r = summarizeSessions([s('2026-08-10T05:00:00Z', '2026-08-11T05:00:00Z')], null, 10);
    expect(r.reliable).toBe(false);
    expect(r.reason).toBe('session_too_long');
    expect(r.totalMinutes).toBe(0);
  });

  it('chegaradagi sessiya (aynan 10 soat) hali ishonchli', () => {
    const r = summarizeSessions([s('2026-08-10T05:00:00Z', '2026-08-10T15:00:00Z')], null, 10);
    expect(r.reliable).toBe(true);
    expect(r.totalMinutes).toBe(600);
  });

  it('bir necha xodim — vaqt xodimlar bo\'yicha ham ajratiladi', () => {
    const r = summarizeSessions(
      [
        s('2026-08-10T05:00:00Z', '2026-08-10T06:00:00Z', 1),
        s('2026-08-10T06:00:00Z', '2026-08-10T06:30:00Z', 2),
      ],
      null,
    );
    expect(r.totalMinutes).toBe(90);
    expect(r.byWorker[1]).toBe(60);
    expect(r.byWorker[2]).toBe(30);
  });

  it('teskari yoki nol sessiya e\'tiborga olinmaydi', () => {
    const r = summarizeSessions(
      [
        s('2026-08-10T06:00:00Z', '2026-08-10T05:00:00Z'), // teskari
        s('2026-08-10T07:00:00Z', '2026-08-10T07:20:00Z'), // 20
      ],
      null,
    );
    expect(r.totalMinutes).toBe(20);
  });
});
