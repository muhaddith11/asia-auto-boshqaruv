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
  return { default: createSupabaseMock(mockState.responses, mockState.calls, mockState.counters, ['is', 'not']) };
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
const itemTulovRoute = await import('@/app/api/rasxod-daftar/[id]/items/[itemId]/tulov/route');
const ishxonaRoute = await import('@/app/api/rasxod-daftar/[id]/items/[itemId]/ishxona/route');

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
  id, car_id: 7, nom: 'Zds', summa: '1200000', sana: '2026-09-03', tulandi: false, tulangan_summa: 0, tulangan_vaqt: null, created_at: '2026-09-03T08:00:00Z', ...extra,
});

describe('/api/rasxod-daftar — kirish huquqi', () => {
  it("sessiyasiz 401, xodim uchun 403 (hisobotlar bo'limi yopiq)", async () => {
    expect((await listRoute.GET(req('', { role: null }))).status).toBe(401);
    expect((await listRoute.GET(req('', { role: 'xodim' }))).status).toBe(403);
    expect((await tulovRoute.POST(req('/7/tulov', { method: 'POST', body: { tulandi: true }, role: 'xodim' }), ctx({ id: '7' }))).status).toBe(403);
    expect((await itemTulovRoute.POST(req('/7/items/1/tulov', { method: 'POST', body: { summa: 1 }, role: 'xodim' }), ctx({ id: '7', itemId: '1' }))).status).toBe(403);
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

describe('POST/DELETE /api/rasxod-daftar/[id]/items/[itemId]/tulov (qisman to\'lov)', () => {
  it("qisman to'lov qo'shadi, qoldiqqa yetmasa tulandi=false qoladi", async () => {
    mockState.responses.rasxod_items = (c) =>
      c.index === 0
        ? { data: [itemRow(1, { summa: 1_000_000, tulangan_summa: 0 })], error: null }
        : { data: [itemRow(1, { summa: 1_000_000, tulangan_summa: 500_000, tulangan_vaqt: '2026-09-16T10:00:00Z' })], error: null };
    const res = await itemTulovRoute.POST(
      req('/7/items/1/tulov', { method: 'POST', body: { summa: 500000 } }), ctx({ id: '7', itemId: '1' }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).item).toMatchObject({ id: 1, tulandi: false, tulangan_summa: 500_000 });
    const [patch] = mockState.calls.rasxod_items.update[0] as [Record<string, unknown>];
    expect(patch.tulangan_summa).toBe(500_000);
    expect(patch.tulandi).toBe(false);
    expect(mockState.afterTasks).toHaveLength(1);
  });

  it("qoldiqni to'ldirsa avtomatik tulandi=true bo'ladi", async () => {
    mockState.responses.rasxod_items = (c) =>
      c.index === 0
        ? { data: [itemRow(1, { summa: 1_000_000, tulangan_summa: 700_000 })], error: null }
        : { data: [itemRow(1, { summa: 1_000_000, tulangan_summa: 1_000_000, tulandi: true, tulangan_vaqt: '2026-09-16T10:00:00Z' })], error: null };
    const res = await itemTulovRoute.POST(
      req('/7/items/1/tulov', { method: 'POST', body: { summa: 300000 } }), ctx({ id: '7', itemId: '1' }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).item).toMatchObject({ tulandi: true, tulangan_summa: 1_000_000 });
    const [patch] = mockState.calls.rasxod_items.update[0] as [Record<string, unknown>];
    expect(patch.tulandi).toBe(true);
  });

  it("qoldiqdan katta summa yoki allaqachon to'liq to'langan bo'lsa 400, topilmasa 404", async () => {
    mockState.responses.rasxod_items = { data: [itemRow(1, { summa: 1_000_000, tulangan_summa: 800_000 })], error: null };
    const tooMuch = await itemTulovRoute.POST(
      req('/7/items/1/tulov', { method: 'POST', body: { summa: 300000 } }), ctx({ id: '7', itemId: '1' }),
    );
    expect(tooMuch.status).toBe(400);

    mockState.responses.rasxod_items = { data: [itemRow(1, { tulandi: true })], error: null };
    const alreadyPaid = await itemTulovRoute.POST(
      req('/7/items/1/tulov', { method: 'POST', body: { summa: 1 } }), ctx({ id: '7', itemId: '1' }),
    );
    expect(alreadyPaid.status).toBe(400);

    mockState.responses.rasxod_items = { data: [], error: null };
    const notFound = await itemTulovRoute.POST(
      req('/7/items/1/tulov', { method: 'POST', body: { summa: 1 } }), ctx({ id: '7', itemId: '1' }),
    );
    expect(notFound.status).toBe(404);

    const badSumma = await itemTulovRoute.POST(
      req('/7/items/1/tulov', { method: 'POST', body: { summa: 0 } }), ctx({ id: '7', itemId: '1' }),
    );
    expect(badSumma.status).toBe(400);
  });

  it("DELETE — qisman to'lovni bekor qiladi (tulangan_summa=0, tulangan_vaqt=null)", async () => {
    mockState.responses.rasxod_items = { data: [itemRow(1, { tulangan_summa: 0, tulangan_vaqt: null })], error: null };
    const res = await itemTulovRoute.DELETE(req('/7/items/1/tulov', { method: 'DELETE' }), ctx({ id: '7', itemId: '1' }));
    expect(res.status).toBe(200);
    const [patch] = mockState.calls.rasxod_items.update[0] as [Record<string, unknown>];
    expect(patch).toEqual({ tulangan_summa: 0, tulangan_vaqt: null });

    mockState.responses.rasxod_items = { data: [], error: null };
    const notFound = await itemTulovRoute.DELETE(req('/7/items/1/tulov', { method: 'DELETE' }), ctx({ id: '7', itemId: '1' }));
    expect(notFound.status).toBe(404);
  });
});

// ── «Ishxonaga»: rasxod qoldig'i 'Ishxona' chiqimi bo'lib naqd kassadan ayiriladi ──

const LOCKED_MSG = /ishxonaga yozilgan/i;
const ishxonaCtx = ctx({ id: '7', itemId: '1' });
const ishxonaReq = (method: 'POST' | 'DELETE', role: 'boshliq' | 'xodim' = 'boshliq') =>
  req('/7/items/1/ishxona', { method, role });

// Kassa: 0 — o'qish (naqd/karta), 1 — upsert.
const kassaResponder = (naqd: number, karta: number, upsertError?: string) => (c: { index: number }) =>
  c.index === 0
    ? { data: { naqd, karta }, error: null }
    : { data: null, error: upsertError ? { message: upsertError } : null };

describe('POST /api/rasxod-daftar/[id]/items/[itemId]/ishxona', () => {
  it("qoldiqni 'Ishxona' chiqimi qilib yozadi, qatorni band qiladi va naqd kassadan ayiradi", async () => {
    mockState.responses.rasxod_items = (c) =>
      c.index === 0
        ? { data: [itemRow(1, { summa: 1_000_000, tulangan_summa: 400_000 })], error: null }
        : { data: [itemRow(1, { summa: 1_000_000, tulangan_summa: 400_000, ishxona_op_id: 55, ishxona_vaqt: '2026-11-04T10:00:00Z' })], error: null };
    mockState.responses.rasxod_cars = { data: [{ mashina: 'Zeekr 001', raqam: '601111111' }], error: null };
    mockState.responses.operations = { data: { id: 55, amount: 600_000 }, error: null };
    mockState.responses.kassa = kassaResponder(10_000_000, 2_000_000);

    const res = await ishxonaRoute.POST(ishxonaReq('POST'), ishxonaCtx);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ amount: 600_000, item: { id: 1, ishxona_op_id: 55, tulandi: false } });

    const [[op]] = mockState.calls.operations.insert[0] as [Record<string, unknown>[]];
    expect(op).toEqual({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      type: 'expense',
      method: 'naqd',
      amount: 600_000,
      category: 'Ishxona',
      comment: 'Rasxod daftari: Zds — Zeekr 001 601111111',
      source: 'manual',
    });
    const [claim] = mockState.calls.rasxod_items.update[0] as [Record<string, unknown>];
    expect(claim).toMatchObject({ ishxona_op_id: 55 });
    expect(Number.isNaN(Date.parse(String(claim.ishxona_vaqt)))).toBe(false);
    // Band qilish shartli: hali hech kim ishxonaga yozmagan qatorgina
    expect(mockState.calls.rasxod_items.is).toContainEqual(['ishxona_op_id', null]);

    const [kassa] = mockState.calls.kassa.upsert[0] as [Record<string, unknown>];
    expect(kassa).toMatchObject({ id: 1, naqd: 9_400_000, karta: 2_000_000 });

    await Promise.all(mockState.afterTasks.map((task) => task()));
    const [auditRows] = mockState.calls.audit_log.insert[0] as [Record<string, unknown>[]];
    expect(auditRows[0]).toMatchObject({ action: 'create', entity: 'operation', entity_id: '55' });
  });

  it("qatorni band qilib bo'lmasa (parallel bosilgan / to'langan) — chiqim o'chiriladi, kassaga tegilmaydi, 400", async () => {
    mockState.responses.rasxod_items = (c) =>
      c.index === 0 ? { data: [itemRow(1, { summa: 500_000 })], error: null } : { data: [], error: null };
    mockState.responses.rasxod_cars = { data: [carRow], error: null };
    const opCalls: number[] = [];
    mockState.responses.operations = (c) => {
      opCalls.push(c.index);
      return { data: { id: 56 }, error: null };
    };

    const res = await ishxonaRoute.POST(ishxonaReq('POST'), ishxonaCtx);
    expect(res.status).toBe(400);
    expect(opCalls).toEqual([0, 1]); // 0 — insert, 1 — kompensatsiya uchun delete
    expect(mockState.counters.kassa).toBeUndefined();
    expect(mockState.afterTasks).toHaveLength(0);
  });

  it("kassa yangilanmasa — chiqim o'chiriladi, qator ochiladi va 500 qaytadi", async () => {
    mockState.responses.rasxod_items = (c) =>
      c.index === 0 ? { data: [itemRow(1, { summa: 500_000 })], error: null } : { data: [itemRow(1, { ishxona_op_id: 57 })], error: null };
    mockState.responses.rasxod_cars = { data: [carRow], error: null };
    const opCalls: number[] = [];
    mockState.responses.operations = (c) => {
      opCalls.push(c.index);
      return { data: { id: 57 }, error: null };
    };
    mockState.responses.kassa = kassaResponder(1_000_000, 0, 'kassa yozilmadi');

    const res = await ishxonaRoute.POST(ishxonaReq('POST'), ishxonaCtx);
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/Kassa yangilanmadi/);
    expect(opCalls).toEqual([0, 1]);
    expect(mockState.calls.rasxod_items.update[1]).toEqual([{ ishxona_vaqt: null }]);
    expect(mockState.afterTasks).toHaveLength(0);
  });

  it("to'langan, allaqachon ishxonaga yozilgan yoki qoldig'i yo'q qatorni rad etadi (400); topilmasa 404", async () => {
    const cases = [
      itemRow(1, { tulandi: true }),
      itemRow(1, { ishxona_op_id: 3 }),
      itemRow(1, { summa: 1000, tulangan_summa: 1000 }),
    ];
    for (const row of cases) {
      mockState.responses.rasxod_items = { data: [row], error: null };
      expect((await ishxonaRoute.POST(ishxonaReq('POST'), ishxonaCtx)).status).toBe(400);
    }
    mockState.responses.rasxod_items = { data: [], error: null };
    expect((await ishxonaRoute.POST(ishxonaReq('POST'), ishxonaCtx)).status).toBe(404);
    expect(mockState.calls.operations).toBeUndefined();
    expect(mockState.counters.kassa).toBeUndefined();
  });

  it("xodim uchun 403, noto'g'ri ID — 400 (bazaga so'rov ketmaydi)", async () => {
    expect((await ishxonaRoute.POST(ishxonaReq('POST', 'xodim'), ishxonaCtx)).status).toBe(403);
    expect((await ishxonaRoute.DELETE(ishxonaReq('DELETE', 'xodim'), ishxonaCtx)).status).toBe(403);
    expect((await ishxonaRoute.POST(req('/7/items/x/ishxona', { method: 'POST' }), ctx({ id: '7', itemId: 'x' }))).status).toBe(400);
    expect(mockState.counters.rasxod_items).toBeUndefined();
  });
});

describe('DELETE /api/rasxod-daftar/[id]/items/[itemId]/ishxona (qaytarish)', () => {
  it("chiqimni o'chiradi, qatorni ochadi va pulni naqd kassaga qaytaradi", async () => {
    mockState.responses.rasxod_items = (c) =>
      c.index === 0
        ? { data: [itemRow(1, { summa: 1_000_000, tulangan_summa: 400_000, ishxona_op_id: 55, ishxona_vaqt: '2026-11-04T10:00:00Z' })], error: null }
        : { data: [itemRow(1, { summa: 1_000_000, tulangan_summa: 400_000 })], error: null };
    mockState.responses.operations = { data: [{ id: 55, amount: 600_000 }], error: null };
    mockState.responses.kassa = kassaResponder(9_400_000, 2_000_000);

    const res = await ishxonaRoute.DELETE(ishxonaReq('DELETE'), ishxonaCtx);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ amount: 600_000, item: { id: 1, ishxona_op_id: null, ishxona_vaqt: null } });
    expect(mockState.calls.rasxod_items.update[0]).toEqual([{ ishxona_op_id: null, ishxona_vaqt: null }]);
    const [kassa] = mockState.calls.kassa.upsert[0] as [Record<string, unknown>];
    expect(kassa).toMatchObject({ id: 1, naqd: 10_000_000, karta: 2_000_000 });

    await Promise.all(mockState.afterTasks.map((task) => task()));
    const [auditRows] = mockState.calls.audit_log.insert[0] as [Record<string, unknown>[]];
    expect(auditRows[0]).toMatchObject({ action: 'delete', entity: 'operation', entity_id: '55' });
  });

  it("chiqim boshqa joydan allaqachon o'chirilgan bo'lsa — qator ochiladi, kassaga tegilmaydi", async () => {
    mockState.responses.rasxod_items = (c) =>
      c.index === 0 ? { data: [itemRow(1, { ishxona_op_id: 55 })], error: null } : { data: [itemRow(1)], error: null };
    mockState.responses.operations = { data: [], error: null };

    const res = await ishxonaRoute.DELETE(ishxonaReq('DELETE'), ishxonaCtx);
    expect(res.status).toBe(200);
    expect((await res.json()).amount).toBe(0);
    expect(mockState.counters.kassa).toBeUndefined();
  });

  it("ishxonaga yozilmagan qatorni qaytarib bo'lmaydi (400), chiqimga tegilmaydi", async () => {
    mockState.responses.rasxod_items = { data: [itemRow(1)], error: null };
    expect((await ishxonaRoute.DELETE(ishxonaReq('DELETE'), ishxonaCtx)).status).toBe(400);
    expect(mockState.counters.operations).toBeUndefined();
  });
});

describe('Ishxonaga yozilgan qator himoyasi (boshqa amallar)', () => {
  it("«Hammasi to'landi» ishxonaga yozilgan qatorni o'tkazib yuboradi; qaytarishda filtr yo'q", async () => {
    mockState.responses.rasxod_items = { data: [], error: null };
    await tulovRoute.POST(req('/7/tulov', { method: 'POST', body: { tulandi: true } }), ctx({ id: '7' }));
    expect(mockState.calls.rasxod_items.is).toEqual([['ishxona_op_id', null]]);

    delete mockState.calls.rasxod_items;
    await tulovRoute.POST(req('/7/tulov', { method: 'POST', body: { tulandi: false } }), ctx({ id: '7' }));
    expect(mockState.calls.rasxod_items.is).toBeUndefined();
  });

  it("ishxonaga yozilgan qatorni o'chirish yoki summasini o'zgartirish — 400 (tushunarli xabar bilan)", async () => {
    const locked = (c: { index: number }) =>
      c.index === 0 ? { data: [], error: null } : { data: [itemRow(1, { ishxona_op_id: 55 })], error: null };

    mockState.responses.rasxod_items = locked;
    const del = await itemRoute.DELETE(req('/7/items/1', { method: 'DELETE' }), ctx({ id: '7', itemId: '1' }));
    expect(del.status).toBe(400);
    expect((await del.json()).error).toMatch(LOCKED_MSG);
    expect(mockState.calls.rasxod_items.is).toContainEqual(['ishxona_op_id', null]);

    delete mockState.counters.rasxod_items;
    const patch = await itemRoute.PATCH(req('/7/items/1', { method: 'PATCH', body: { summa: 5000 } }), ctx({ id: '7', itemId: '1' }));
    expect(patch.status).toBe(400);
    expect((await patch.json()).error).toMatch(LOCKED_MSG);
  });

  it("nomini o'zgartirish ishxonaga yozilgan qatorda ham mumkin (filtr qo'shilmaydi)", async () => {
    mockState.responses.rasxod_items = { data: [itemRow(1, { nom: 'Yangi nom', ishxona_op_id: 55 })], error: null };
    const res = await itemRoute.PATCH(req('/7/items/1', { method: 'PATCH', body: { nom: 'Yangi nom' } }), ctx({ id: '7', itemId: '1' }));
    expect(res.status).toBe(200);
    expect(mockState.calls.rasxod_items.is).toBeUndefined();
  });

  it("ishxonaga yozilgan qatori bor mashinani o'chirib bo'lmaydi (400), mashinaga tegilmaydi", async () => {
    mockState.responses.rasxod_items = { data: [{ id: 1 }], error: null };
    const res = await carRoute.DELETE(req('/7', { method: 'DELETE' }), ctx({ id: '7' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(LOCKED_MSG);
    expect(mockState.calls.rasxod_items.not).toEqual([['ishxona_op_id', 'is', null]]);
    expect(mockState.counters.rasxod_cars).toBeUndefined();
  });

  it("ishxonaga yozilgan qatorga qisman to'lov qo'shib bo'lmaydi (400), bekor qilish filtr bilan", async () => {
    mockState.responses.rasxod_items = { data: [itemRow(1, { ishxona_op_id: 55 })], error: null };
    const add = await itemTulovRoute.POST(
      req('/7/items/1/tulov', { method: 'POST', body: { summa: 1000 } }), ctx({ id: '7', itemId: '1' }),
    );
    expect(add.status).toBe(400);
    expect(mockState.calls.rasxod_items?.update).toBeUndefined();

    mockState.responses.rasxod_items = { data: [], error: null };
    const reset = await itemTulovRoute.DELETE(req('/7/items/1/tulov', { method: 'DELETE' }), ctx({ id: '7', itemId: '1' }));
    expect(reset.status).toBe(404);
    expect(mockState.calls.rasxod_items.is).toEqual([['ishxona_op_id', null]]);
  });
});
