import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { telegramWebhookSecret } from '@/lib/telegramAuth';
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

const { POST } = await import('@/app/api/telegram-webhook/route');

const SECRET = telegramWebhookSecret('test-bot-token');
const fetchMock = vi.fn(async (_url: string, _init?: { body: string }) => ({ ok: true }));
const worker = { id: 7, ism: 'Anvar', tel: '+998901234567' };

function update(message: Record<string, unknown>, secret?: string) {
  return POST(new NextRequest('https://asiaautobot.com/api/telegram-webhook', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { 'x-telegram-bot-api-secret-token': secret } : {}),
    },
  }));
}

const contactMessage = (fromId: number, chatId: number, contactUserId: number) => ({
  chat: { id: chatId, type: 'private' },
  from: { id: fromId },
  contact: { phone_number: '998901234567', user_id: contactUserId },
});

const sentUrls = () => fetchMock.mock.calls.map(([, init]) => String(init?.body));

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls, mockState.counters]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  // 1-so'rov — chat ID bo'yicha (topilmaydi), 2-so'rov — raqam bo'yicha ro'yxat
  mockState.responses.workers = ({ index }) =>
    index === 0 ? { data: null, error: null } : { data: [worker], error: null };
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('/api/telegram-webhook', () => {
  it("maxfiy kalitsiz so'rovni rad etadi va hech narsa qilmaydi", async () => {
    const res = await update(contactMessage(555, 555, 555));
    expect(res.status).toBe(401);
    expect(mockState.calls.workers).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("noto'g'ri kalitni rad etadi", async () => {
    expect((await update(contactMessage(555, 555, 555), 'soxta')).status).toBe(401);
  });

  it("o'z raqamini yuborgan xodimni bog'laydi, tugmada telefon ko'rinmaydi", async () => {
    const res = await update(contactMessage(555, 555, 555), SECRET);
    expect(res.status).toBe(200);
    expect(mockState.calls.workers.update[0][0]).toEqual({ telegram: '555' });
    expect(sentUrls().join('')).toContain('/bot-ui"');
    expect(sentUrls().join('')).not.toContain('phone=');
  });

  it("tanilgan xodimga inline tugma yuboradi va eski pastki klaviaturani olib tashlaydi", async () => {
    mockState.responses.workers = { data: worker, error: null };
    await update({ chat: { id: 555, type: 'private' }, from: { id: 555 }, text: '/start' }, SECRET);
    const sent = sentUrls().join('');
    expect(sent).toContain('"inline_keyboard"');
    expect(sent).toContain('"remove_keyboard":true');
    expect(sent).not.toContain('"keyboard"');
  });

  it("birovning kontaktini yuborgan odamni bog'lamaydi", async () => {
    const res = await update(contactMessage(555, 555, 111), SECRET);
    expect(res.status).toBe(200);
    expect(mockState.calls.workers).toBeUndefined();
  });

  it("guruhda yuborilgan kontakt bog'lanmaydi", async () => {
    await update(contactMessage(555, -100, 555), SECRET);
    expect(mockState.calls.workers).toBeUndefined();
  });

  it("raqam filtrini buzadigan kontakt so'rovga qo'shilmaydi", async () => {
    await update({ ...contactMessage(555, 555, 555), contact: { phone_number: '1),is_admin.eq.true', user_id: 555 } }, SECRET);
    expect(mockState.calls.workers).toBeUndefined();
  });
});
