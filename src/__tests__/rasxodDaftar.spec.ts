import { describe, it, expect } from 'vitest';
import {
  carStats, fmtSana, isValidSana, joinCarsWithItems, kunFarqi, parseCarInput, parseItemInput, parseItemsInput,
  parseSumma, patchCar, qaytishKuni, removeItem, suggestCars, summarizeDaftar, tashkentDate, upsertItems, visibleCars,
  type RasxodCar, type RasxodCarRow, type RasxodItem,
} from '@/lib/rasxodDaftar';

// Toshkent = UTC+5. "Hozir" — 2026-09-16 kuni Toshkent vaqti bilan 15:00.
const NOW = new Date('2026-09-16T10:00:00.000Z');
const TODAY = '2026-09-16';

let nextId = 1;
const item = (carId: number, nom: string, summa: number, sana: string, tulanganVaqt?: string): RasxodItem => ({
  id: nextId++,
  car_id: carId,
  nom,
  summa,
  sana,
  tulandi: !!tulanganVaqt,
  tulangan_vaqt: tulanganVaqt ?? null,
  created_at: `${sana}T08:00:00.000Z`,
});
const carRow = (id: number, extra: Partial<RasxodCarRow> = {}): RasxodCarRow => ({
  id,
  mashina: 'Chevrolet Malibu',
  raqam: '40J928QB',
  mijoz: 'Aziz aka',
  tel: '+998901234567',
  izoh: null,
  created_at: '2026-09-01T08:00:00.000Z',
  updated_at: '2026-09-01T08:00:00.000Z',
  ...extra,
});
const car = (id: number, items: RasxodItem[], extra: Partial<RasxodCarRow> = {}): RasxodCar => ({
  ...carRow(id, extra),
  items,
});

describe('sana (Toshkent vaqti)', () => {
  it('UTC vaqtni Toshkent sanasiga aylantiradi (yarim tundan keyin — ertangi kun)', () => {
    expect(tashkentDate(new Date('2026-09-15T18:59:59.000Z'))).toBe('2026-09-15');
    expect(tashkentDate(new Date('2026-09-15T19:00:00.000Z'))).toBe('2026-09-16');
  });

  it("kunFarqi Toshkent kunlari bo'yicha hisoblaydi va manfiy bo'lmaydi", () => {
    expect(kunFarqi('2026-09-10', NOW)).toBe(6);
    expect(kunFarqi(TODAY, NOW)).toBe(0);
    expect(kunFarqi('2026-09-20', NOW)).toBe(0);
    // Toshkentda 16-sentyabr 00:30 (UTC da hali 15-sentyabr) — 1 kun o'tgan
    expect(kunFarqi('2026-09-15', new Date('2026-09-15T19:30:00.000Z'))).toBe(1);
  });

  it("isValidSana haqiqiy bo'lmagan sanalarni rad etadi", () => {
    expect(isValidSana('2026-02-28')).toBe(true);
    expect(isValidSana('2026-02-30')).toBe(false);
    expect(isValidSana('26-09-01')).toBe(false);
    expect(isValidSana('1999-12-31')).toBe(false);
    expect(isValidSana('')).toBe(false);
  });

  it("fmtSana 'KK.OO.YYYY' ko'rinishida chiqaradi", () => {
    expect(fmtSana('2026-09-03')).toBe('03.09.2026');
    expect(fmtSana(null)).toBe('—');
  });
});

describe('kiruvchi maʼlumot tekshiruvi', () => {
  it("parseSumma bo'shliqli satr va sonni qabul qiladi, 0/manfiy/yaroqsizni rad etadi", () => {
    expect(parseSumma('1 200 000')).toBe(1_200_000);
    expect(parseSumma(168000)).toBe(168_000);
    expect(parseSumma(1500.6)).toBe(1501);
    expect(parseSumma(0)).toBeNull();
    expect(parseSumma(-5)).toBeNull();
    expect(parseSumma('abc')).toBeNull();
    expect(parseSumma(null)).toBeNull();
    expect(parseSumma(1e13)).toBeNull();
  });

  it("yangi mashina: tozalaydi, raqamni katta harfga o'tkazadi, bo'sh telefon/izohni null qiladi", () => {
    const res = parseCarInput({ mashina: '  Zeekr   001 ', raqam: ' 60d567gb ', mijoz: '', tel: '+998', izoh: '  ', id: 5 });
    expect(res).toEqual({
      ok: true,
      value: { mashina: 'Zeekr 001', raqam: '60D567GB', mijoz: null, tel: null, izoh: null },
    });
  });

  it("yangi mashina: na nomi, na raqami bo'lmasa rad etadi; faqat raqam yetarli", () => {
    expect(parseCarInput({ mashina: ' ', raqam: '' }).ok).toBe(false);
    expect(parseCarInput({ raqam: '01A123BC' })).toMatchObject({ ok: true, value: { mashina: '', raqam: '01A123BC' } });
  });

  it("tahrirlash (partial): faqat yuborilgan maydonlar, bo'sh so'rov — xato", () => {
    expect(parseCarInput({ mijoz: 'Vali' }, { partial: true })).toEqual({ ok: true, value: { mijoz: 'Vali' } });
    expect(parseCarInput({}, { partial: true }).ok).toBe(false);
    expect(parseCarInput({ mashina: '', raqam: '' }, { partial: true }).ok).toBe(false);
  });

  it("yangi rasxod: nom va summa majburiy, sana berilmasa — bugun", () => {
    expect(parseItemInput({ nom: 'Akkumulyator', summa: '1 200 000' }, TODAY)).toEqual({
      ok: true,
      value: { nom: 'Akkumulyator', summa: 1_200_000, sana: TODAY },
    });
    expect(parseItemInput({ summa: 1000 }, TODAY)).toMatchObject({ ok: false });
    expect(parseItemInput({ nom: 'Benzin', summa: 0 }, TODAY)).toMatchObject({ ok: false });
  });

  it("kelajak sanani rad etadi (1 kun zaxira bilan)", () => {
    expect(parseItemInput({ nom: 'A', summa: 1, sana: '2026-09-17' }, TODAY).ok).toBe(true);
    expect(parseItemInput({ nom: 'A', summa: 1, sana: '2026-09-18' }, TODAY)).toEqual({
      ok: false,
      error: "Sana kelajakda bo'lishi mumkin emas",
    });
    expect(parseItemInput({ nom: 'A', summa: 1, sana: '2026-13-01' }, TODAY).ok).toBe(false);
  });

  it("rasxodni tahrirlash (partial): faqat yuborilgan maydon; bo'sh sana — xato", () => {
    expect(parseItemInput({ summa: 50_000 }, TODAY, { partial: true })).toEqual({ ok: true, value: { summa: 50_000 } });
    expect(parseItemInput({ sana: '' }, TODAY, { partial: true }).ok).toBe(false);
    expect(parseItemInput({ tulandi: true }, TODAY, { partial: true }).ok).toBe(false);
  });

  it("parseItemsInput: massiv bo'lmasa yoki juda ko'p bo'lsa rad etadi, yo'q bo'lsa — bo'sh ro'yxat", () => {
    expect(parseItemsInput(undefined, TODAY)).toEqual({ ok: true, value: [] });
    expect(parseItemsInput('x', TODAY).ok).toBe(false);
    expect(parseItemsInput(Array.from({ length: 51 }, () => ({ nom: 'a', summa: 1 })), TODAY).ok).toBe(false);
    expect(parseItemsInput([{ nom: 'a', summa: 1 }, { nom: '', summa: 1 }], TODAY).ok).toBe(false);
  });
});

describe('hisob-kitob', () => {
  it("joinCarsWithItems qatorlarni mashinaga bog'lab, sana bo'yicha tartiblaydi", () => {
    const later = item(1, 'Benzin', 168_000, '2026-09-10');
    const earlier = item(1, 'Akkumulyator', 1_200_000, '2026-09-03');
    const other = item(2, 'Yul kira', 420_000, '2026-09-05');
    const joined = joinCarsWithItems([carRow(1), carRow(2), carRow(3)], [later, other, earlier]);
    expect(joined.map((c) => c.items.map((i) => i.nom))).toEqual([['Akkumulyator', 'Benzin'], ['Yul kira'], []]);
  });

  it("carStats holatni aniqlaydi: bosh / kutilmoqda / qisman / tulandi", () => {
    expect(carStats(car(1, []), NOW).holat).toBe('bosh');
    expect(carStats(car(1, [item(1, 'A', 100, '2026-09-10')]), NOW).holat).toBe('kutilmoqda');
    expect(carStats(car(1, [item(1, 'A', 100, '2026-09-10'), item(1, 'B', 50, '2026-09-11', '2026-09-12T08:00:00Z')]), NOW).holat).toBe('qisman');
    expect(carStats(car(1, [item(1, 'A', 100, '2026-09-10', '2026-09-12T08:00:00Z')]), NOW).holat).toBe('tulandi');
  });

  it("carStats summalarni va eng eski to'lanmagan rasxoddan beri kunlarni hisoblaydi", () => {
    const st = carStats(car(1, [
      item(1, 'Akkumulyator', 1_200_000, '2026-09-03', '2026-09-05T06:00:00Z'),
      item(1, 'Benzin', 168_000, '2026-09-10'),
      item(1, 'Moy', 32_000, '2026-09-14'),
    ]), NOW);
    expect(st).toMatchObject({
      jami: 1_400_000,
      tulangan: 1_200_000,
      qoldiq: 200_000,
      itemCount: 3,
      unpaidCount: 2,
      kutishKuni: 6,
      oxirgiTulov: '2026-09-05T06:00:00Z',
    });
  });

  it("qaytishKuni: rasxod sanasidan to'langan kungacha (Toshkent kuni bilan)", () => {
    expect(qaytishKuni(item(1, 'A', 1, '2026-09-03', '2026-09-05T20:00:00Z'))).toBe(3); // Toshkentda 6-sentyabr 01:00
    expect(qaytishKuni(item(1, 'A', 1, '2026-09-03'))).toBeNull();
  });

  it("summarizeDaftar umumiy qoldiq, qaytgan, o'rtacha muddat va eng uzoq kutayotganni beradi", () => {
    const cars = [
      car(1, [item(1, 'A', 1_200_000, '2026-09-03', '2026-09-05T06:00:00Z'), item(1, 'B', 168_000, '2026-09-10')]),
      car(2, [item(2, 'C', 420_000, '2026-09-01')], { mashina: 'Zeekr 007', raqam: '60D567GB' }),
      car(3, [item(3, 'D', 50_000, '2026-09-11', '2026-09-15T06:00:00Z')]),
      car(4, []),
    ];
    const s = summarizeDaftar(cars, NOW);
    expect(s).toMatchObject({
      carCount: 4,
      itemCount: 4,
      jami: 1_838_000,
      qoldiq: 588_000,
      unpaidCount: 2,
      kutayotganMashina: 2,
      tulangan: 1_250_000,
      paidCount: 2,
      ortachaQaytish: 3, // (2 + 4) / 2
      engUzoq: { carId: 2, mashina: 'Zeekr 007', raqam: '60D567GB', kun: 15 },
    });
  });

  it("bo'sh daftarda nol qiymatlar", () => {
    expect(summarizeDaftar([], NOW)).toMatchObject({ jami: 0, qoldiq: 0, ortachaQaytish: null, engUzoq: null });
  });
});

describe("ro'yxat: filtr, qidiruv, tartib", () => {
  const paid = car(1, [item(1, 'Akkumulyator', 100, '2026-09-01', '2026-09-02T06:00:00Z')], { mashina: 'Cobalt', raqam: '01A111AA' });
  const old = car(2, [item(2, 'Benzin', 100, '2026-09-02')], { mashina: 'Nexia', raqam: '01B222BB', tel: '+998935557788' });
  const fresh = car(3, [item(3, 'Moy', 100, '2026-09-15')], { mashina: 'Spark', raqam: '40 J 928 QB' });
  const empty = car(4, [], { mashina: 'Onix', raqam: '10C333CC' });
  const all = [paid, old, fresh, empty];

  it("Kutilmoqda: qarzi bor va hali rasxod yozilmagan mashinalar, eng uzoq kutayotgan tepada", () => {
    expect(visibleCars(all, 'kutilmoqda', '', NOW).map((c) => c.id)).toEqual([2, 3, 4]);
  });

  it("To'langan: faqat to'liq qaytgan; Barchasi: hammasi (yangi kartochka tepada)", () => {
    expect(visibleCars(all, 'tulandi', '', NOW).map((c) => c.id)).toEqual([1]);
    expect(visibleCars(all, 'all', '', NOW).map((c) => c.id)).toEqual([4, 3, 2, 1]);
  });

  it("qidiruv: raqam bo'shliqsiz, telefon qismi, rasxod nomi va katta-kichik harfdan qat'i nazar", () => {
    expect(visibleCars(all, 'all', '40j928', NOW).map((c) => c.id)).toEqual([3]);
    expect(visibleCars(all, 'all', '93 555', NOW).map((c) => c.id)).toEqual([2]);
    expect(visibleCars(all, 'all', 'AKKUMULYATOR', NOW).map((c) => c.id)).toEqual([1]);
    expect(visibleCars(all, 'all', 'topilmaydi', NOW)).toEqual([]);
  });
});

describe('holatni yangilash', () => {
  it("upsertItems yangi qatorni qo'shadi, mavjudini almashtiradi va boshqa mashinalarga tegmaydi", () => {
    const a = item(1, 'A', 100, '2026-09-10');
    const cars = [car(1, [a]), car(2, [])];
    const paidA = { ...a, tulandi: true, tulangan_vaqt: '2026-09-16T10:00:00Z' };
    const added = item(1, 'B', 50, '2026-09-01');
    const next = upsertItems(cars, [paidA, added]);
    expect(next[0].items).toEqual([added, paidA]);
    expect(next[1]).toBe(cars[1]);
    expect(cars[0].items).toEqual([a]); // asl massiv o'zgarmagan
  });

  it("removeItem faqat ko'rsatilgan qatorni olib tashlaydi", () => {
    const a = item(1, 'A', 100, '2026-09-10');
    const b = item(1, 'B', 100, '2026-09-11');
    expect(removeItem([car(1, [a, b])], 1, a.id)[0].items).toEqual([b]);
  });

  it("patchCar mashina maydonlarini yangilaydi, rasxodlarni saqlab qoladi", () => {
    const a = item(1, 'A', 100, '2026-09-10');
    const next = patchCar([car(1, [a])], carRow(1, { mijoz: 'Vali' }));
    expect(next[0].mijoz).toBe('Vali');
    expect(next[0].items).toEqual([a]);
  });
});

describe('suggestCars (buyurtma bazasidan taklif)', () => {
  const sources = [
    { raqam: '40J928QB', mashina: 'Chevrolet Malibu 2.4', ism: 'Kunlik Mijoz', tel: '' },
    { raqam: '40 j 928 qb', mashina: 'Malibu (eski yozuv)', ism: 'Eski', tel: '+998900000000' },
    { raqam: '01A123BC', mashina: 'Cobalt', ism: 'Aziz aka', tel: '+998901234567' },
    { raqam: '', mashina: 'Raqamsiz', ism: 'X', tel: '' },
  ];

  it("2 belgidan kam so'rovda taklif bermaydi", () => {
    expect(suggestCars('4', sources)).toEqual([]);
  });

  it("raqam bo'yicha bo'shliq/registrdan qat'i nazar topadi, eng yangisini oladi va takrorlamaydi", () => {
    expect(suggestCars('40j 928', sources)).toEqual([
      { raqam: '40J928QB', mashina: 'Chevrolet Malibu 2.4', mijoz: '', tel: '' },
    ]);
  });

  it("haqiqiy mijoz ismi va telefonini to'ldiradi, limitga amal qiladi", () => {
    expect(suggestCars('123', sources)).toEqual([
      { raqam: '01A123BC', mashina: 'Cobalt', mijoz: 'Aziz aka', tel: '+998901234567' },
    ]);
    expect(suggestCars('A', sources)).toEqual([]);
    expect(suggestCars('QB', sources, 1)).toHaveLength(1);
  });
});
