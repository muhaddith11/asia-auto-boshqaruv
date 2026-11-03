import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { CapturedCalls, MockResponder } from './helpers/mockSupabase';
import { isJavon, javonTavsif, sahnaInventari, taxminTur } from '@/lib/konteyner';

// 3D konteyner ombori: javon raqami parts.javon da, 3D ga faqat qoldig'i borlar
// chiqadi, API faqat javon/javon_tur ni o'zgartiradi (qoldiq va narxga tegmaydi).

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('./helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls) };
});

const route = await import('@/app/api/parts/[id]/javon/route');

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  mockState.responses.parts = { data: { id: 5, javon: 'B2-3', javon_tur: null }, error: null };
});

function patch(id: string, body: unknown) {
  const req = new NextRequest(`http://localhost/api/parts/${id}/javon`, {
    method: 'PATCH',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  return route.PATCH(req, { params: Promise.resolve({ id }) });
}

const sentUpdate = () => mockState.calls.parts?.update?.[0]?.[0] as Record<string, unknown> | undefined;

describe('Javon raqami', () => {
  it('A/B, bo\'lim 1-6, qavat 1-5', () => {
    expect(isJavon('A1-1')).toBe(true);
    expect(isJavon('B6-5')).toBe(true);
    expect(isJavon('B7-1')).toBe(false);
    expect(isJavon('A1-6')).toBe(false);
    expect(isJavon('C1-1')).toBe(false);
    expect(isJavon('a1-1')).toBe(false);
    expect(javonTavsif('B2-3')).toBe("O'ng tomon · 2-bo'lim · 3-qavat");
  });
});

describe('Zapchast turini nomidan taxmin qilish', () => {
  it.each([
    ['Benzin filtr gentra', 'filtr'],
    ['Antifiriz', 'moy'],
    ['Oyne suv', 'moy'],
    ['Oyna kulichatir', 'kuzov'],
    ['Svecha 7411', 'elektr'],
    ['Benzin dachik', 'elektr'],
    ['Old kolodka', 'tormoz'],
    ['Akkumulyator 60', 'akkum'],
    ['Amortizator old', 'osma'],
    ['Benzin nasos spark', 'motor'],
    ['Pampers', 'boshqa'],
  ])('%s → %s', (nom, tur) => {
    expect(taxminTur(nom)).toBe(tur);
  });
});

describe('3D sahna inventari', () => {
  it('faqat javondagi va qoldig\'i bor zapchastlar; tur — saqlangani yoki taxmin', () => {
    const inv = sahnaInventari([
      { id: 1, nom: 'Moy filtri', balance: 20, javon: 'B2-3', javon_tur: null },
      { id: 2, nom: 'Havo filtri', balance: '8', javon: 'B2-3', javon_tur: 'boshqa' },
      { id: 3, nom: 'Svecha', balance: 0, javon: 'B2-3' },     // tugagan — 3D da yo'q
      { id: 4, nom: 'Generator', balance: 6, javon: null },    // javonsiz
      { id: 5, nom: 'Shina', balance: 1.5, javon: 'A1-1' },
      { id: 6, nom: 'Eski', balance: 3, javon: 'Z9-9' },       // noto'g'ri javon
    ]);
    expect(Object.keys(inv).sort()).toEqual(['A1-1', 'B2-3']);
    expect(inv['B2-3']).toEqual([
      { name: 'Havo filtri', cat: 'boshqa', qty: 8 },
      { name: 'Moy filtri', cat: 'filtr', qty: 20 },
    ]);
    expect(inv['A1-1']).toEqual([{ name: 'Shina', cat: 'shina', qty: 2 }]);
  });
});

describe('PATCH /api/parts/[id]/javon', () => {
  it('javonga qo\'yadi va faqat javon ustunini yuboradi', async () => {
    const res = await patch('5', { javon: 'B2-3', balance: 999, narx: 1 });
    expect(res.status).toBe(200);
    expect(sentUpdate()).toEqual({ javon: 'B2-3' });
    expect(await res.json()).toEqual({ id: 5, javon: 'B2-3', javon_tur: null });
  });

  it('javondan olish (null) va turini o\'zgartirish', async () => {
    const res = await patch('5', { javon: null, javon_tur: 'filtr' });
    expect(res.status).toBe(200);
    expect(sentUpdate()).toEqual({ javon: null, javon_tur: 'filtr' });
  });

  it('noto\'g\'ri javon, tur, id yoki bo\'sh so\'rov — 400, bazaga hech narsa yozilmaydi', async () => {
    expect((await patch('5', { javon: 'C1-1' })).status).toBe(400);
    expect((await patch('5', { javon_tur: 'raketa' })).status).toBe(400);
    expect((await patch('abc', { javon: 'A1-1' })).status).toBe(400);
    expect((await patch('5', { balance: 3 })).status).toBe(400);
    expect((await patch('5', '{bad')).status).toBe(400);
    expect(sentUpdate()).toBeUndefined();
  });

  it('zapchast topilmasa — 404', async () => {
    mockState.responses.parts = { data: null, error: null };
    expect((await patch('77', { javon: 'A1-1' })).status).toBe(404);
  });
});
