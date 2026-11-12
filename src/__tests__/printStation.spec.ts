import { describe, it, expect, beforeEach } from 'vitest';
import { getPrintStation, setPrintStation, pendingStatusFor } from '@/lib/printStation';

describe('printStation', () => {
  beforeEach(() => localStorage.clear());

  it('default — asosiy agent kutadigan oddiy pending', () => {
    expect(getPrintStation()).toBe('');
    expect(pendingStatusFor(getPrintStation())).toBe('pending');
  });

  it('tanlangan kompyuter eslab qolinadi va o\'z belgisini oladi', () => {
    setPrintStation('kompyuter2');
    expect(getPrintStation()).toBe('kompyuter2');
    expect(pendingStatusFor(getPrintStation())).toBe('pending:kompyuter2');
  });

  it('asosiyga qaytarilsa saqlangan tanlov o\'chadi', () => {
    setPrintStation('kompyuter2');
    setPrintStation('');
    expect(localStorage.getItem('chek_printer_station')).toBeNull();
    expect(getPrintStation()).toBe('');
  });

  it('ro\'yxatda yo\'q eski qiymat asosiy printerga tushadi', () => {
    localStorage.setItem('chek_printer_station', 'eski-kompyuter');
    expect(getPrintStation()).toBe('');
  });
});
