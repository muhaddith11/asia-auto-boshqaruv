import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { CapturedCalls, MockResponder } from '../helpers/mockSupabase';

// Narxsiz xizmat: xodim narxsiz kiritgan xizmatga ADMIN ham, BOSHLIQ ham narx
// qo'yib chek chiqara oladi. Ikkalasi bir vaqtda bossa — chek bir marta chiqadi.

const mockState = vi.hoisted(() => ({
  responses: {} as Record<string, MockResponder>,
  calls: {} as CapturedCalls,
  counters: {} as Record<string, number>,
  worker: null as null | { id: number; ism: string; is_admin: boolean; is_boss: boolean },
}));

vi.mock('@/lib/supabaseClient', async () => {
  const { createSupabaseMock } = await import('../helpers/mockSupabase');
  return { default: createSupabaseMock(mockState.responses, mockState.calls, mockState.counters) };
});
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: () => {} };
});
vi.mock('telegraf', () => ({
  Telegraf: class { telegram = { sendMessage: async () => ({ message_id: 1 }) }; },
}));
vi.mock('@/lib/messageCleanup', () => ({ cleanupExpiredMessagesThrottled: () => {} }));
vi.mock('@/lib/botWorker', () => ({ identifyWorker: async () => mockState.worker }));

const route = await import('@/app/api/bot-ui/price/route');

const pendingOrder = {
  id: 2431, mashina: 'Boshqa Swm', raqam: '40S007WM', km: 52000, bosqich: 'narx_kutilmoqda',
  status_log: [], zaps: [], qabul_xodim_id: 7, qabul_xodim_nomi: 'Anvar',
  services: [{ nom: 'Svarka', narx: 0, narxsiz: true, isCustom: true }],
};

beforeEach(() => {
  for (const obj of [mockState.responses, mockState.calls, mockState.counters]) {
    for (const key of Object.keys(obj)) delete (obj as Record<string, unknown>)[key];
  }
  // 1-so'rov — buyurtmani o'qish, 2-so'rov — shartli update().select('id')
  mockState.responses.orders = ({ index }) =>
    index === 0 ? { data: pendingOrder, error: null } : { data: [{ id: 2431 }], error: null };
  mockState.responses.workers = { data: { foiz: 20, ism: 'Anvar', tel: null, telegram: null, is_boss: false }, error: null };
  mockState.responses.services_list = { data: { id: 99 }, error: null };
});

function price() {
  const req = new NextRequest('http://localhost/api/bot-ui/price', {
    method: 'POST',
    body: JSON.stringify({ orderId: 2431, prices: [{ index: 0, narx: 300000 }], workerPhone: '+998900000002' }),
    headers: { 'Content-Type': 'application/json' },
  });
  return route.POST(req);
}

const orderUpdate = () => mockState.calls.orders?.update?.[0]?.[0] as Record<string, any> | undefined;

describe('Narxsiz xizmatga narx qo\'yish (bot)', () => {
  it('boshliq narx qo\'yib chek chiqara oladi', async () => {
    mockState.worker = { id: 2, ism: 'Yahyo aka', is_admin: false, is_boss: true };
    const res = await price();
    expect(res.status).toBe(200);
    const upd = orderUpdate();
    expect(upd?.bosqich).toBe('tayyor');
    expect(upd?.print_status).toBe('pending');
    expect(upd?.srv).toBe(300000);
    expect(upd?.status_log.at(-1).izoh).toMatch(/^Boshliq/);
  });

  it('admin ham avvalgidek narx qo\'ya oladi', async () => {
    mockState.worker = { id: 1, ism: 'admin', is_admin: true, is_boss: false };
    const res = await price();
    expect(res.status).toBe(200);
    expect(orderUpdate()?.status_log.at(-1).izoh).toMatch(/^Admin/);
  });

  it('oddiy xodim narx qo\'ya olmaydi', async () => {
    mockState.worker = { id: 7, ism: 'Anvar', is_admin: false, is_boss: false };
    const res = await price();
    expect(res.status).toBe(403);
    expect(orderUpdate()).toBeUndefined();
  });

  it('ikkinchisi kech qolsa (boshqasi allaqachon narx qo\'ygan) — 409, chek qayta chiqmaydi', async () => {
    mockState.worker = { id: 2, ism: 'Yahyo aka', is_admin: false, is_boss: true };
    // shartli update hech qatorni o'zgartirmadi — bosqich allaqachon 'tayyor'
    mockState.responses.orders = ({ index }) =>
      index === 0 ? { data: pendingOrder, error: null } : { data: [], error: null };
    const res = await price();
    expect(res.status).toBe(409);
  });
});
