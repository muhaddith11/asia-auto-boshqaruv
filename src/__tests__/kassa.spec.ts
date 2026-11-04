import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabaseClient', () => ({ default: {} }));

const { invertDelta, operationDelta, salaryDelta } = await import('@/lib/kassa');

describe('operationDelta', () => {
  it("kirim tanlangan hisobga qo'shiladi", () => {
    expect(operationDelta({ type: 'income', method: 'naqd', amount: 100 })).toEqual({ naqd: 100, karta: 0 });
    expect(operationDelta({ type: 'income', method: 'karta', amount: '250' })).toEqual({ naqd: 0, karta: 250 });
  });

  it('chiqim tanlangan hisobdan ayriladi', () => {
    expect(operationDelta({ type: 'expense', method: 'naqd', amount: 100 })).toEqual({ naqd: -100, karta: 0 });
  });

  it("o'tkazma bir hisobdan ikkinchisiga o'tadi", () => {
    expect(operationDelta({ type: 'transfer', method: 'naqd', tomethod: 'karta', amount: 70 })).toEqual({ naqd: -70, karta: 70 });
  });

  it('kassaga tegmaydigan yozuvlar null qaytaradi', () => {
    expect(operationDelta({ type: 'income', method: 'tashqari', amount: 100 })).toBeNull();
    expect(operationDelta({ type: 'income', method: 'naqd', amount: 0 })).toBeNull();
    expect(operationDelta({ type: 'income', method: 'naqd', amount: -5 })).toBeNull();
    expect(operationDelta({ type: 'income', method: 'naqd', amount: 'abc' })).toBeNull();
    expect(operationDelta({ type: 'transfer', method: 'naqd', tomethod: 'naqd', amount: 10 })).toBeNull();
    expect(operationDelta({ type: 'boshqa', method: 'naqd', amount: 10 })).toBeNull();
  });
});

describe('salaryDelta', () => {
  it('maosh kassadan chiqadi', () => {
    expect(salaryDelta({ method: 'karta', amount: 500 })).toEqual({ naqd: 0, karta: -500 });
  });

  it("noto'g'ri summa yoki hisob kassaga tegmaydi", () => {
    expect(salaryDelta({ method: 'naqd', amount: 0 })).toBeNull();
    expect(salaryDelta({ method: 'bonus', amount: 100 })).toBeNull();
  });
});

describe('invertDelta', () => {
  it('summani teskarisiga aylantiradi', () => {
    expect(invertDelta({ naqd: 100, karta: -40 })).toEqual({ naqd: -100, karta: 40 });
  });
});
