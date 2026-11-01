import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { isPaymentChangeDenied } from '@/lib/routeGuard';
import { proxy } from '@/proxy';
import type { CapturedCalls, MockResponder } from '../helpers/mockSupabase';
import { authedRequest } from '../helpers/authRequest';

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
  counters: {} as Record<string, number>,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('../helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls, mockState.counters) };
});
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: () => {} };
});

const sms = await import('@/app/api/send-sms/route');
const receipt = await import('@/app/api/receipt/[id]/route');
const orders = await import('@/app/api/orders/route');
const order = await import('@/app/api/orders/[id]/route');
const workers = await import('@/app/api/workers/route');
const reports = await import('@/app/api/reports/route');
const bulkImport = await import('@/app/api/bulk-import/route');
const setWebhook = await import('@/app/api/bot/set-webhook/route');
const clients = await import('@/app/api/clients/[id]/route');

const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, result: true }) }));
const orderParams = { params: Promise.resolve({ id: '5' }) };
const json = (body: unknown) => ({
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

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

describe('/api/send-sms', () => {
  it("login'siz SMS yuborib bo'lmaydi", async () => {
    const res = await sms.POST(new NextRequest('http://localhost/api/send-sms', json({ phone: '998901234567', message: 'x' })));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tizimga kirgan xodim mijozga SMS yubora oladi", async () => {
    const res = await sms.POST(authedRequest('http://localhost/api/send-sms', json({ phone: '', message: '' }), 'xodim'));
    expect(res.status).toBe(400);
  });
});

describe('/api/receipt/[id]', () => {
  const orderRow = {
    id: 5, ism: '<img src=x onerror=alert(1)>', raqam: '01a<b>', mashina: '<script>x</script>', final: 1000, paid: 0, zap: 0,
    services: [{ nom: '<svg onload=alert(1)>', narx: 1 }],
    zaps: [{ nom: '"><script>y</script>', narx: 2 }],
  };

  it("login'siz chekni ko'rib bo'lmaydi", async () => {
    mockState.responses.orders = { data: orderRow, error: null };
    const res = await receipt.GET(new NextRequest('http://localhost/api/receipt/5'), orderParams);
    expect(res.status).toBe(401);
  });

  it('mijoz nomi va xizmat nomidagi HTML ishga tushmaydi', async () => {
    mockState.responses.orders = { data: orderRow, error: null };
    const res = await receipt.GET(authedRequest('http://localhost/api/receipt/5'), orderParams);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>x');
    expect(html).not.toContain('<script>y');
    expect(html).not.toContain('<svg onload');
    expect(html).not.toContain('01A<B>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});

describe('isPaymentChangeDenied', () => {
  it('egasi va boshliq uchun cheklov yo\'q', () => {
    expect(isPaymentChangeDenied('egasi', { paid: 100 }, { paid: 0 })).toBe(false);
    expect(isPaymentChangeDenied('boshliq', { holat: 'tulangan' }, { holat: 'tayyor' })).toBe(false);
  });

  it("xodim to'lovni belgilay olmaydi", () => {
    expect(isPaymentChangeDenied('xodim', { paid: 100 }, { paid: 0 })).toBe(true);
    expect(isPaymentChangeDenied('xodim', { holat: 'tulangan' }, { holat: 'tayyor' })).toBe(true);
    expect(isPaymentChangeDenied('sherik', { holat: 'tayyor' }, { holat: 'tulangan' })).toBe(true);
    expect(isPaymentChangeDenied('xodim', { paid: 100 }, null)).toBe(true);
  });

  it("o'zgarmagan qiymatni qayta yuborish va oddiy tahrir ruxsat", () => {
    expect(isPaymentChangeDenied('xodim', { paid: 100, holat: 'tulangan' }, { paid: '100', holat: 'tulangan' })).toBe(false);
    expect(isPaymentChangeDenied('xodim', { holat: 'tayyor' }, { holat: 'ochiq' })).toBe(false);
    expect(isPaymentChangeDenied('xodim', { paid: 0, holat: 'ochiq' }, null)).toBe(false);
    expect(isPaymentChangeDenied('xodim', { muammo: 'x' } as never, { paid: 5, holat: 'tulangan' })).toBe(false);
  });
});

describe('Rollar', () => {
  it('xodim buyurtmani o\'chira olmaydi, boshliq oladi', async () => {
    const del = (role: 'xodim' | 'boshliq') =>
      order.DELETE(authedRequest('http://localhost/api/orders/5', { method: 'DELETE' }, role), orderParams);
    expect((await del('xodim')).status).toBe(403);
    mockState.responses.orders = { data: [{ id: 5 }], error: null };
    expect((await del('boshliq')).status).toBe(200);
  });

  it("xodim PATCH orqali buyurtmani to'langan qila olmaydi", async () => {
    mockState.responses.orders = { data: { zaps: [], holat: 'tayyor', paid: 0 }, error: null };
    const req = authedRequest('http://localhost/api/orders/5', { ...json({ holat: 'tulangan' }), method: 'PATCH' }, 'xodim');
    const res = await order.PATCH(req, orderParams);
    expect(res.status).toBe(403);
    expect(mockState.calls.orders).toBeUndefined();
  });

  it("xodim yangi buyurtmani oldindan to'langan qilib yarata olmaydi", async () => {
    const res = await orders.POST(authedRequest('http://localhost/api/orders', json({ ism: 'Ali', paid: 5000 }), 'xodim'));
    expect(res.status).toBe(403);
    expect(mockState.calls.orders).toBeUndefined();
  });

  it("xodim xodim qo'sha olmaydi va mijozni o'chira olmaydi", async () => {
    const add = await workers.POST(authedRequest('http://localhost/api/workers', json({ ism: 'x' }), 'xodim'));
    expect(add.status).toBe(403);
    const del = await clients.DELETE(authedRequest('http://localhost/api/clients/5', { method: 'DELETE' }, 'xodim'), orderParams);
    expect(del.status).toBe(403);
  });

  it("hisobot xodimga yopiq, sherikka ochiq", async () => {
    expect((await reports.GET(authedRequest('http://localhost/api/reports', {}, 'xodim'))).status).toBe(403);
    expect((await reports.GET(authedRequest('http://localhost/api/reports', {}, 'sherik'))).status).toBe(200);
  });

  it("ommaviy import faqat zaxira huquqi borlarga", async () => {
    const res = await bulkImport.GET(authedRequest('http://localhost/api/bulk-import', {}, 'sherik'));
    expect(res.status).toBe(403);
  });
});

describe('/api/bot/set-webhook', () => {
  it("login'siz va xodim uchun Telegram'ga so'rov ketmaydi", async () => {
    expect((await setWebhook.GET(new NextRequest('http://localhost/api/bot/set-webhook'))).status).toBe(401);
    expect((await setWebhook.GET(authedRequest('http://localhost/api/bot/set-webhook', {}, 'xodim'))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('proxy', () => {
  const status = async (path: string) => (await proxy(new NextRequest(`https://example.com${path}`))).status;

  it("login'siz yopiq API'lar 401 qaytaradi", async () => {
    for (const path of ['/api/send-sms', '/api/receipt/5', '/api/bot/set-webhook', '/api/bot/status', '/api/bot-test']) {
      expect(await status(path), path).toBe(401);
    }
  });

  it("bot-ui va webhook o'z tekshiruvi bilan o'tadi", async () => {
    expect(await status('/api/bot-ui/cars')).toBe(200);
    expect(await status('/api/telegram-webhook')).toBe(200);
  });

  it("o'chirilgan /tg-webhook sahifasi ochiq emas", async () => {
    expect(await status('/tg-webhook')).toBe(307);
  });
});
