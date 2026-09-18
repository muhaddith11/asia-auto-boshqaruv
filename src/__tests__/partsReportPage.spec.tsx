import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import type { ArchivedZap } from '@/lib/zapArchive';

// Zapchastlar hisoboti (/parts/reports): buyurtmadagi joriy zapchastlar + buyurtmadan
// olib tashlangan (arxivdagi) qatorlar. Asosiy talab — olib tashlangan qator hisobotdan
// YO'QOLMASLIGI va "olib tashlangan" deb aniq belgilanishi.

const mockState = vi.hoisted(() => ({
  buyurtmalar: [] as unknown[],
  archive: { rows: [] as unknown[], fail: false },
}));

vi.mock('@/store/useStore', () => ({
  useStore: () => ({ zapchastlar: [], buyurtmalar: mockState.buyurtmalar, mashinalar: [] }),
}));

vi.mock('@/lib/zapArchiveClient', () => ({
  fetchZapArchive: () =>
    mockState.archive.fail
      ? Promise.reject(new Error('arxiv yuklanmadi'))
      : Promise.resolve(mockState.archive.rows),
}));

const { default: PartReportsPage } = await import('@/app/(dashboard)/parts/reports/page');

function liveOrder(over: Record<string, unknown> = {}) {
  return {
    id: 2188, mashina: 'Kia Sonet', raqam: '40H303NB', ism: 'Kunlik Mijoz', holat: 'tulangan',
    qabul_xodim_nomi: 'Anvar', createdAt: '2026-09-18T13:45:00.000Z',
    zaps: [{ id: 7, nom: 'Pampers', narx: 65000, qty: 1, vaqt: '2026-09-18T13:45:00.000Z' }],
    ...over,
  };
}

function archived(over: Partial<ArchivedZap> = {}): ArchivedZap {
  return {
    id: 1, order_id: 2178, zap: { id: 9, nom: 'Mushtik', narx: 140000, qty: 1 },
    mashina: 'Chevrolet Malibu 2', raqam: '40 A 001 EB', ism: 'Kunlik Mijoz', xodim: 'Yahyo aka',
    order_holat: 'tulanmagan', sana: '2026-09-17T13:47:00.000Z', sabab: 'tahrirlandi',
    removed_at: '2026-09-18T16:00:00.000Z', ...over,
  };
}

const rowsOf = () => Array.from(document.querySelectorAll('tbody tr')) as HTMLTableRowElement[];

beforeEach(() => {
  cleanup();
  mockState.buyurtmalar = [liveOrder()];
  mockState.archive = { rows: [], fail: false };
});

describe('Zapchastlar hisoboti — olib tashlangan zapchastlar', () => {
  it('olib tashlangan qator jadvalda qoladi va "Olib tashlangan" deb belgilanadi (xira)', async () => {
    mockState.archive.rows = [archived()];
    render(<PartReportsPage />);

    await waitFor(() => expect(screen.getByText('Mushtik')).toBeTruthy());
    expect(screen.getByText('Pampers')).toBeTruthy(); // joriy qator ham joyida

    const row = screen.getByText('Mushtik').closest('tr') as HTMLTableRowElement;
    expect(row.textContent).toContain('#2178');
    expect(row.textContent).toContain('Chevrolet Malibu 2');
    expect(row.textContent).toContain('140');            // narx ko'rinadi (140,000)
    expect(row.textContent).toContain('Yahyo aka');
    expect(row.textContent).toContain('Olib tashlangan');
    expect(row.style.opacity).toBe('0.6');

    const liveRow = screen.getByText('Pampers').closest('tr') as HTMLTableRowElement;
    expect(liveRow.textContent).not.toContain('Olib tashlangan');
    expect(liveRow.style.opacity).toBe('1');
  });

  it('qatorlar soni yozuvi olib tashlanganlarni alohida ko\'rsatadi', async () => {
    mockState.archive.rows = [archived(), archived({ id: 2, zap: { nom: 'Gofra', narx: 400000 } })];
    render(<PartReportsPage />);
    await waitFor(() => expect(screen.getByText('Gofra')).toBeTruthy());
    expect(document.body.textContent).toContain('3 ta qator');
    expect(document.body.textContent).toContain('2 tasi buyurtmadan olib tashlangan');
  });

  it('buyurtmaning o\'zi o\'chirilgan bo\'lsa "Buyurtma o\'chirilgan" deb belgilanadi', async () => {
    mockState.archive.rows = [archived({ sabab: 'buyurtma_ochirildi' })];
    render(<PartReportsPage />);
    await waitFor(() => expect(screen.getByText('Mushtik')).toBeTruthy());
    expect(screen.getByText('Mushtik').closest('tr')!.textContent).toContain("Buyurtma o'chirilgan");
  });

  it('olib tashlangan rasxod "Rasxod" turi bilan ko\'rinadi', async () => {
    mockState.archive.rows = [archived({
      zap: { id: -1, nom: 'Taxi', narx: 15000, kat: 'Rasxod', rasxod: true }, xodim: 'Abdulazizxon',
    })];
    render(<PartReportsPage />);
    await waitFor(() => expect(screen.getByText('Taxi')).toBeTruthy());
    const row = screen.getByText('Taxi').closest('tr')!;
    expect(row.textContent).toContain('Rasxod');
    expect(row.textContent).toContain('Abdulazizxon');
  });

  it('tartib: qator qo\'shilgan sanasi bo\'yicha (olib tashlangan vaqt bo\'yicha emas)', async () => {
    // Mushtik 17-sentabrda qo'shilgan (16:00 da olib tashlangan), Pampers 18-sentabrda → Pampers yuqorida.
    mockState.archive.rows = [archived()];
    render(<PartReportsPage />);
    await waitFor(() => expect(screen.getByText('Mushtik')).toBeTruthy());
    const names = rowsOf().map((r) => r.textContent || '');
    expect(names.findIndex((t) => t.includes('Pampers'))).toBeLessThan(names.findIndex((t) => t.includes('Mushtik')));
  });

  it('qidiruv olib tashlangan qatorlarni ham topadi', async () => {
    mockState.archive.rows = [archived()];
    render(<PartReportsPage />);
    await waitFor(() => expect(screen.getByText('Mushtik')).toBeTruthy());

    const input = screen.getByPlaceholderText(/Zapchast, mashina/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'malibu' } });
    expect(screen.queryByText('Pampers')).toBeNull();
    expect(screen.getByText('Mushtik')).toBeTruthy();
  });

  it('arxiv yuklanmasa — ogohlantirish chiqadi, joriy zapchastlar esa ko\'rinaveradi', async () => {
    mockState.archive.fail = true;
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<PartReportsPage />);

    await waitFor(() => expect(document.body.textContent).toContain('arxivi yuklanmadi'));
    expect(screen.getByText('Pampers')).toBeTruthy();
    errSpy.mockRestore();
  });

  it('arxiv bo\'sh bo\'lsa — oddiy ko\'rinish, ogohlantirishsiz', async () => {
    render(<PartReportsPage />);
    await waitFor(() => expect(screen.getByText('Pampers')).toBeTruthy());
    expect(document.body.textContent).not.toContain('olib tashlangan');
    expect(document.body.textContent).not.toContain('yuklanmadi');
    expect(document.body.textContent).toContain('1 ta qator');
  });
});
