// @vitest-environment node
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { Packer } from 'docx';
import {
  buildMonthlyReportDocument,
  buildReportInput,
  describePeriod,
  fmtSum,
  type MonthlyReportInput,
} from '@/lib/monthlyReportDocx';
import type { LedgerRow } from '@/lib/businessLedger';
import type { RasxodCar, RasxodItem } from '@/lib/rasxodDaftar';

// Boshliq hisobotidagi "Word hisobot" tugmasi uchun hujjat yaratuvchi:
// davr nomi, kirish ma'lumotini yig'ish va hujjat tarkibi.

const NOW = new Date('2026-10-13T07:00:00.000Z'); // Toshkent: 13.10.2026

function item(p: Partial<RasxodItem> & Pick<RasxodItem, 'id' | 'car_id' | 'nom' | 'summa' | 'sana'>): RasxodItem {
  return {
    tulandi: false, tulangan_summa: 0, tulangan_vaqt: null, created_at: '2026-09-16T10:00:00.000Z', ...p,
  };
}

function car(p: Partial<RasxodCar> & Pick<RasxodCar, 'id'>): RasxodCar {
  return {
    mashina: 'KIA EV 3', raqam: '50*****', mijoz: null, tel: null, izoh: null,
    created_at: '2026-09-16T10:00:00.000Z', updated_at: '2026-09-16T10:00:00.000Z', items: [], ...p,
  };
}

function row(p: Partial<LedgerRow> & Pick<LedgerRow, '_id' | '_amount'>): LedgerRow {
  return {
    _date: '2026-10-05', _displayDate: '05.10.2026', _rawDate: '2026-10-05T10:00:00.000Z', _category: 'Aylanmadan tashqari',
    _izoh: '', _mijoz: '', _method: 'NAQD', _positive: false, _orderId: null, _isRasxod: false, ...p,
  };
}

const STATS = { kirim: 52_595_000, zapchast: 18_990_000, ishXaqi: 10_230_000, ishxonaXarajat: 10_490_000, tashqari: 11_810_000, foyda: 1_075_000 };

async function textOf(input: MonthlyReportInput): Promise<{ text: string; sections: number; xml: string }> {
  const buf = await Packer.toBuffer(buildMonthlyReportDocument(input));
  expect(buf.subarray(0, 2).toString()).toBe('PK'); // haqiqiy .docx (zip)
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml')!.async('string');
  const text = Array.from(xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g))
    .map((m) => m[1].replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'))
    .join('\n');
  return { text, sections: (xml.match(/<w:sectPr/g) || []).length, xml };
}

describe('describePeriod', () => {
  it('joriy oy (tugamagan) — "1–13 oktyabr (oy hali tugamagan)"', () => {
    expect(describePeriod('2026-10-01', '2026-10-31', '2026-10-13')).toEqual({
      title: 'Oktyabr 2026',
      periodLabel: '1–13 oktyabr (oy hali tugamagan)',
      fileBase: 'Hisobot_Oktyabr_2026',
    });
  });

  it("o'tgan oy — to'liq davr, qo'shimcha izohsiz", () => {
    const p = describePeriod('2026-09-01', '2026-09-30', '2026-10-13');
    expect(p.title).toBe('Sentyabr 2026');
    expect(p.periodLabel).toBe('1–30 sentyabr');
    expect(p.fileBase).toBe('Hisobot_Sentyabr_2026');
  });

  it("kalendar oy bo'lmagan davr — sanalar bilan", () => {
    const p = describePeriod('2026-10-05', '2026-10-20', '2026-10-13');
    expect(p.title).toBe('05.10.2026 – 20.10.2026');
    expect(p.fileBase).toBe('Hisobot_2026-10-05_2026-10-20');
  });

  it("sana tanlanmagan bo'lsa — barcha davr", () => {
    expect(describePeriod('', '', '2026-10-13').title).toBe('Barcha davr');
  });

  it('fevral (kabisa bo\'lmagan yil) — 28 kun', () => {
    expect(describePeriod('2026-02-01', '2026-02-28', '2026-10-13').periodLabel).toBe('1–28 fevral');
  });
});

describe('fmtSum', () => {
  it('minglar bo\'linmas probel bilan, manfiy — "−"', () => {
    expect(fmtSum(1075000)).toBe('1 075 000');
    expect(fmtSum(-21108018)).toBe('−21 108 018');
    expect(fmtSum(0)).toBe('0');
  });
});

describe('buildReportInput', () => {
  const daftar: RasxodCar[] = [
    car({ id: 1, mashina: 'Hammasi to\'langan', raqam: '01A', items: [item({ id: 1, car_id: 1, nom: 'x', summa: 100, sana: '2026-09-16', tulandi: true, tulangan_vaqt: '2026-10-01T10:00:00.000Z' })] }),
    car({ id: 2, mashina: 'Yangi', raqam: '02B', items: [item({ id: 2, car_id: 2, nom: 'yog\'', summa: 600000, sana: '2026-10-08' })] }),
    car({ id: 3, mashina: 'Eskirgan', raqam: '03C', items: [item({ id: 3, car_id: 3, nom: 'blok', summa: 900000, sana: '2026-09-16' })] }),
    car({ id: 4, mashina: 'Bo\'sh kartochka', raqam: '04D', items: [] }),
  ];

  const input = buildReportInput({
    from: '2026-10-01',
    to: '2026-10-31',
    stats: STATS,
    ishchilar: [{ nom: 'xoji akbar', summa: 300000 }, { nom: 'Mirzo ', summa: 250000 }],
    extRows: [
      row({ _id: '2', _amount: 320000, _date: '2026-10-08', _rawDate: '2026-10-08T10:00:00.000Z', _izoh: 'eqe moyka', _source: 'Yahyo aka' }),
      row({ _id: '1', _amount: 450000, _date: '2026-10-01', _rawDate: '2026-10-01T10:00:00.000Z', _source: 'Yahyo aka' }),
    ],
    maoshTarixi: [
      { xodimId: 9, summa: 31_034_000, method: 'tashqi', sana: '2026-10-03', createdAt: '2026-10-03T16:36:38.000Z' },
      { xodimId: 9, summa: 4_440_000, method: 'naqd', sana: '2026-09-24', createdAt: '2026-09-24T10:46:48.000Z' }, // boshqa oy va oddiy maosh
    ],
    xodimlar: [{ id: 9, ism: 'Sherzod aka' }],
    daftar,
    now: NOW,
  });

  it('davr nomi va foyda ekrandagi raqamlar bilan bir xil', () => {
    expect(input.title).toBe('Oktyabr 2026');
    expect(input.foyda).toBe(1_075_000);
    expect(input.kirim).toBe(33_605_000); // 52 595 000 − 18 990 000 (zapchast va rasxod puli chiqarilgan)
    expect(input.tashqari).toBe(11_810_000);
  });

  it("xodim ismlari tartibga keltiriladi (bosh harf, ortiqcha probelsiz)", () => {
    expect(input.ishchilar.map((w) => w.nom)).toEqual(['Xoji akbar', 'Mirzo']);
  });

  it("aylanmadan tashqari qatorlari eskidan yangiga, manba bilan", () => {
    expect(input.tashqariRows.map((r) => [r.sana, r.summa, r.manba])).toEqual([
      ['2026-10-01', 450000, 'Yahyo aka'],
      ['2026-10-08', 320000, 'Yahyo aka'],
    ]);
  });

  it("kassadan berilmagan maosh faqat shu davrdan olinadi", () => {
    expect(input.tashqiMaosh).toEqual([{ nom: 'Sherzod aka', summa: 31_034_000, sana: '2026-10-03' }]);
  });

  it("rasxod: faqat qaytishi kutilayotgan mashinalar, eng uzoq kutayotgan tepada", () => {
    expect(input.rasxodCars.map((c) => c.mashina)).toEqual(['Eskirgan', 'Yangi']);
  });
});

describe('buildMonthlyReportDocument', () => {
  const full = buildReportInput({
    from: '2026-10-01',
    to: '2026-10-31',
    stats: STATS,
    ishchilar: [{ nom: 'Ismoil aka', summa: 7_360_000 }, { nom: 'Abdulazizxon', summa: 1_450_000 }],
    extRows: [row({ _id: '1', _amount: 450000, _date: '2026-10-01', _izoh: 'travers dovernest', _source: 'Yahyo aka' })],
    maoshTarixi: [{ xodimId: 9, summa: 31_034_000, method: 'tashqi', sana: '2026-10-03', createdAt: '2026-10-03T16:36:38.000Z' }],
    xodimlar: [{ id: 9, ism: 'Sherzod aka' }],
    daftar: [
      car({ id: 7, mashina: 'Zeekr 001', raqam: '40W770WW', tel: '+998907757777', items: [
        item({ id: 20, car_id: 7, nom: 'telematika blok', summa: 10_800_000, sana: '2026-09-17', tulangan_summa: 3_600_000, tulangan_vaqt: '2026-09-18T10:00:00.000Z' }),
        item({ id: 21, car_id: 7, nom: 'ZDS ochish', summa: 11_520_000, sana: '2026-09-17' }),
      ] }),
    ],
    now: NOW,
  });

  it("uch bo'lim: oylik hisobot, aylanmadan tashqari, qaytadigan rasxodlar", async () => {
    const { text, sections } = await textOf(full);
    expect(sections).toBe(3);
    expect(text).toContain('Oktyabr 2026');
    expect(text).toContain('Aylanmadan tashqari operatsiyalar');
    expect(text).toContain('Qaytadigan rasxodlar');
  });

  it("aylanmadan tashqari jadvalining JAMI qatori ikki ustunni egallaydi (summa o'z ustunida turadi)", async () => {
    const { xml } = await textOf(full);
    expect(xml).toContain('<w:gridSpan w:val="2"/>');
  });

  it("4 ta ko'rsatkich va hisob-kitob qatori", async () => {
    const { text } = await textOf(full);
    for (const n of [1_075_000, 10_230_000, 10_490_000, 11_810_000]) expect(text).toContain(fmtSum(n));
    expect(text).toContain(`Hisob: ${fmtSum(33_605_000)} (kirim)`);
  });

  it("barcha xodimlar jami bilan; aylanmadan tashqari qatori; rasxod mashinasi", async () => {
    const { text } = await textOf(full);
    expect(text).toContain('Ismoil aka');
    expect(text).toContain('Abdulazizxon');
    expect(text).toContain(fmtSum(7_360_000 + 1_450_000)); // JAMI
    expect(text).toContain('Travers dovernest');
    expect(text).toContain('Zeekr 001');
    expect(text).toContain('Qisman: 3 600 000 to\'langan, qoldi 7 200 000');
    expect(text).toContain('+998 90 775 77 77');
  });

  it("kassadan emas berilgan maosh haqida izoh", async () => {
    const { text } = await textOf(full);
    expect(text).toContain("Sherzod aka ning 03.10.2026 dagi 31 034 000 so'mlik to'lovi kassadan emas berilgani uchun hisobga kiritilmagan.");
  });

  it('manfiy foyda "−" bilan yoziladi', async () => {
    const neg = { ...full, foyda: -21_108_018 };
    const { text } = await textOf(neg);
    expect(text).toContain('−21 108 018');
  });

  it("ma'lumot bo'lmasa — bo'sh bo'limlar tushunarli xabar bilan", async () => {
    const empty = buildReportInput({
      from: '2026-08-01', to: '2026-08-31', stats: { ...STATS, ishXaqi: 0, tashqari: 0 },
      ishchilar: [], extRows: [], maoshTarixi: [], xodimlar: [], daftar: [], now: NOW,
    });
    const { text } = await textOf(empty);
    expect(text).toContain('Avgust 2026');
    expect(text).toContain("Bu davrda ish xaqi to'lanmagan.");
    expect(text).toContain("Bu davrda aylanmadan tashqari operatsiya yo'q.");
    expect(text).toContain("Qaytishi kutilayotgan rasxod yo'q.");
  });

  it("aylanmadan tashqari kirim bo'lsa — sof chiqim ko'rsatiladi", async () => {
    const withIncome = buildReportInput({
      from: '2026-10-01', to: '2026-10-31', stats: STATS, ishchilar: [],
      extRows: [
        row({ _id: '1', _amount: 1_000_000, _date: '2026-10-01', _rawDate: '2026-10-01T10:00:00.000Z' }),
        row({ _id: '2', _amount: 400_000, _date: '2026-10-02', _rawDate: '2026-10-02T10:00:00.000Z', _positive: true }),
      ],
      maoshTarixi: [], xodimlar: [], daftar: [], now: NOW,
    });
    const { text } = await textOf(withIncome);
    expect(text).toContain('JAMI (sof chiqim)');
    expect(text).toContain(fmtSum(600_000));
  });
});
