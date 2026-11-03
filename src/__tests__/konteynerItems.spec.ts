import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { CapturedCalls, MockResponder } from './helpers/mockSupabase';
import { sahnaInventari, sonniOqi, tekshirQolItem } from '@/lib/konteyner';

// Konteynerga tashqaridan olib kelinib qo'lda qo'yilgan zapchastlar
// (konteyner_items): nomi, narxi, soni, og'irligi, izohi. Ombor (parts)
// jadvaliga hech qachon yozilmaydi.

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('./helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls) };
});

const listRoute = await import('@/app/api/konteyner-items/route');
const itemRoute = await import('@/app/api/konteyner-items/[id]/route');

const saved = { id: 3, javon: 'A2-4', nom: 'Karobka', narx: 4500000, soni: 1, ogirlik: 38.5, izoh: 'Malibu 2, Toshkentdan', javon_tur: null };

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  mockState.responses.konteyner_items = { data: saved, error: null };
});

function req(url: string, method: string, body?: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const inserted = () => mockState.calls.konteyner_items?.insert?.[0]?.[0] as Record<string, unknown>[] | undefined;
const updated = () => mockState.calls.konteyner_items?.update?.[0]?.[0] as Record<string, unknown> | undefined;

describe("Qo'lda yozilgan sonni o'qish", () => {
  it.each([
    ['150 000', 150000], ['2,5', 2.5], ['38.5', 38.5], [7, 7], ['', null], [null, null], ['  ', null],
  ])('%j → %j', (v, n) => {
    expect(sonniOqi(v)).toBe(n);
  });
  it.each([['abc'], ['-5'], ['1e3'], ['12so\'m']])('%j — xato', (v) => {
    expect(Number.isNaN(sonniOqi(v))).toBe(true);
  });
});

describe('tekshirQolItem', () => {
  it('yangisida javon, nom, soni majburiy; bo\'sh narx/og\'irlik/izoh — null', () => {
    expect(tekshirQolItem({ javon: 'A2-4', nom: '  Karobka ', soni: '1', narx: '', ogirlik: '', izoh: '  ' }, true))
      .toEqual({ data: { javon: 'A2-4', nom: 'Karobka', soni: 1, narx: null, ogirlik: null, izoh: null } });
    expect(tekshirQolItem({ nom: 'X', soni: 1 }, true)).toHaveProperty('error');
    expect(tekshirQolItem({ javon: 'A2-4', nom: ' ', soni: 1 }, true)).toEqual({ error: 'Zapchast nomini yozing' });
    expect(tekshirQolItem({ javon: 'A2-4', nom: 'X', soni: 0 }, true)).toHaveProperty('error');
    expect(tekshirQolItem({ javon: 'A2-4', nom: 'X', soni: 1, narx: 'qimmat' }, true)).toHaveProperty('error');
    expect(tekshirQolItem({ javon: 'A2-4', nom: 'X', soni: 1, ogirlik: '-3' }, true)).toHaveProperty('error');
  });

  it("o'zgartirishda faqat kelgan maydonlar, bo'sh so'rov — xato", () => {
    expect(tekshirQolItem({ soni: 4 }, false)).toEqual({ data: { soni: 4 } });
    expect(tekshirQolItem({ javon_tur: 'akkum' }, false)).toEqual({ data: { javon_tur: 'akkum' } });
    expect(tekshirQolItem({}, false)).toEqual({ error: "O'zgartirish yo'q" });
    expect(tekshirQolItem({ javon_tur: 'raketa' }, false)).toHaveProperty('error');
  });
});

describe("3D sahnaga qo'lda qo'yilganlar ham chiqadi", () => {
  it('ombor zapchasti bilan bir javonda', () => {
    const inv = sahnaInventari(
      [{ id: 1, nom: 'Moy filtri', balance: 5, javon: 'A2-4' }],
      [{ ...saved, soni: '2', javon_tur: 'boshqa' }],
    );
    expect(inv['A2-4']).toEqual([
      { name: 'Karobka', cat: 'boshqa', qty: 2 },
      { name: 'Moy filtri', cat: 'filtr', qty: 5 },
    ]);
  });
});

describe('/api/konteyner-items', () => {
  it("POST: barcha 5 maydon saqlanadi, ombor (parts) ga tegilmaydi", async () => {
    const res = await listRoute.POST(req('/api/konteyner-items', 'POST', {
      javon: 'A2-4', nom: 'Karobka', narx: '4 500 000', soni: '1', ogirlik: '38,5', izoh: 'Malibu 2, Toshkentdan', id: 999,
    }));
    expect(res.status).toBe(201);
    expect(inserted()).toEqual([{ javon: 'A2-4', nom: 'Karobka', narx: 4500000, soni: 1, ogirlik: 38.5, izoh: 'Malibu 2, Toshkentdan' }]);
    expect(mockState.calls.parts).toBeUndefined();
    expect(await res.json()).toEqual(saved);
  });

  it("POST: nomsiz yoki javonsiz — 400, bazaga yozilmaydi", async () => {
    expect((await listRoute.POST(req('/api/konteyner-items', 'POST', { javon: 'A2-4', soni: 1 }))).status).toBe(400);
    expect((await listRoute.POST(req('/api/konteyner-items', 'POST', { javon: 'Z1-1', nom: 'X', soni: 1 }))).status).toBe(400);
    expect((await listRoute.POST(req('/api/konteyner-items', 'POST', '{bad'))).status).toBe(400);
    expect(inserted()).toBeUndefined();
  });

  it('PATCH: sonini o\'zgartiradi', async () => {
    const res = await itemRoute.PATCH(req('/api/konteyner-items/3', 'PATCH', { soni: 2 }), ctx('3'));
    expect(res.status).toBe(200);
    expect(updated()).toMatchObject({ soni: 2 });
    expect(Object.keys(updated() || {}).sort()).toEqual(['soni', 'updated_at']);
  });

  it('PATCH/DELETE: noto\'g\'ri id — 400, topilmasa — 404', async () => {
    expect((await itemRoute.PATCH(req('/api/konteyner-items/x', 'PATCH', { soni: 2 }), ctx('x'))).status).toBe(400);
    expect((await itemRoute.DELETE(req('/api/konteyner-items/0', 'DELETE'), ctx('0'))).status).toBe(400);
    mockState.responses.konteyner_items = { data: null, error: null };
    expect((await itemRoute.DELETE(req('/api/konteyner-items/8', 'DELETE'), ctx('8'))).status).toBe(404);
  });

  it("DELETE: o'chiradi", async () => {
    mockState.responses.konteyner_items = { data: { id: 3 }, error: null };
    const res = await itemRoute.DELETE(req('/api/konteyner-items/3', 'DELETE'), ctx('3'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, id: 3 });
  });
});
