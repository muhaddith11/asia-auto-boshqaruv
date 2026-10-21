import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CapturedCalls, MockResponder } from '../helpers/mockSupabase';

// Davomat: boshliqqa kunlik hisobot hisobot vaqtida BIR MARTA ketadi, undan
// keyin kelganlar alohida xabar bo'ladi. Haqiqiy Telegram'ga hech narsa bormaydi.

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
  counters: {} as Record<string, number>,
  sent: [] as { chat: string; text: string }[],
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('../helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls, mockState.counters) };
});
vi.mock('telegraf', () => ({
  Telegraf: class {
    telegram = {
      sendMessage: async (chat: string, text: string) => {
        mockState.sent.push({ chat, text });
        return { message_id: 1 };
      },
    };
  },
}));

const { maybeNotify } = await import('@/lib/attendanceRepo');

// Toshkent 10:00 = 05:00 UTC
const NOW = new Date('2026-10-21T05:00:00Z');
const settings = { work_start: '09:00', report_time: '09:30', notify: true, scanner_key: 'k' };

function setup(day: { report_sent_at: string | null; late_notified?: number[] }, claimed = true) {
  mockState.responses.workers = {
    data: [
      { id: 2, ism: 'Yahyo aka', telegram: 'boss-tg' },
      { id: 3, ism: 'Abdulazizxon', telegram: null },
      { id: 11, ism: 'Mirzo', telegram: null },
    ],
    error: null,
  };
  mockState.responses.wifi_devices = {
    data: [
      { mac: 'aa:00:00:00:00:03', worker_id: 3 },
      { mac: 'aa:00:00:00:00:11', worker_id: 11 },
    ],
    error: null,
  };
  mockState.responses.wifi_presence = {
    data: [
      { mac: 'aa:00:00:00:00:03', first_seen: '2026-10-21T03:12:00Z', last_seen: '2026-10-21T05:00:00Z' }, // 08:12
      { mac: 'aa:00:00:00:00:11', first_seen: '2026-10-21T04:50:00Z', last_seen: '2026-10-21T05:00:00Z' }, // 09:50
    ],
    error: null,
  };
  // 0 — kun qatorini o'qish, 1 — hisobotni "egallash" yoki late_notified yozish
  mockState.responses.attendance_days = ({ index }) =>
    index === 0
      ? {
          data: {
            scanner_first: '2026-10-21T02:30:00Z', // 07:30
            scanner_last: '2026-10-21T05:00:00Z',
            report_sent_at: day.report_sent_at,
            late_notified: day.late_notified ?? [],
          },
          error: null,
        }
      : { data: claimed ? [{ day: '2026-10-21' }] : [], error: null };
}

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls, mockState.counters]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  mockState.sent.length = 0;
  process.env.TELEGRAM_BOT_TOKEN = 'test-token';
  process.env.ADMIN_TELEGRAM_ID = 'admin-tg';
});

describe('Davomat — boshliqqa xabar', () => {
  it("yuborish o'chiq bo'lsa hech narsa ketmaydi", async () => {
    setup({ report_sent_at: null });
    await maybeNotify({ ...settings, notify: false }, NOW);
    expect(mockState.sent).toEqual([]);
  });

  it('hisobot vaqti kelmagan bo\'lsa kutadi', async () => {
    setup({ report_sent_at: null });
    await maybeNotify({ ...settings, report_time: '10:30' }, NOW);
    expect(mockState.sent).toEqual([]);
  });

  it('hisobot vaqtida boshliq va adminga bir xil hisobot ketadi', async () => {
    setup({ report_sent_at: null });
    await maybeNotify(settings, NOW);

    expect(mockState.sent.map((s) => s.chat).sort()).toEqual(['admin-tg', 'boss-tg']);
    const text = mockState.sent[0].text;
    expect(text).toContain('Abdulazizxon — 08:12');
    expect(text).toContain('Mirzo — 09:50 ⏰ kechikdi');
    expect(text).not.toContain('Yahyo aka'); // telefoni bog'lanmagan — hisobotda yo'q
    expect(mockState.calls.attendance_days.update[0][0]).toHaveProperty('report_sent_at', NOW.toISOString());
  });

  it("boshqa so'rov hisobotni allaqachon egallagan bo'lsa ikkinchi marta ketmaydi", async () => {
    setup({ report_sent_at: null }, false);
    await maybeNotify(settings, NOW);
    expect(mockState.sent).toEqual([]);
  });

  it('hisobotdan keyin kelgan xodim — alohida xabar, bir marta', async () => {
    setup({ report_sent_at: '2026-10-21T04:30:00Z' }); // 09:30 da yuborilgan
    await maybeNotify(settings, NOW);

    expect(mockState.sent).toHaveLength(2);
    expect(mockState.sent[0].text).toBe('⏰ Mirzo keldi — 09:50 (kechikdi, ish 09:00 da)');
    expect(mockState.calls.attendance_days.update[0][0]).toEqual({ late_notified: [11] });

    // Keyingi skanda Mirzo endi late_notified da — qayta yuborilmaydi.
    mockState.sent.length = 0;
    mockState.counters.attendance_days = -1;
    setup({ report_sent_at: '2026-10-21T04:30:00Z', late_notified: [11] });
    await maybeNotify(settings, NOW);
    expect(mockState.sent).toEqual([]);
  });
});
