import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Buyurtma tahrirlanganda fon yuklash (loadInitialData) serverdan kelgan ESKI
 * nusxa bilan yangi qiymatlarni — masalan zapchastning "Alohida" galochkasini —
 * bosib ketmasligi kerak.
 *
 * Haqiqiy hodisa: tahrirni saqlab orders sahifasiga o'tilganda loadInitialData
 * ishga tushadi, server esa hali yozishni tugatmagan bo'ladi → eski qator keladi.
 */

const OLD_ORDER = {
  id: 1, ism: 'Mijoz', mashina: 'Matiz', holat: 'tulanmagan', services: [],
  zaps: [{ id: 5, nom: 'Filtr', narx: 30000, qty: 1 }],
};
const NEW_ZAPS = [{ id: 5, nom: 'Filtr', narx: 30000, qty: 1, alohida: true }];

let serverOrders: unknown[];
let saveGate: Promise<void>;
let releaseSave: () => void;
let ordersGate: Promise<void> | null;

function gate() {
  let release!: () => void;
  const p = new Promise<void>((r) => { release = r; });
  return { p, release };
}

function mockFetch() {
  return vi.fn(async (input: unknown, init?: { method?: string }) => {
    const url = String(input);
    const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

    // Buyurtmani saqlash — darhol emas, gate ochilgach tugaydi
    if (/\/api\/orders\/\d+$/.test(url) && init?.method === 'POST') {
      await saveGate;
      return ok({ ok: true });
    }
    if (url.endsWith('/api/orders')) {
      if (ordersGate) await ordersGate;
      return ok(serverOrders);
    }
    if (url.includes('/api/kassa')) return ok({ naqd: 0, karta: 0 });
    return ok([]);
  });
}

describe('buyurtma tahriri va fon yuklash poygasi', () => {
  beforeEach(() => {
    vi.resetModules(); // modul darajasidagi holat (orderWrites, inFlight) har safar yangi
    serverOrders = [OLD_ORDER];
    ordersGate = null;
    const g = gate();
    saveGate = g.p;
    releaseSave = g.release;
    vi.stubGlobal('fetch', mockFetch());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function freshStore() {
    const mod = await import('@/store/useStore');
    mod.useStore.setState({ buyurtmalar: [OLD_ORDER as never] });
    return mod.useStore;
  }

  const alohida = (store: Awaited<ReturnType<typeof freshStore>>) =>
    (store.getState().buyurtmalar[0].zaps as Array<{ alohida?: boolean }>)[0].alohida;

  it('saqlash ketayotganda kelgan ESKI server nusxasi galochkani bosib ketmaydi', async () => {
    const store = await freshStore();

    const saving = store.getState().updateBuyurtma(1, { zaps: NEW_ZAPS as never });
    expect(alohida(store)).toBe(true); // optimistik yangilanish

    await store.getState().loadInitialData(true); // server hali ESKI nusxani qaytaradi
    expect(alohida(store)).toBe(true);

    releaseSave();
    await saving;
    expect(alohida(store)).toBe(true);
  });

  it('yuklash saqlashdan OLDIN boshlanib, undan KEYIN tugasa ham galochka saqlanadi', async () => {
    const store = await freshStore();

    const g = gate();
    ordersGate = g.p;
    const loading = store.getState().loadInitialData(true); // server javobi kechikadi

    vi.setSystemTime(Date.now() + 5);
    releaseSave(); // saqlash darhol tugaydi
    await store.getState().updateBuyurtma(1, { zaps: NEW_ZAPS as never });

    vi.setSystemTime(Date.now() + 5);
    g.release(); // endi ESKI nusxa keladi
    await loading;
    expect(alohida(store)).toBe(true);
  });

  it("saqlash tugab, keyin boshlangan yuklash esa server nusxasini oladi (boshqa qurilma o'zgarishi)", async () => {
    const store = await freshStore();

    releaseSave();
    await store.getState().updateBuyurtma(1, { zaps: NEW_ZAPS as never });
    expect(alohida(store)).toBe(true);

    // Boshqa qurilmada galochka olib tashlangan — server yangi holatni qaytaradi
    vi.setSystemTime(Date.now() + 5);
    serverOrders = [{ ...OLD_ORDER, zaps: [{ id: 5, nom: 'Filtr', narx: 30000, qty: 1, alohida: false }] }];
    await store.getState().loadInitialData(true);
    expect(alohida(store)).toBe(false);
  });

  it("mahalliy yozuv bo'lmasa — server nusxasi odatdagidek almashtiradi", async () => {
    const store = await freshStore();
    serverOrders = [{ ...OLD_ORDER, ism: 'Boshqa mijoz' }];
    await store.getState().loadInitialData(true);
    expect(store.getState().buyurtmalar[0].ism).toBe('Boshqa mijoz');
  });
});
