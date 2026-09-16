import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { CapturedCalls, MockResponder } from '../helpers/mockSupabase';
import { createSessionToken } from '@/lib/session';

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
  counters: {} as Record<string, number>,
  afterTasks: [] as Array<() => unknown>,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('../helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls, mockState.counters) };
});

// `after()` so'rov kontekstisiz ishlamaydi — vazifani yig'ib qo'yamiz (audit testida qo'lda ishga tushiriladi).
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: (task: () => unknown) => { mockState.afterTasks.push(task); } };
});

const listRoute = await import('@/app/api/rasxod-daftar/route');
const carRoute = await import('@/app/api/rasxod-daftar/[id]/route');
const itemsRoute = await import('@/app/api/rasxod-daftar/[id]/items/route');
const itemRoute = await import('@/app/api/rasxod-daftar/[id]/items/[itemId]/route');
const tulovRoute = await import('@/app/api/rasxod-daftar/[id]/tulov/route');

const tokens = {
  boshliq: await createSessionToken('boshliq', 'Boshliq'),
  sherik: await createSessionToken('sherik', 'Sherik'),
  xodim: await createSessionToken('xodim', 'Xodim'),
};

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls, mockState.counters]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  mockState.afterTasks.length = 0;
});

function req(
  path: string,
  { method = 'GET', body, role = 'boshliq' }: { method?: string; body?: unknown; role?: keyof typeof tokens | null } = {},
) {
  const headers: Record<string, string> = {};
  if (role) headers.cookie = `auth_session=${tokens[role]}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return new NextRequest(`http://localhost/api/rasxod-daftar${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const ctx = <T extends Record<string, string>>(params: T) => ({ params: Promise.resolve(params) });

const carRow = { id: 7, mashina: 'Zeekr 001', raqam: '601111111', mijoz: null, tel: null, izoh: null, created_at: '2026-09-03T08:00:00Z', updated_at: '2026-09-03T08:00:00Z' };
const itemRow = (id: number, extra: Record<string, unknown> = {}) => ({
  id, car_id: 7, nom: 'Zds', summa: '1200000', sana: '2026-09-03', tulandi: false, tulangan_vaqt: null, created_at: '2026-09-03T08:00:00Z', ...extra,
});

describe('/api/rasxod-daftar — kirish huquqi', () => {
  it("sessiyasiz 401, xodim uchun 403 (hisobotlar bo'limi yopiq)", async () => {
    expect((await listRoute.GET(req('', { role: null }))).status).toBe(401);
    expect((await listRoute.GET(req('', { role: 'xodim' }))).status).toBe(403);
    expect((await tulovRoute.POST(req('/7/tulov', { method: 'POST', body: { tulandi: true }, role: 'xodim' }), ctx({ id: '7' }))).status).toBe(403);
    expect(mockState.calls.rasxod_items).toBeUndefined();
  });

  it('soxta (imzosi buzilgan) sessiya bilan 401', async () => {
    const res = await listRoute.GET(new NextRequest('http://localhost/api/rasxod-daftar', {
      headers: { cookie: `auth_session=${tokens.boshliq.slice(0, -2)}xx` },
    }));
    expect(res.status).toBe(401);
  });
});

describe('GET /api/rasxod-daftar', () => {
  it("mashinalarni rasxodlari bilan qaytaradi (summa songa o'giriladi, sana bo'yicha tartib)", async () => {
    mockState.responses.rasxod_cars = { data: [carRow, { ...carRow, id: 8, mashina: 'Nexia' }], error: null };
    mockState.responses.rasxod_items = {
      data: [itemRow(2, { sana: '2026-09-10', nom: 'Benzin', summa: 168000 }), itemRow(1)],
      error: null,
    };
    const res = await listRoute.GET(req('', { role: 'sherik' }));
    expect(res.status).toBe(200);
    const { cars } = await res.json();
    expect(cars).toHaveLength(2);
    expect(cars[0].items.map((i: { nom: string; summa: number }) => [i.nom, i.summa])).toEqual([['Zds', 1_200_000], ['Benzin', 168_000]]);
    expect(cars[1]).toMatchObject({ id: 8, mashina: 'Nexia', items: [] });
  });

  it('DB xatosida 500', async () => {
    mockState.responses.rasxod_cars = { data: null, error: { message: 'DB tushdi' } };
    const res = await listRoute.GET(req(''));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('DB tushdi');
  });
});

describe('POST /api/rasxod-daftar', () => {
  it("mashina + rasxodlarni yaratadi; bazaga faqat ruxsat etilgan maydonlar ketadi", async () => {
    mockState.responses.rasxod_cars = { data: [carRow], error: null };
    mockState.responses.rasxod_items = { data: [itemRow(1)], error: null };

    const res = await listRoute.POST(req('', {
      method: 'POST',
      body: {
        mashina: 'Zeekr 001', raqam: '601111111', id: 999, created_at: '2000-01-01',
        items: [{ nom: 'Zds', summa: '1 200 000', sana: '2026-09-03', tulandi: true, car_id: 1 }],
      },
    }));
    expect(res.status).toBe(201);
    const { car } = await res.json();
    expect(car).toMatchObject({ id: 7, mashina: 'Zeekr 001', items: [{ id: 1, summa: 1_200_000, tulandi: false }] });

    const [carRows] = mockState.calls.rasxod_cars.insert[0] as [Record<string, unknown>[]];
    expect(carRows).toEqual([{ mashina: 'Zeekr 001', raqam: '601111111', mijoz: null, tel: null, izoh: null }]);
    const [itemRows] = mockState.calls.rasxod_items.insert[0] as [Record<string, unknown>[]];
    // tulandi/car_id mijozdan olinmaydi — car_id yaratilgan mashinadan
    expect(itemRows).toEqual([{ nom: 'Zds', summa: 1_200_000, sana: '2026-09-03', car_id: 7 }]);
    expect(mockState.afterTasks).toHaveLength(1);
  });

  it("rasxodlarsiz ham yaratadi (rasxod_items'ga so'rov ketmaydi)", async () => {
    mockState.responses.rasxod_cars = { data: [carRow], error: null };
    const res = await listRoute.POST(req('', { method: 'POST', body: { raqam: '601111111' } }));
    expect(res.status).toBe(201);
    expect(mockState.calls.rasxod_items).toBeUndefined();
  });

  it("na mashina, na raqam bo'lmasa yoki rasxod noto'g'ri bo'lsa — 400, bazaga hech narsa yozilmaydi", async () => {
    const noCar = await listRoute.POST(req('', { method: 'POST', body: { mijoz: 'Aziz' } }));
    expect(noCar.status).toBe(400);
    const badItem = await listRoute.POST(req('', { method: 'POST', body: { mashina: 'Cobalt', items: [{ nom: 'Moy', summa: 0 }] } }));
    expect(badItem.status).toBe(400);
    expect((await badItem.json()).error).toMatch(/summa/i);
    const badJson = await listRoute.POST(req('', { method: 'POST', body: '{ yaroqsiz' }));
    expect(badJson.status).toBe(400);
    expect(mockState.calls.rasxod_cars).toBeUndefined();
  });

  it("rasxodlar saqlanmasa yaratilgan mashina qaytarib o'chiriladi va 500 qaytadi", async () => {
    const carCalls: number[] = [];
    mockState.responses.rasxod_cars = (c) => {
      carCalls.push(c.index);
      return { data: [carRow], error: null };
    };
    mockState.responses.rasxod_items = { data: null, error: { message: 'insert xato' } };
    const res = await listRoute.POST(req('', { method: 'POST', body: { mashina: 'Zeekr', items: [{ nom: 'A', summa: 1 }] } }));
    expect(res.status).toBe(500);
    // 0 — insert, 1 — kompensatsiya uchun delete
    expect(carCalls).toEqual([0, 1]);
  });
});

describe('PATCH / DELETE /api/rasxod-daftar/[id]', () => {
  it("faqat yuborilgan maydonlarni yangilaydi (+updated_at)", async () => {
    mockState.responses.rasxod_cars = { data: [{ ...carRow, mijoz: 'Vali' }], error: null };
    const res = await carRoute.PATCH(req('/7', { method: 'PATCH', body: { mijoz: ' Vali ', id: 1 } }), ctx({ id: '7' }));
    expect(res.status).toBe(200);
    expect((await res.json()).car).toMatchObject({ id: 7, mijoz: 'Vali' });
    const [patch] = mockState.calls.rasxod_cars.update[0] as [Record<string, unknown>];
    expect(Object.keys(patch).sort()).toEqual(['mijoz', 'updated_at']);
    expect(patch.mijoz).toBe('Vali');
  });

  it("topilmasa 404, noto'g'ri ID bo'lsa 400", async () => {
    mockState.responses.rasxod_cars = { data: [], error: null };
    expect((await carRoute.PATCH(req('/7', { method: 'PATCH', body: { mijoz: 'A' } }), ctx({ id: '7' }))).status).toBe(404);
    expect((await carRoute.DELETE(req('/7', { method: 'DELETE' }), ctx({ id: '7' }))).status).toBe(404);
    expect((await carRoute.DELETE(req('/abc', { method: 'DELETE' }), ctx({ id: 'abc' }))).status).toBe(400);
    expect((await carRoute.PATCH(req('/0', { method: 'PATCH', body: { mijoz: 'A' } }), ctx({ id: '0' }))).status).toBe(400);
  });

  it("o'chirilganda ok qaytaradi va audit yoziladi", async () => {
    mockState.responses.rasxod_cars = { data: [carRow], error: null };
    const res = await carRoute.DELETE(req('/7', { method: 'DELETE' }), ctx({ id: '7' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    await Promise.all(mockState.afterTasks.map((task) => task()));
    const [auditRows] = mockState.calls.audit_log.insert[0] as [Record<string, unknown>[]];
    expect(auditRows[0]).toMatchObject({ action: 'delete', entity: 'rasxod_daftar', entity_id: '7' });
  });
});

describe('/api/rasxod-daftar/[id]/items', () => {
  it("bitta rasxod qo'shadi (sana berilmasa bugun)", async () => {
    mockState.responses.rasxod_items = { data: [itemRow(3, { nom: 'Benzin', summa: 168000 })], error: null };
    const res = await itemsRoute.POST(req('/7/items', { method: 'POST', body: { nom: 'Benzin', summa: 168000 } }), ctx({ id: '7' }));
    expect(res.status).toBe(201);
    expect((await res.json()).items).toHaveLength(1);
    const [rows] = mockState.calls.rasxod_items.insert[0] as [Record<string, unknown>[]];
    expect(rows[0]).toMatchObject({ nom: 'Benzin', summa: 168000, car_id: 7 });
    expect(rows[0].sana).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("mashina o'chirilgan bo'lsa (foreign key) 404", async () => {
    mockState.responses.rasxod_items = { data: null, error: { message: 'violates foreign key constraint', code: '23503' } };
    const res = await itemsRoute.POST(req('/7/items', { method: 'POST', body: { nom: 'A', summa: 1 } }), ctx({ id: '7' }));
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe('Mashina topilmadi');
  });

  it("rasxodni tahrirlaydi — to'lov holatini bu yo'l bilan o'zgartirib bo'lmaydi", async () => {
    mockState.responses.rasxod_items = { data: [itemRow(1, { summa: 1300000 })], error: null };
    const res = await itemRoute.PATCH(
      req('/7/items/1', { method: 'PATCH', body: { summa: '1 300 000', tulandi: true } }),
      ctx({ id: '7', itemId: '1' }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).item).toMatchObject({ id: 1, summa: 1_300_000 });
    const [patch] = mockState.calls.rasxod_items.update[0] as [Record<string, unknown>];
    expect(patch).toEqual({ summa: 1_300_000 });

    const onlyTulandi = await itemRoute.PATCH(
      req('/7/items/1', { method: 'PATCH', body: { tulandi: true } }),
      ctx({ id: '7', itemId: '1' }),
    );
    expect(onlyTulandi.status).toBe(400);
  });

  it("rasxodni o'chiradi; boshqa mashinaniki yoki yo'q bo'lsa 404", async () => {
    mockState.responses.rasxod_items = { data: [itemRow(1)], error: null };
    expect((await itemRoute.DELETE(req('/7/items/1', { method: 'DELETE' }), ctx({ id: '7', itemId: '1' }))).status).toBe(200);
    mockState.responses.rasxod_items = { data: [], error: null };
    expect((await itemRoute.DELETE(req('/8/items/1', { method: 'DELETE' }), ctx({ id: '8', itemId: '1' }))).status).toBe(404);
  });
});

describe('POST /api/rasxod-daftar/[id]/tulov', () => {
  it("to'landi: tulandi=true va to'langan vaqti yoziladi, o'zgargan qatorlar qaytadi", async () => {
    mockState.responses.rasxod_items = { data: [itemRow(1, { tulandi: true, tulangan_vaqt: '2026-09-16T10:00:00Z' })], error: null };
    const res = await tulovRoute.POST(req('/7/tulov', { method: 'POST', body: { tulandi: true } }), ctx({ id: '7' }));
    expect(res.status).toBe(200);
    expect((await res.json()).items).toMatchObject([{ id: 1, tulandi: true, tulangan_vaqt: '2026-09-16T10:00:00Z' }]);
    const [patch] = mockState.calls.rasxod_items.update[0] as [Record<string, unknown>];
    expect(patch.tulandi).toBe(true);
    expect(Number.isNaN(Date.parse(String(patch.tulangan_vaqt)))).toBe(false);
    expect(mockState.afterTasks).toHaveLength(1);
  });

  it("qaytarish (tulandi=false) to'langan vaqtini tozalaydi; hech narsa o'zgarmasa audit yozilmaydi", async () => {
    mockState.responses.rasxod_items = { data: [], error: null };
    const res = await tulovRoute.POST(req('/7/tulov', { method: 'POST', body: { tulandi: false, itemIds: [1, 2] } }), ctx({ id: '7' }));
    expect(res.status).toBe(200);
    expect((await res.json()).items).toEqual([]);
    const [patch] = mockState.calls.rasxod_items.update[0] as [Record<string, unknown>];
    expect(patch).toEqual({ tulandi: false, tulangan_vaqt: null });
    expect(mockState.afterTasks).toHaveLength(0);
  });

  it("tulandi boolean bo'lmasa yoki itemIds noto'g'ri bo'lsa 400", async () => {
    const cases = [{}, { tulandi: 'ha' }, { tulandi: true, itemIds: [] }, { tulandi: true, itemIds: ['x'] }, { tulandi: true, itemIds: 5 }];
    for (const body of cases) {
      const res = await tulovRoute.POST(req('/7/tulov', { method: 'POST', body }), ctx({ id: '7' }));
      expect(res.status).toBe(400);
    }
    expect(mockState.calls.rasxod_items).toBeUndefined();
  });
});
