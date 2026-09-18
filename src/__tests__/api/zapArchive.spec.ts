import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { MockResponder } from '../helpers/mockSupabase';
import { createSessionToken } from '@/lib/session';

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  counters: {} as Record<string, number>,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('../helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, undefined, mockState.counters) };
});

const { GET } = await import('@/app/api/zap-archive/route');

const tokens = {
  boshliq: await createSessionToken('boshliq', 'Boshliq'),
  xodim: await createSessionToken('xodim', 'Xodim'),
};

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.counters]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
});

function get(role: keyof typeof tokens | null) {
  const headers: Record<string, string> = {};
  if (role) headers.cookie = `auth_session=${tokens[role]}`;
  return GET(new NextRequest('http://localhost/api/zap-archive', { headers }));
}

describe('GET /api/zap-archive', () => {
  it('sessiyasiz — 401', async () => {
    const res = await get(null);
    expect(res.status).toBe(401);
  });

  it('zapchastlar bo\'limiga ruxsati bor rollar (xodim ham) arxivni oladi; qatorlar to\'g\'ri turga o\'giriladi', async () => {
    mockState.responses.zap_archive = {
      data: [{
        id: '12', order_id: '2178', zap: { nom: 'Mushtik', narx: 140000 },
        mashina: 'Chevrolet Malibu 2', raqam: '40 A 001 EB', ism: 'Kunlik Mijoz', xodim: 'Yahyo aka',
        order_holat: 'tulanmagan', sana: '2026-09-17T13:47:00+00:00', sabab: 'buyurtma_ochirildi',
        removed_at: '2026-09-18T16:00:00+00:00',
      }],
      error: null,
    };
    const res = await get('xodim');
    expect(res.status).toBe(200);
    const { rows } = await res.json();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 12, order_id: 2178, zap: { nom: 'Mushtik', narx: 140000 }, xodim: 'Yahyo aka',
      order_holat: 'tulanmagan', sabab: 'buyurtma_ochirildi',
    });
  });

  it('noma\'lum sabab/bo\'sh qiymatlar yiqilmaydi — xavfsiz standartga tushadi', async () => {
    mockState.responses.zap_archive = {
      data: [{ id: 1, order_id: 5, zap: null, mashina: null, sabab: 'nimadir', order_holat: '', sana: null }],
      error: null,
    };
    const res = await get('boshliq');
    const { rows } = await res.json();
    expect(rows[0]).toMatchObject({ zap: {}, mashina: '', sabab: 'tahrirlandi', order_holat: null, sana: null });
  });

  it('bo\'sh arxiv — bo\'sh ro\'yxat', async () => {
    mockState.responses.zap_archive = { data: [], error: null };
    const res = await get('boshliq');
    expect(res.status).toBe(200);
    expect((await res.json()).rows).toEqual([]);
  });

  it('bazadan xato kelsa — 500 va xabar', async () => {
    mockState.responses.zap_archive = { data: null, error: { message: 'relation "zap_archive" does not exist' } };
    const res = await get('boshliq');
    expect(res.status).toBe(500);
    expect((await res.json()).error).toContain('zap_archive');
  });
});
