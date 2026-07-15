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

const { GET, POST } = await import('@/app/api/clients/route');

function setTable(table: string, result: MockResult) {
  mockState.responses[table] = result;
}

beforeEach(() => {
  // Reference'ni saqlab qolish uchun reassign emas, mutatsiya qilamiz —
  // mock factory shu obyektlarni bir marta closure orqali ushlab turadi.
  for (const key of Object.keys(mockState.responses)) delete mockState.responses[key];
  for (const key of Object.keys(mockState.calls)) delete mockState.calls[key];
});

function postRequest(body: unknown) {
  return new NextRequest('http://localhost/api/clients', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('/api/clients', () => {
  it("GET mijozlar ro'yxatini qaytaradi", async () => {
    setTable('clients', { data: [{ id: 1, ism: 'Vali', tel: '901234567' }], error: null });
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([{ id: 1, ism: 'Vali', tel: '901234567' }]);
  });

  it('GET Supabase xatoligida 500 qaytaradi', async () => {
    setTable('clients', { data: null, error: { message: 'DB tushib qoldi' } });
    const res = await GET();
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('DB tushib qoldi');
  });

  it('POST faqat ruxsat etilgan ustunlarni bazaga yuboradi (mass-assignment himoyasi)', async () => {
    setTable('clients', { data: [{ id: 2, ism: 'Ali' }], error: null });

    const res = await POST(postRequest({
      ism: 'Ali',
      tel: '901112233',
      id: 99999,          // ruxsat etilmagan — mijoz o'z ID'sini belgilay olmasligi kerak
      role: 'egasi',      // bunday ustun umuman yo'q — jadvalga tushmasligi kerak
    }));

    expect(res.status).toBe(201);

    const insertCalls = mockState.calls.clients?.insert;
    expect(insertCalls).toHaveLength(1);
    const [sentRows] = insertCalls![0] as [Record<string, unknown>[]];
    expect(sentRows[0]).toEqual({ ism: 'Ali', tel: '901112233' });
    expect(sentRows[0]).not.toHaveProperty('id');
    expect(sentRows[0]).not.toHaveProperty('role');
  });

  it("POST bo'sh/yaroqsiz JSON bilan 400 qaytaradi", async () => {
    const req = new NextRequest('http://localhost/api/clients', {
      method: 'POST',
      body: '{ yaroqsiz',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('POST muvaffaqiyatli yaratilgan mijozni 201 bilan qaytaradi', async () => {
    setTable('clients', { data: [{ id: 3, ism: 'Karim', tel: '901234567', status: 'aktiv' }], error: null });
    const res = await POST(postRequest({ ism: 'Karim', tel: '901234567', status: 'aktiv' }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe(3);
    expect(json.ism).toBe('Karim');
  });

  it('POST Supabase insert xatoligida 500 qaytaradi', async () => {
    setTable('clients', { data: null, error: { message: 'unique constraint violation' } });
    const res = await POST(postRequest({ ism: 'Karim' }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('unique constraint violation');
  });
});
