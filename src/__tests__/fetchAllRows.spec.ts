import { describe, it, expect } from 'vitest';
import { fetchAllRows, PAGE_SIZE, type ChunkResult } from '@/lib/fetchAllRows';

/**
 * fetchAllRows — Supabase 1000 qatorlik chegarasini bo'laklab aylanib o'tadi.
 * Bu yerda haqiqiy Supabase o'rniga soxta jadval ishlatiladi, shunda
 * bo'laklash mantiqini chegaraviy holatlar bilan tekshirsa bo'ladi.
 */

/** n ta qatorli soxta jadval. Har bir chaqiruv qайд etiladi. */
function fakeTable(totalRows: number, opts: { countNull?: boolean; failAt?: number } = {}) {
  const all = Array.from({ length: totalRows }, (_, i) => ({ id: i }));
  const calls: Array<{ from: number; to: number; withCount: boolean }> = [];
  let liveCalls = 0;
  let maxConcurrent = 0;

  const query = async (from: number, to: number, withCount: boolean): Promise<ChunkResult<{ id: number }>> => {
    // Indeksni chaqiruv PAYTIDA olamiz: bo'laklar parallel ketgani uchun
    // hammasi navbatga qo'yilib bo'lgach yechiladi.
    const callIndex = calls.length;
    calls.push({ from, to, withCount });
    liveCalls++;
    maxConcurrent = Math.max(maxConcurrent, liveCalls);
    // Bir tick kutamiz — parallel yuborilganini shu orqali o'lchaymiz.
    await new Promise((r) => setTimeout(r, 5));
    liveCalls--;

    if (opts.failAt !== undefined && callIndex === opts.failAt) {
      return { data: null, error: { message: 'baza xatosi' } };
    }
    return {
      data: all.slice(from, to + 1),
      error: null,
      count: withCount ? (opts.countNull ? null : totalRows) : undefined,
    };
  };

  return { query, calls, get maxConcurrent() { return maxConcurrent; } };
}

describe('fetchAllRows', () => {
  it('bitta to\'lmagan bo\'lak — faqat bitta so\'rov yuboradi', async () => {
    const t = fakeTable(42);
    const rows = await fetchAllRows(t.query);
    expect(rows).toHaveLength(42);
    expect(t.calls).toHaveLength(1);
    expect(t.calls[0]).toEqual({ from: 0, to: PAGE_SIZE - 1, withCount: true });
  });

  it('bo\'sh jadval — bo\'sh massiv', async () => {
    const t = fakeTable(0);
    expect(await fetchAllRows(t.query)).toEqual([]);
    expect(t.calls).toHaveLength(1);
  });

  it('bir nechta bo\'lak — hamma qatorlar, tartib buzilmaydi', async () => {
    const t = fakeTable(4164); // services_list dagi haqiqiy hajm
    const rows = await fetchAllRows(t.query);

    expect(rows).toHaveLength(4164);
    // Tartib: 0,1,2,...,4163 — bo'laklar to'g'ri joyda birlashgan
    expect(rows.map((r) => r.id)).toEqual(Array.from({ length: 4164 }, (_, i) => i));
    expect(t.calls).toHaveLength(5);
  });

  it('qolgan bo\'laklarni PARALLEL so\'raydi', async () => {
    const t = fakeTable(4164);
    await fetchAllRows(t.query);
    // 1-so'rov yolg'iz (count uchun), qolgan 4 tasi bir vaqtda
    expect(t.maxConcurrent).toBe(4);
  });

  it('count faqat birinchi so\'rovda so\'raladi', async () => {
    const t = fakeTable(2500);
    await fetchAllRows(t.query);
    expect(t.calls.map((c) => c.withCount)).toEqual([true, false, false]);
  });

  it('qatorlar soni PAGE_SIZE ga karrali bo\'lganda ortiqcha qator qo\'shmaydi', async () => {
    const t = fakeTable(PAGE_SIZE * 2);
    const rows = await fetchAllRows(t.query);
    expect(rows).toHaveLength(PAGE_SIZE * 2);
    expect(t.calls).toHaveLength(2);
  });

  it('aynan PAGE_SIZE ta qator — ikkinchi so\'rov bo\'sh qaytadi, natija to\'g\'ri', async () => {
    const t = fakeTable(PAGE_SIZE);
    const rows = await fetchAllRows(t.query);
    expect(rows).toHaveLength(PAGE_SIZE);
  });

  it('birinchi so\'rov xatosi tashlanadi', async () => {
    const t = fakeTable(5000, { failAt: 0 });
    await expect(fetchAllRows(t.query)).rejects.toThrow('baza xatosi');
  });

  it('keyingi bo\'lak xatosi ham tashlanadi (jim yutilmaydi)', async () => {
    const t = fakeTable(5000, { failAt: 2 });
    await expect(fetchAllRows(t.query)).rejects.toThrow('baza xatosi');
  });

  it('count null bo\'lsa — ketma-ket zaxira yo\'lga o\'tadi va hammasini oladi', async () => {
    const t = fakeTable(2500, { countNull: true });
    const rows = await fetchAllRows(t.query);
    expect(rows).toHaveLength(2500);
    expect(t.maxConcurrent).toBe(1); // ketma-ket
  });

  it('maxPages chegarasi hurmat qilinadi', async () => {
    const t = fakeTable(10_000);
    const rows = await fetchAllRows(t.query, 3);
    expect(t.calls).toHaveLength(3);
    expect(rows).toHaveLength(3 * PAGE_SIZE);
  });
});
