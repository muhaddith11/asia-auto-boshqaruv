import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { CapturedCalls, MockResponder } from '../helpers/mockSupabase';

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
  counters: {} as Record<string, number>,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('../helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls, mockState.counters) };
});

// `after()` so'rov kontekstisiz ishlamaydi — audit yozuvi bu testlarda kerak emas.
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: () => {} };
});

const route = await import('@/app/api/orders/[id]/route');

const filtr = { id: 5, nom: 'Filtr', narx: 50000, qty: 1, sebestoimost: 30000 };
const taxi = {
  id: -1, nom: 'Taxi', narx: 15000, qty: 1, bir: 'dona', kat: 'Rasxod', rasxod: true,
  xodim_nomi: 'Abdulazizxon', vaqt: '2026-09-17T06:40:00.000Z',
};
const yoqilgi = { ...taxi, id: -2, nom: 'Benzin', narx: 100000 };

const orderRow = {
  id: 2163, ism: 'Kunlik Mijoz', mashina: 'Chevrolet Equinox 2', raqam: '01S007AB',
  qabul_xodim_nomi: 'Anvar', created_at: '2026-09-17T05:00:00+00:00', holat: 'tulanmagan',
};

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls, mockState.counters]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  // kassada 1 000 000 naqd, 500 000 karta
  mockState.responses.kassa = { data: { naqd: 1_000_000, karta: 500_000 }, error: null };
});

// PATCH: birinchi `orders` so'rovi — eski holatni o'qish, ikkinchisi — update().select().
function setupPatch(prev: { zaps: unknown[]; holat: string }, after: Record<string, unknown> = {}) {
  mockState.responses.orders = ({ index }) =>
    index === 0
      ? { data: { zaps: prev.zaps, holat: prev.holat }, error: null }
      : { data: [{ ...orderRow, holat: prev.holat, ...after }], error: null };
}

async function patch(body: unknown) {
  const req = new NextRequest('http://localhost/api/orders/2163', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  return route.PATCH(req, { params: Promise.resolve({ id: '2163' }) });
}

const kassaUpserts = () => (mockState.calls.kassa?.upsert ?? []) as Array<[{ naqd: number; karta: number }]>;
const opsInserts = () => (mockState.calls.operations?.insert ?? []) as Array<[Array<Record<string, unknown>>]>;
type ArchiveRow = Record<string, unknown> & { zap: Record<string, unknown> };
const archiveInserts = () => (mockState.calls.zap_archive?.insert ?? []) as Array<[ArchiveRow[]]>;

describe('PATCH /api/orders/[id] — rasxod qatori o\'chirilganda kassaga qaytarish', () => {
  it('rasxod olib tashlansa summa naqd kassaga qaytadi va KIRIM yoziladi', async () => {
    setupPatch({ zaps: [filtr, taxi], holat: 'tulanmagan' });
    const res = await patch({ zaps: [filtr], holat: 'tulanmagan' });
    expect(res.status).toBe(200);

    expect(kassaUpserts()).toHaveLength(1);
    expect(kassaUpserts()[0][0]).toMatchObject({ id: 1, naqd: 1_015_000, karta: 500_000 });

    expect(opsInserts()).toHaveLength(1);
    expect(opsInserts()[0][0][0]).toMatchObject({ type: 'income', method: 'naqd', amount: 15000, source: 'tizim' });
    expect(String(opsInserts()[0][0][0].comment)).toContain('Taxi');
    expect(String(opsInserts()[0][0][0].comment)).toContain('#2163');
  });

  it('bir nechta rasxod olib tashlansa — jami summa bir marta qaytadi', async () => {
    setupPatch({ zaps: [taxi, yoqilgi, filtr], holat: 'tulanmagan' });
    await patch({ zaps: [filtr] });
    expect(kassaUpserts()).toHaveLength(1);
    expect(kassaUpserts()[0][0].naqd).toBe(1_115_000);
  });

  it('oddiy zapchast olib tashlansa kassaga tegilmaydi', async () => {
    setupPatch({ zaps: [filtr, taxi], holat: 'tulanmagan' });
    await patch({ zaps: [taxi] });
    expect(kassaUpserts()).toHaveLength(0);
    expect(opsInserts()).toHaveLength(0);
  });

  it('rasxod joyida qolsa (faqat "alohida"/miqdor o\'zgardi) — kassaga tegilmaydi', async () => {
    setupPatch({ zaps: [filtr, taxi], holat: 'tulanmagan' });
    await patch({ zaps: [{ ...filtr, alohida: true, qty: 2 }, { ...taxi, vaqt: undefined }] });
    expect(kassaUpserts()).toHaveLength(0);
    expect(archiveInserts()).toHaveLength(0);
  });

  it('shu saqlashning o\'zida bekor qilinsa — pul FAQAT BIR MARTA qaytadi (butun eski rasxod, ikki marta emas)', async () => {
    setupPatch({ zaps: [taxi, yoqilgi], holat: 'tulanmagan' }, { holat: 'bekor qilingan' });
    await patch({ zaps: [yoqilgi], holat: 'bekor qilingan' });
    expect(kassaUpserts()).toHaveLength(1);
    // Bekor qilish yo'li eski ro'yxatdagi BARCHA rasxodni (15 000 + 100 000) qaytaradi.
    expect(kassaUpserts()[0][0].naqd).toBe(1_115_000);
    expect(opsInserts()).toHaveLength(1);
  });

  it('allaqachon bekor qilingan buyurtmadan rasxod olib tashlansa — qayta qaytarilmaydi (bekor qilishda qaytgan)', async () => {
    setupPatch({ zaps: [taxi], holat: 'bekor qilingan' }, { holat: 'bekor qilingan' });
    await patch({ zaps: [], holat: 'bekor qilingan' });
    expect(kassaUpserts()).toHaveLength(0);
    expect(opsInserts()).toHaveLength(0);
  });

  it('kassa yozilmasa (xatolik) saqlash baribir muvaffaqiyatli, arxiv esa yoziladi', async () => {
    setupPatch({ zaps: [taxi], holat: 'tulanmagan' });
    // kassa: o'qish ishlaydi, upsert xato beradi
    mockState.responses.kassa = { data: { naqd: 1_000_000, karta: 0 }, error: { message: 'kassa down' } };
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await patch({ zaps: [] });
    errSpy.mockRestore();
    expect(res.status).toBe(200);
    expect(opsInserts()).toHaveLength(0);
    expect(archiveInserts()).toHaveLength(1);
  });
});

describe('PATCH /api/orders/[id] — olib tashlangan qatorlar arxivga yoziladi', () => {
  it('o\'chirilgan zapchast buyurtma nusxasi va sana bilan arxivlanadi', async () => {
    setupPatch({ zaps: [filtr, taxi], holat: 'tulanmagan' });
    await patch({ zaps: [taxi] });

    expect(archiveInserts()).toHaveLength(1);
    const rows = archiveInserts()[0][0];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      order_id: 2163, mashina: 'Chevrolet Equinox 2', raqam: '01S007AB', ism: 'Kunlik Mijoz',
      xodim: 'Anvar', order_holat: 'tulanmagan', sabab: 'tahrirlandi',
      sana: '2026-09-17T05:00:00.000Z', // zapchastda vaqt yo'q → buyurtma yaratilgan vaqt
    });
    expect(rows[0].zap).toMatchObject({ id: 5, nom: 'Filtr', narx: 50000 });
  });

  it('o\'chirilgan rasxod o\'z vaqti va kiritgan xodimi bilan arxivlanadi', async () => {
    setupPatch({ zaps: [filtr, taxi], holat: 'tulanmagan' });
    await patch({ zaps: [filtr] });
    const [row] = archiveInserts()[0][0];
    expect(row).toMatchObject({ xodim: 'Abdulazizxon', sana: '2026-09-17T06:40:00.000Z', sabab: 'tahrirlandi' });
  });

  it('bekor qilinsa ham qatorlar buyurtmada qoladi — hech narsa arxivlanmaydi', async () => {
    setupPatch({ zaps: [filtr, taxi], holat: 'tulanmagan' }, { holat: 'bekor qilingan' });
    await patch({ zaps: [filtr, taxi], holat: 'bekor qilingan' });
    expect(archiveInserts()).toHaveLength(0);
  });

  it('zaps yuborilmasa (masalan faqat holat o\'zgarsa) — arxiv va kassaga tegilmaydi', async () => {
    setupPatch({ zaps: [filtr, taxi], holat: 'tulanmagan' });
    await patch({ holat: 'tulangan' });
    expect(archiveInserts()).toHaveLength(0);
    expect(kassaUpserts()).toHaveLength(0);
  });

  it('arxivga yozib bo\'lmasa ham buyurtma saqlanadi (asosiy amal bloklanmaydi)', async () => {
    setupPatch({ zaps: [filtr], holat: 'tulanmagan' });
    mockState.responses.zap_archive = { data: null, error: { message: 'relation "zap_archive" does not exist' } };
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await patch({ zaps: [] });
    expect(res.status).toBe(200);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});

describe('DELETE /api/orders/[id] — buyurtma o\'chirilganda zapchastlar arxivlanadi', () => {
  async function del() {
    const req = new NextRequest('http://localhost/api/orders/2163', { method: 'DELETE' });
    return route.DELETE(req, { params: Promise.resolve({ id: '2163' }) });
  }

  it('barcha zapchast va rasxod qatorlari "buyurtma_ochirildi" sababi bilan arxivlanadi', async () => {
    mockState.responses.orders = { data: [{ ...orderRow, zaps: [filtr, taxi] }], error: null };
    const res = await del();
    expect(res.status).toBe(200);

    const rows = archiveInserts()[0][0];
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.sabab === 'buyurtma_ochirildi' && r.order_id === 2163)).toBe(true);
    expect(rows.map((r) => r.zap.nom)).toEqual(['Filtr', 'Taxi']);
  });

  it('zapchasti yo\'q buyurtma o\'chirilsa — arxivga hech narsa yozilmaydi', async () => {
    mockState.responses.orders = { data: [{ ...orderRow, zaps: [] }], error: null };
    await del();
    expect(archiveInserts()).toHaveLength(0);
  });
});
