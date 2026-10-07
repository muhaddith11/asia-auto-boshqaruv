import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Boshliqning "Ishxona bo'yicha" hisoboti — EKRANDA ko'rinadigan raqamlar.
// Asosiy talab: katta raqam KIRIM emas, ISHXONA FOYDASI bo'lishi va
// zapchast/ish xaqi/xarajat ikki marta ayirilmasligi.

const mockState = vi.hoisted(() => ({
  buyurtmalar: [] as unknown[],
  ishxonaOperatsiyalar: [] as unknown[],
  maoshTarixi: [] as unknown[],
  xodimlar: [] as unknown[],
}));

vi.mock('@/store/useStore', () => ({
  useStore: () => mockState,
}));

const { default: BossBusinessReport } = await import('@/components/BossBusinessReport');

// "1 500 000" (ru-RU ajratkichi — uzilmas probel) matnini qidirish uchun
const norm = (s: string | null) => (s || '').replace(/\s+/g, ' ');

beforeEach(() => {
  cleanup();
  // Hisobot sukut bo'yicha JORIY OYni ko'rsatadi — sanani qotirib qo'yamiz
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-15T10:00:00.000Z'));

  mockState.buyurtmalar = [
    // Boshliq misoli: 1 000 000 lik buyurtma, ichida 500 000 zapchast
    {
      id: 7, ism: 'Aziz', mashina: 'Malibu', raqam: '40A001AA', holat: 'tulangan',
      sana: '2026-09-10', createdAt: '2026-09-10T09:00:00.000Z',
      srv: 500000, zap: 500000, final: 1000000, zarplata: 150000,
      zaps: [{ id: 1, nom: 'Babina', narx: 500000, qty: 1 }],
    },
    // Xodim bot orqali mashinaga 200 000 rasxod qilgan (kassadan chiqqan)
    {
      id: 8, ism: 'Bobur', mashina: 'Cobalt', raqam: '40B002BB', holat: 'tulangan',
      sana: '2026-09-11', createdAt: '2026-09-11T09:00:00.000Z',
      srv: 600000, zap: 200000, final: 800000, zarplata: 90000,
      zaps: [{ id: 2, nom: 'Injektr', narx: 200000, qty: 1, rasxod: true, kat: 'Rasxod' }],
    },
  ];

  mockState.ishxonaOperatsiyalar = [
    { id: 101, type: 'income', method: 'naqd', amount: 1000000, category: "Buyurtma to'lovi", source: 'buyurtma', comment: "Buyurtma #7 - Malibu (To'liq)", date: '2026-09-10', created_at: '2026-09-10T12:00:00.000Z' },
    { id: 102, type: 'income', method: 'naqd', amount: 800000, category: "Buyurtma to'lovi", source: 'buyurtma', comment: "Buyurtma #8 - Cobalt (To'liq)", date: '2026-09-11', created_at: '2026-09-11T12:00:00.000Z' },
    { id: 103, type: 'expense', method: 'naqd', amount: 200000, category: "Buyurtma bo'yicha to'lov", source: 'Anvar', comment: 'Rasxod: Injektr (Buyurtma #8)', date: '2026-09-11', created_at: '2026-09-11T10:00:00.000Z' },
    { id: 104, type: 'expense', method: 'naqd', amount: 100000, category: 'Ishxona', source: 'manual', comment: 'antifriz', date: '2026-09-12', created_at: '2026-09-12T10:00:00.000Z' },
  ];

  mockState.maoshTarixi = [
    { id: 201, xodimId: 3, summa: 300000, method: 'naqd', sana: '2026-09-13', createdAt: '2026-09-13T10:00:00.000Z' },
  ];
  mockState.xodimlar = [{ id: 3, ism: 'Anvar' }];
});

afterEach(() => { vi.useRealTimers(); });

const rowOf = (text: string) => screen.getByText(text).closest('tr') as HTMLTableRowElement;

describe("Boshliq — Ishxona bo'yicha hisobot", () => {
  it('asosiy raqam sifatida ISHXONA FOYDASINI ko\'rsatadi (kirim emas)', () => {
    render(<BossBusinessReport />);
    // 1 800 000 kirim − 700 000 zapchast − 300 000 ish xaqi − 100 000 xarajat
    const hero = screen.getByText(/Ishxona foydasi/i).closest('div')?.parentElement as HTMLElement;
    expect(norm(hero.textContent)).toContain('700 000');
    // Kirim zapchast/rasxod pulisiz (1 800 000 − 700 000) ko'rsatiladi, "Zapchast" qatori yo'q
    expect(norm(hero.textContent)).toContain('1 100 000');
    expect(norm(hero.textContent)).not.toMatch(/zapchast/i);
  });

  it("boshliq misoli: 1 000 000 lik buyurtma, 500 000 zapchast → foyda 500 000", () => {
    render(<BossBusinessReport />);
    const row = norm(rowOf('Aziz').textContent);
    expect(row).toContain('− 500 000'); // zapchast ustuni
    expect(row).toContain('1 000 000'); // to'lov
    expect(row).toContain('500 000');   // foyda
  });

  it('bot rasxodini zapchast sifatida ayiradi va chiqimda TAKRORLAMAYDI', () => {
    render(<BossBusinessReport />);
    const row = norm(rowOf('Bobur').textContent);
    expect(row).toContain('Injektr');   // rasxod qatori ro'yxatda ko'rinadi
    expect(row).toContain('− 200 000'); // zapchast sifatida ayirilgan
    expect(row).toContain('600 000');   // 800 000 − 200 000

    // Tepadagi "Ishxona xarajati" qismida rasxod YO'Q (faqat 100 000 antifriz)
    const xarajat = screen.getByText(/^Ishxona xarajati$/).parentElement as HTMLElement;
    expect(norm(xarajat.textContent)).toContain('100 000');
    expect(norm(xarajat.textContent)).not.toContain('300 000');

    // Rasxod amaliyoti pastdagi ro'yxatda ham takrorlanmaydi
    expect(screen.queryByText(/Rasxod: Injektr/)).toBeNull();
  });

  it('ikki oyga bo\'lib to\'langan buyurtma zapchastini ikkala oyga TO\'LIQ yozmaydi', () => {
    // 1 000 000 lik buyurtma, 400 000 zapchast: 600 000 avgustda, 400 000 sentyabrda
    mockState.buyurtmalar = [{
      id: 9, ism: 'Davron', mashina: 'Spark', raqam: '40C003CC', holat: 'tulangan',
      sana: '2026-08-28', createdAt: '2026-08-28T09:00:00.000Z',
      srv: 600000, zap: 400000, final: 1000000, zarplata: 180000,
      zaps: [{ id: 3, nom: 'Disk', narx: 400000, qty: 1 }],
    }];
    mockState.ishxonaOperatsiyalar = [
      { id: 111, type: 'income', method: 'naqd', amount: 600000, category: "Buyurtma to'lovi", source: 'buyurtma', comment: 'Buyurtma #9 (Qisman)', date: '2026-08-30', created_at: '2026-08-30T12:00:00.000Z' },
      { id: 112, type: 'income', method: 'naqd', amount: 400000, category: "Buyurtma to'lovi", source: 'buyurtma', comment: "Buyurtma #9 (To'liq)", date: '2026-09-02', created_at: '2026-09-02T12:00:00.000Z' },
    ];
    mockState.maoshTarixi = [];
    render(<BossBusinessReport />);

    // Sentyabr ko'rinishida faqat o'z ulushi: 400 000 × (400/1000) = 160 000
    const row = norm(rowOf('Davron').textContent);
    expect(row).toContain('− 160 000');
    expect(row).toContain('240 000'); // 400 000 − 160 000
    expect(screen.getAllByText(/Davron/)).toHaveLength(1); // avgust qatori kirmaydi
  });

  it("JAMI qatori ustunlar yig'indisiga teng (raqam yo'qolmaydi)", () => {
    render(<BossBusinessReport />);
    const jami = norm(rowOf('JAMI').textContent);
    expect(jami).toContain('− 700 000');  // zapchast: 500 000 + 200 000
    expect(jami).toContain('1 800 000');  // to'lov
    expect(jami).toContain('1 100 000');  // foyda: 500 000 + 600 000
  });
});
