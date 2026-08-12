import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * loadInitialData takrorlanmasligini tekshiradi.
 *
 * Sabab: DataLoader (root layout) va ayrim sahifalar (orders, orders/new,
 * orders/edit, backup) mount bo'lganda ikkalasi ham loadInitialData chaqiradi.
 * Ilgari bu bir xil ~2.5 MB ma'lumotni ikki marta yuklardi.
 */

// Har bir /api/* so'rovini sanaymiz.
let calls: string[] = [];

function mockFetch() {
  return vi.fn(async (input: any) => {
    const url = String(input);
    calls.push(url);
    // kassa — obyekt, qolganlari massiv kutiladi
    const body = url.includes('/api/kassa') ? { naqd: 0, karta: 0 } : [];
    return {
      ok: true,
      status: 200,
      json: async () => body,
    } as any;
  });
}

describe('loadInitialData — takroriy yuklashdan himoya', () => {
  beforeEach(async () => {
    vi.resetModules();
    calls = [];
    vi.stubGlobal('fetch', mockFetch());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function freshStore() {
    // Modul darajasidagi inFlight/lastLoadedAt holati test'lar orasida
    // qayta tiklanishi uchun store'ni har safar yangidan import qilamiz.
    const mod = await import('@/store/useStore');
    return mod.useStore;
  }

  it('ketma-ket ikki chaqiruv faqat bitta so\'rovlar to\'plamini yuboradi', async () => {
    const store = await freshStore();
    const [a, b] = [store.getState().loadInitialData(), store.getState().loadInitialData()];
    await Promise.all([a, b]);

    // loadInitialData 10 ta endpointga boradi
    expect(calls.length).toBe(10);
  });

  it('yaqinda yuklangan bo\'lsa, keyingi chaqiruv o\'tkazib yuboriladi', async () => {
    const store = await freshStore();
    await store.getState().loadInitialData();
    expect(calls.length).toBe(10);

    await store.getState().loadInitialData();
    expect(calls.length).toBe(10); // yangi so'rov yo'q
  });

  it('force=true keshni chetlab o\'tadi', async () => {
    const store = await freshStore();
    await store.getState().loadInitialData();
    expect(calls.length).toBe(10);

    await store.getState().loadInitialData(true);
    expect(calls.length).toBe(20); // majburan qayta yuklandi
  });

  it('kesh muddati tugagach qayta yuklaydi', async () => {
    const store = await freshStore();
    await store.getState().loadInitialData();
    expect(calls.length).toBe(10);

    // FRESH_MS = 10s
    vi.setSystemTime(Date.now() + 11_000);
    await store.getState().loadInitialData();
    expect(calls.length).toBe(20);
  });
});
