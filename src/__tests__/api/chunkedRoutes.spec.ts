import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { MockResponder, MockCallContext, CapturedCalls } from '../helpers/mockSupabase';

/**
 * 1000 qatordan katta jadvallarni qaytaradigan route'lar (orders, operations,
 * services) bo'laklab yuklaydi. Bu testlar route HANDLERNING O'ZINI tekshiradi:
 * bo'laklar to'g'ri so'ralyaptimi, birlashtirilganda tartib saqlanadimi va
 * bo'lak xatosi jim yutilib ketmayaptimi.
 */

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
  counters: {} as Record<string, number>,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('../helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls, mockState.counters) };
});

const { GET: ordersGET } = await import('@/app/api/orders/route');
const { GET: operationsGET } = await import('@/app/api/operations/route');
const { GET: servicesGET } = await import('@/app/api/services/route');

beforeEach(() => {
  for (const key of Object.keys(mockState.responses)) delete mockState.responses[key];
  for (const key of Object.keys(mockState.calls)) delete mockState.calls[key];
  // Hisoblagich ham tozalanadi — aks holda keyingi test oldingisining
  // so'rov sanog'idan davom etadi va `ctx.index` noto'g'ri bo'ladi.
  for (const key of Object.keys(mockState.counters)) delete mockState.counters[key];
});

/**
 * `total` qatorli soxta jadval: har bo'lakka o'z bo'lagini qaytaradi,
 * umumiy sonni faqat count so'ralganda beradi.
 */
function chunkedTable(total: number, makeRow: (i: number) => Record<string, unknown>) {
  const seen: MockCallContext[] = [];
  const responder = (ctx: MockCallContext) => {
    seen.push(ctx);
    const from = ctx.range?.from ?? 0;
    const to = ctx.range?.to ?? total - 1;
    return {
      data: Array.from({ length: Math.max(0, Math.min(to, total - 1) - from + 1) }, (_, i) => makeRow(from + i)),
      error: null,
      count: ctx.withCount ? total : undefined,
    };
  };
  return { responder, seen };
}

describe('/api/orders GET — bo\'laklab yuklash', () => {
  it('1000 dan ortiq buyurtmani to\'liq va tartibi buzilmagan holda qaytaradi', async () => {
    const t = chunkedTable(2500, (i) => ({ id: i, total: 100, final: 90 }));
    mockState.responses.orders = t.responder;

    const res = await ordersGET(new NextRequest('http://localhost/api/orders'));
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json).toHaveLength(2500);
    expect(json.map((r: any) => r.id)).toEqual(Array.from({ length: 2500 }, (_, i) => i));
    // mapRowToApp hali ham qo'llanadi
    expect(json[0].chegirma).toBe(10);

    // 3 ta bo'lak, count faqat birinchisida
    expect(t.seen).toHaveLength(3);
    expect(t.seen.map((c) => c.withCount)).toEqual([true, false, false]);
    expect(t.seen.map((c) => c.range)).toEqual([
      { from: 0, to: 999 }, { from: 1000, to: 1999 }, { from: 2000, to: 2999 },
    ]);
  });

  it('1000 tadan kam bo\'lsa faqat bitta so\'rov yuboradi', async () => {
    const t = chunkedTable(3, (i) => ({ id: i, total: 0, final: 0 }));
    mockState.responses.orders = t.responder;

    const json = await (await ordersGET(new NextRequest('http://localhost/api/orders'))).json();
    expect(json).toHaveLength(3);
    expect(t.seen).toHaveLength(1);
  });

  it('keyingi bo\'lakdagi xato 500 bo\'lib qaytadi (qisman ma\'lumot berilmaydi)', async () => {
    mockState.responses.orders = (ctx) => ctx.index === 0
      ? { data: Array.from({ length: 1000 }, (_, i) => ({ id: i })), error: null, count: 2000 }
      : { data: null, error: { message: 'chunk failed' } };

    const res = await ordersGET(new NextRequest('http://localhost/api/orders'));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('chunk failed');
  });

  it('page parametri bilan eski pagination xulqi buzilmagan', async () => {
    mockState.responses.orders = { data: [{ id: 1, total: 100, final: 100 }], error: null, count: 45 };
    const json = await (await ordersGET(new NextRequest('http://localhost/api/orders?page=2&limit=10'))).json();
    expect(json.total).toBe(45);
    expect(json.totalPages).toBe(5);
  });
});

describe('/api/operations GET — bo\'laklab yuklash', () => {
  it('barcha operatsiyalarni tartibi bilan qaytaradi', async () => {
    const t = chunkedTable(1808, (i) => ({ id: i, amount: i, source: 'manual' }));
    mockState.responses.operations = t.responder;

    const json = await (await operationsGET(new NextRequest('http://localhost/api/operations'))).json();
    expect(json).toHaveLength(1808);
    expect(json.map((r: any) => r.id)).toEqual(Array.from({ length: 1808 }, (_, i) => i));
    expect(t.seen).toHaveLength(2);
  });

  it('bo\'lak xatosi 500 qaytaradi', async () => {
    mockState.responses.operations = { data: null, error: { message: 'timeout' } };
    const res = await operationsGET(new NextRequest('http://localhost/api/operations'));
    expect(res.status).toBe(500);
  });
});

describe('/api/services GET — bo\'laklab yuklash', () => {
  it('4000+ xizmatni to\'liq qaytaradi va id bo\'yicha takrorni olib tashlaydi', async () => {
    const t = chunkedTable(4164, (i) => ({ id: i, name: `xizmat-${i}`, brand: 'UMUMIY' }));
    mockState.responses.services_list = t.responder;

    const json = await (await servicesGET(new Request('http://localhost/api/services'))).json();
    expect(json).toHaveLength(4164);
    expect(json[0].name).toBe('xizmat-0');
    expect(json[4163].name).toBe('xizmat-4163');
    expect(t.seen).toHaveLength(5);
  });

  it('takrorlangan id lar bittaga tushiriladi (eski xulq)', async () => {
    // Har bo'lak bir xil id larni qaytaradi — dedup ishlashi kerak
    mockState.responses.services_list = (ctx) => ({
      data: ctx.index === 0
        ? Array.from({ length: 1000 }, (_, i) => ({ id: i % 10, name: `x${i % 10}` }))
        : [],
      error: null,
      count: ctx.withCount ? 1000 : undefined,
    });

    const json = await (await servicesGET(new Request('http://localhost/api/services'))).json();
    expect(json).toHaveLength(10);
  });

  it('xatolikda 500 qaytaradi', async () => {
    mockState.responses.services_list = { data: null, error: { message: 'db down' } };
    const res = await servicesGET(new Request('http://localhost/api/services'));
    expect(res.status).toBe(500);
  });
});
