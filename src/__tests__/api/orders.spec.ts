import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { MockResult, CapturedCalls } from '../helpers/mockSupabase';

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResult>,
  calls: {} as CapturedCalls,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('../helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls) };
});

const { GET, POST } = await import('@/app/api/orders/route');

function setTable(table: string, result: MockResult) {
  mockState.responses[table] = result;
}

beforeEach(() => {
  // Reference'ni saqlab qolish uchun reassign emas, mutatsiya qilamiz —
  // mock factory shu obyektlarni bir marta closure orqali ushlab turadi.
  for (const key of Object.keys(mockState.responses)) delete mockState.responses[key];
  for (const key of Object.keys(mockState.calls)) delete mockState.calls[key];
});

function getRequest(query = '') {
  return new NextRequest(`http://localhost/api/orders${query}`);
}

function postRequest(body: unknown) {
  return new NextRequest('http://localhost/api/orders', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('/api/orders GET', () => {
  it("chegirma'ni total-final dan hisoblab, createdAt'ni belgilaydi", async () => {
    setTable('orders', {
      data: [{ id: 1, ism: 'Vali', total: 100000, final: 80000, created_at: '2026-01-01T00:00:00Z' }],
      error: null,
    });
    const res = await GET(getRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].chegirma).toBe(20000);
    expect(json[0].createdAt).toBe('2026-01-01T00:00:00Z');
  });

  it('page parametri bilan pagination shaklida qaytaradi', async () => {
    setTable('orders', {
      data: [{ id: 1, total: 100, final: 100 }],
      error: null,
      count: 45,
    });
    const res = await GET(getRequest('?page=2&limit=10'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(45);
    expect(json.page).toBe(2);
    expect(json.limit).toBe(10);
    expect(json.totalPages).toBe(5);
    expect(json.data).toHaveLength(1);
  });

  it('Supabase xatoligida 500 qaytaradi', async () => {
    setTable('orders', { data: null, error: { message: 'timeout' } });
    const res = await GET(getRequest());
    expect(res.status).toBe(500);
  });
});

describe('/api/orders POST', () => {
  it('faqat whitelist qilingan ustunlarni bazaga yuboradi', async () => {
    setTable('orders', { data: [{ id: 10, ism: 'Ali', total: 5000, final: 5000 }], error: null });

    await POST(postRequest({
      ism: 'Ali',
      mashina: 'Chevrolet Nexia',
      total: 5000,
      final: 5000,
      subTotal: 999,        // whitelist'da yo'q — mapAppToDB tomonidan olib tashlanadi
      randomHackField: 'x', // whitelist'da umuman yo'q ustun
      holat: 'yaratildi',
    }));

    const insertCalls = mockState.calls.orders?.insert;
    expect(insertCalls).toHaveLength(1);
    const [sentRows] = insertCalls![0] as [Record<string, unknown>[]];
    const sent = sentRows[0];

    expect(sent).not.toHaveProperty('subTotal');
    expect(sent).not.toHaveProperty('randomHackField');
    expect(sent.ism).toBe('Ali');
    expect(sent.holat).toBe('yaratildi');
  });

  it("yaroqsiz JSON bilan 500 qaytaradi (route shu holatni umumiy catch bilan ushlaydi)", async () => {
    const req = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: '{ yaroqsiz',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('Supabase insert xatoligida 500 qaytaradi', async () => {
    setTable('orders', { data: null, error: { message: 'insert failed' } });
    const res = await POST(postRequest({ ism: 'Ali', total: 1000, final: 1000 }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('insert failed');
  });
});
