import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CapturedCalls, MockResponder } from './helpers/mockSupabase';

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
  counters: {} as Record<string, number>,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('./helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls, mockState.counters) };
});

const { consumeLoginCode, issueLoginCode } = await import('@/lib/botLoginCode');

const fetchMock = vi.fn(async (_url: string, _init: { body: string }) => ({ ok: true, status: 200 }));
const inFiveMinutes = () => new Date(Date.now() + 5 * 60 * 1000).toISOString();

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls, mockState.counters]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const savedRow = () => mockState.calls.bot_login_codes.upsert[0][0] as { code_hash: string; attempts: number };
const sentCode = () => String(JSON.parse(fetchMock.mock.calls[0][1].body).text).match(/\d{6}/)![0];

async function issueCode() {
  await issueLoginCode(7, '700');
  const code = sentCode();
  const { code_hash } = savedRow();
  return { code, code_hash };
}

describe('issueLoginCode', () => {
  it("kodni xodimning Telegram'iga yuboradi, bazada ochiq saqlamaydi", async () => {
    const { code, code_hash } = await issueCode();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).chat_id).toBe('700');
    expect(code_hash).not.toContain(code);
    expect(savedRow().attempts).toBe(0);
  });

  it("bir daqiqada ikkinchi kod bermaydi", async () => {
    mockState.responses.bot_login_codes = {
      data: { attempts: 0, expires_at: inFiveMinutes(), created_at: new Date().toISOString() },
      error: null,
    };
    await issueLoginCode(7, '700');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('urinishlar tugaganda muddat oxirigacha yangi kod bermaydi', async () => {
    mockState.responses.bot_login_codes = {
      data: { attempts: 5, expires_at: inFiveMinutes(), created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
      error: null,
    };
    await issueLoginCode(7, '700');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('consumeLoginCode', () => {
  const stored = (code_hash: string, attempts = 0, expires_at = inFiveMinutes()): MockResponder => ({ index }) =>
    index === 0 ? { data: { code_hash, attempts, expires_at }, error: null } : { data: [{ worker_id: 7 }], error: null };

  it("to'g'ri kodni qabul qiladi", async () => {
    const { code, code_hash } = await issueCode();
    mockState.counters.bot_login_codes = -1;
    mockState.responses.bot_login_codes = stored(code_hash);
    await expect(consumeLoginCode(7, code)).resolves.toBe(true);
  });

  it("noto'g'ri kodni rad etadi va urinishni sanaydi", async () => {
    const { code, code_hash } = await issueCode();
    mockState.counters.bot_login_codes = -1;
    mockState.responses.bot_login_codes = stored(code_hash, 2);
    await expect(consumeLoginCode(7, code === '111111' ? '222222' : '111111')).resolves.toBe(false);
    expect(mockState.calls.bot_login_codes.update[0][0]).toEqual({ attempts: 3 });
  });

  it("5 urinishdan keyin to'g'ri kod ham o'tmaydi", async () => {
    const { code, code_hash } = await issueCode();
    mockState.counters.bot_login_codes = -1;
    mockState.responses.bot_login_codes = stored(code_hash, 5);
    await expect(consumeLoginCode(7, code)).resolves.toBe(false);
  });

  it("muddati o'tgan kodni rad etadi", async () => {
    const { code, code_hash } = await issueCode();
    mockState.counters.bot_login_codes = -1;
    mockState.responses.bot_login_codes = stored(code_hash, 0, new Date(Date.now() - 1000).toISOString());
    await expect(consumeLoginCode(7, code)).resolves.toBe(false);
  });

  it("bir vaqtda kelgan so'rov urinishni band qila olmasa rad etiladi", async () => {
    const { code, code_hash } = await issueCode();
    mockState.counters.bot_login_codes = -1;
    mockState.responses.bot_login_codes = ({ index }) =>
      index === 0
        ? { data: { code_hash, attempts: 0, expires_at: inFiveMinutes() }, error: null }
        : { data: [], error: null };
    await expect(consumeLoginCode(7, code)).resolves.toBe(false);
  });
});
