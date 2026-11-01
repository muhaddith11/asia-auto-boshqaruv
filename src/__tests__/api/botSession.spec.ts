import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';
import { verifySessionToken, createSessionToken } from '@/lib/session';
import type { CapturedCalls, MockResponder } from '../helpers/mockSupabase';

vi.hoisted(() => {
  process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
});

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
  counters: {} as Record<string, number>,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('../helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls, mockState.counters) };
});

const { POST: session } = await import('@/app/api/bot-ui/session/route');
const { createBotToken, requireBotBoss, requireBotWorker } = await import('@/lib/botAuth');
const cars = await import('@/app/api/bot-ui/cars/route');
const sparePart = await import('@/app/api/bot-ui/spare-parts/route');

const worker = { id: 7, ism: 'Anvar', tel: '+998901234567', status: 'aktiv', is_boss: false, is_admin: false, telegram: '555' };

function initData(userId: number) {
  const fields = { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id: userId }) };
  const check = Object.entries(fields).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update('test-bot-token').digest();
  return new URLSearchParams({ ...fields, hash: createHmac('sha256', secret).update(check).digest('hex') }).toString();
}

const post = (body: unknown) =>
  session(new NextRequest('http://localhost/api/bot-ui/session', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }));

const withToken = (token?: string, query = '') =>
  new NextRequest(`http://localhost/api/bot-ui/cars${query}`, token ? { headers: { 'x-bot-token': token } } : {});

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls, mockState.counters]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  mockState.responses.workers = { data: worker, error: null };
});

describe('/api/bot-ui/session', () => {
  it('Telegram imzosi bilan token beradi va u bot API uchun ishlaydi', async () => {
    const res = await post({ initData: initData(555) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.worker).toEqual({ id: 7, ism: 'Anvar', tel: '+998901234567' });

    const guard = await requireBotWorker(withToken(json.token));
    expect(guard.denied).toBeNull();
    expect(guard.worker?.id).toBe(7);
  });

  it("imzosiz telefon yoki Telegram ID token bermaydi", async () => {
    expect((await post({ phone: '+998901234567' })).status).toBe(400);
    expect((await post({ mechanicChatId: 555, workerPhone: '+998901234567' })).status).toBe(400);
    expect((await post({ initData: 'user=%7B%22id%22%3A555%7D' })).status).toBe(401);
  });

  it("Telegram'i bog'lanmagan odam uchun not_linked qaytaradi", async () => {
    mockState.responses.workers = { data: null, error: null };
    const res = await post({ initData: initData(999) });
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('not_linked');
  });

  it("ishdan ketgan xodimga token bermaydi", async () => {
    mockState.responses.workers = { data: { ...worker, status: 'noaktiv' }, error: null };
    const res = await post({ initData: initData(555) });
    expect(res.status).toBe(403);
  });

  it("noto'g'ri kod bilan token bermaydi", async () => {
    mockState.responses.workers = { data: [worker], error: null };
    mockState.responses.bot_login_codes = { data: null, error: null };
    const res = await post({ phone: '+998901234567', code: '123456' });
    expect(res.status).toBe(401);
    expect((await res.json()).token).toBeUndefined();
  });
});

describe('bot API tekshiruvi', () => {
  it('tokensiz so\'rovni rad etadi: telefon va tg parametri hech narsa bermaydi', async () => {
    const res = await cars.GET(withToken(undefined, '?phone=998901234567&tg=555'));
    expect(res.status).toBe(401);
  });

  it('soxta tokenni rad etadi', async () => {
    const token = await createBotToken(7);
    const forged = `${btoa(JSON.stringify({ worker_id: 1, exp: Date.now() + 1000 })).replace(/=+$/, '')}.${token.split('.')[1]}`;
    expect((await requireBotWorker(withToken(forged))).denied?.status).toBe(401);
  });

  it("web sessiya tokeni bot tokeni o'rnida o'tmaydi va aksincha", async () => {
    const webToken = await createSessionToken('egasi', 'Egasi');
    expect((await requireBotWorker(withToken(webToken))).denied?.status).toBe(401);

    const botToken = await createBotToken(7);
    expect(await verifySessionToken(botToken)).toBeNull();
  });

  it("muddati o'tgan tokenni rad etadi", async () => {
    vi.useFakeTimers();
    const token = await createBotToken(7);
    vi.setSystemTime(Date.now() + 31 * 24 * 60 * 60 * 1000);
    expect((await requireBotWorker(withToken(token))).denied?.status).toBe(401);
    vi.useRealTimers();
  });

  it("xodim ishdan ketgach tokeni ishlamaydi", async () => {
    const token = await createBotToken(7);
    mockState.responses.workers = { data: { ...worker, status: 'noaktiv' }, error: null };
    expect((await requireBotWorker(withToken(token))).denied?.status).toBe(401);
  });

  it('boshliq amalini oddiy xodim bajara olmaydi', async () => {
    const token = await createBotToken(7);
    expect((await requireBotBoss(withToken(token))).denied?.status).toBe(403);

    const res = await sparePart.POST(new NextRequest('http://localhost/api/bot-ui/spare-parts', {
      method: 'POST',
      body: JSON.stringify({ workerPhone: '+998901234567', detalNomi: 'x' }),
      headers: { 'Content-Type': 'application/json', 'x-bot-token': token },
    }));
    expect(res.status).toBe(403);

    mockState.responses.workers = { data: { ...worker, is_boss: true }, error: null };
    expect((await requireBotBoss(withToken(token))).denied).toBeNull();
  });
});
