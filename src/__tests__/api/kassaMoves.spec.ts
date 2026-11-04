import { describe, it, expect, vi, beforeEach } from 'vitest';
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

const payment = await import('@/app/api/orders/[id]/payment/route');
const operations = await import('@/app/api/operations/route');
const salaries = await import('@/app/api/salaries/route');
const kassa = await import('@/app/api/kassa/route');

const KASSA_OK = { data: [{ naqd: 2_000_000, karta: 300_000 }], error: null };
const kassaChanges = () => (mockState.calls.rpc?.kassa_ozgartir ?? []).map(([args]) => args);
const ORDER_PREV = { zaps: [], holat: 'tulanmagan', srv: 100000, total: 100000, services: [], zarplata: 0, pribil: 0 };
const operation = { date: '2026-11-01', type: 'income', method: 'naqd', amount: 100000, category: 'Buyurtma' };

function pay(body: unknown, role?: 'xodim' | 'sherik' | 'boshliq') {
  const req = authedRequest('http://localhost/api/orders/5/payment', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }, role);
  return payment.POST(req, { params: Promise.resolve({ id: '5' }) });
}

function postJson(url: string, body: unknown) {
  return authedRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls, mockState.counters]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  mockState.responses['rpc:kassa_ozgartir'] = KASSA_OK;
  mockState.responses.operations = { data: { id: 11, ...operation }, error: null };
  mockState.responses.orders = ({ index }) =>
    index === 0 ? { data: ORDER_PREV, error: null } : { data: { id: 5, holat: 'tulangan', total: 100000, final: 100000 }, error: null };
});

describe("To'lov kassani qanday o'zgartiradi", () => {
  it('kassaga absolyut raqam emas, faqat kirim summasi yuboriladi', async () => {
    const res = await pay({ holat: 'tulangan', paid: 100000, operation, kassa: { naqd: 1, karta: 1 } });
    expect(res.status).toBe(200);
    expect(kassaChanges()).toEqual([{ p_naqd: 100000, p_karta: 0 }]);
    expect((await res.json()).kassa).toEqual({ naqd: 2_000_000, karta: 300_000 });
    expect(mockState.calls.kassa).toBeUndefined();
  });

  it("ikki tab bir vaqtda to'lasa ikkala summa ham alohida qo'shiladi", async () => {
    await Promise.all([
      pay({ paid: 100000, operation, kassa: { naqd: 500, karta: 0 } }),
      pay({ paid: 100000, operation, kassa: { naqd: 500, karta: 0 } }),
    ]);
    expect(kassaChanges()).toEqual([{ p_naqd: 100000, p_karta: 0 }, { p_naqd: 100000, p_karta: 0 }]);
  });

  it('buyurtma yangilanmasa pul kassadan qaytariladi', async () => {
    mockState.responses.orders = ({ index }) =>
      index === 0 ? { data: ORDER_PREV, error: null } : { data: null, error: { message: 'order down' } };
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await pay({ holat: 'tulangan', operation });
    errSpy.mockRestore();
    expect(res.status).toBe(500);
    expect(kassaChanges()).toEqual([{ p_naqd: 100000, p_karta: 0 }, { p_naqd: -100000, p_karta: 0 }]);
  });

  it('kassa yozilmasa buyurtma "to\'langan" bo\'lmaydi', async () => {
    mockState.responses['rpc:kassa_ozgartir'] = { data: null, error: { message: 'kassa down' } };
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await pay({ holat: 'tulangan', operation });
    errSpy.mockRestore();
    expect(res.status).toBe(500);
    expect(mockState.calls.orders).toBeUndefined();
  });

  it("topilmagan buyurtma uchun pulga tegilmaydi", async () => {
    mockState.responses.orders = { data: null, error: null };
    const res = await pay({ holat: 'tulangan', operation });
    expect(res.status).toBe(404);
    expect(kassaChanges()).toEqual([]);
    expect(mockState.calls.operations).toBeUndefined();
  });

  it("xodim va sherik to'lov qabul qila olmaydi", async () => {
    expect((await pay({ holat: 'tulangan', operation }, 'xodim')).status).toBe(403);
    expect((await pay({ holat: 'tulangan', operation }, 'sherik')).status).toBe(403);
    expect(kassaChanges()).toEqual([]);
  });

  it('boshliq to\'lov qabul qila oladi', async () => {
    expect((await pay({ holat: 'tulangan', operation }, 'boshliq')).status).toBe(200);
  });
});

describe('Operatsiya va maosh', () => {
  it('operatsiya kassani farq bilan o\'zgartiradi va yangi qoldiqni qaytaradi', async () => {
    const res = await operations.POST(postJson('http://localhost/api/operations', {
      type: 'transfer', method: 'naqd', tomethod: 'karta', amount: 5000, category: "O'tkazma", date: '2026-11-01',
    }));
    expect(res.status).toBe(200);
    expect(kassaChanges()).toEqual([{ p_naqd: -5000, p_karta: 5000 }]);
    expect((await res.json()).kassa).toEqual({ naqd: 2_000_000, karta: 300_000 });
  });

  it('kassa yozilmasa operatsiya yozuvi ham qolmaydi', async () => {
    mockState.responses['rpc:kassa_ozgartir'] = { data: null, error: { message: 'kassa down' } };
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await operations.POST(postJson('http://localhost/api/operations', {
      type: 'income', method: 'naqd', amount: 5000, category: 'Kirim', date: '2026-11-01',
    }));
    errSpy.mockRestore();
    expect(res.status).toBe(500);
  });

  it('maosh kassadan ayriladi', async () => {
    mockState.responses.salaries = { data: { id: 3, method: 'karta', amount: 700 }, error: null };
    const res = await salaries.POST(postJson('http://localhost/api/salaries', {
      worker_id: 1, method: 'karta', amount: 700, date: '2026-11-01', type: 'maosh',
    }));
    expect(res.status).toBe(200);
    expect(kassaChanges()).toEqual([{ p_naqd: 0, p_karta: -700 }]);
  });
});

describe('/api/kassa', () => {
  it("eski tab yuborgan absolyut qiymat kassani o'zgartirmaydi", async () => {
    mockState.responses.kassa = { data: { naqd: 777, karta: 1 }, error: null };
    const res = await kassa.POST(postJson('http://localhost/api/kassa', { naqd: 5, karta: 5 }));
    expect(res.status).toBe(200);
    expect(mockState.calls.kassa).toBeUndefined();
    expect(mockState.calls.rpc).toBeUndefined();
  });

  it('nol qilish faqat aniq { reset: true } bilan ishlaydi', async () => {
    mockState.responses.kassa = { data: { naqd: 0, karta: 0 }, error: null };
    const res = await kassa.POST(postJson('http://localhost/api/kassa', { reset: true }));
    expect(res.status).toBe(200);
    const written = JSON.stringify(mockState.calls.kassa);
    expect(written).toContain('"naqd":0');
    expect(written).toContain('"karta":0');
  });
});
