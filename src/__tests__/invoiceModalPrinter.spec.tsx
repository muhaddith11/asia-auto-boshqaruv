import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

// Chek oynasi: "Printer" tanlovi chek qaysi kompyuter agentiga ketishini belgilaydi.
// Asosiy (noutbuk) agent 'pending' ni, 2-kompyuter agenti 'pending:kompyuter2' ni kutadi.

const mockUpdate = vi.hoisted(() => vi.fn());

vi.mock('@/store/useStore', () => ({
  useStore: (sel: (s: unknown) => unknown) => sel({ updateBuyurtma: mockUpdate }),
}));

const { default: InvoiceModal } = await import('@/components/InvoiceModal');

const order = {
  id: 2706, ism: 'Kunlik Mijoz', mashina: 'Chevrolet Tracker 2', raqam: '40X505VA', sana: '2026-11-12',
  services: [{ id: 1, nom: 'Pult yozish', narx: 100000, workerId: 3, zarplata: 15000 }],
  zaps: [], final: 100000, paid: 0, zap: 0,
} as unknown as Parameters<typeof InvoiceModal>[0]['order'];

describe('InvoiceModal printer tanlovi', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUpdate.mockReset();
  });
  afterEach(cleanup);

  it('default — asosiy printerga oddiy pending yuboradi', () => {
    render(<InvoiceModal order={order} onClose={() => {}} />);
    expect((screen.getByLabelText('Printer') as HTMLSelectElement).value).toBe('');
    fireEvent.click(screen.getByText('CHECKNI CHIQARISH (AVTOMAT)'));
    expect(mockUpdate).toHaveBeenCalledWith(2706, { print_status: 'pending' });
  });

  it('2-kompyuter tanlansa o\'sha agentga yuboradi va tanlov eslab qolinadi', () => {
    render(<InvoiceModal order={order} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Printer'), { target: { value: 'kompyuter2' } });
    fireEvent.click(screen.getByText('CHECKNI CHIQARISH (AVTOMAT)'));
    expect(mockUpdate).toHaveBeenCalledWith(2706, { print_status: 'pending:kompyuter2' });

    // Oyna qayta ochilganda shu kompyuter tanlovi saqlanib turadi
    cleanup();
    render(<InvoiceModal order={order} onClose={() => {}} />);
    expect((screen.getByLabelText('Printer') as HTMLSelectElement).value).toBe('kompyuter2');
  });
});
