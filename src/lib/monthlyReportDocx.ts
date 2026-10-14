// ─────────────────────────────────────────────────────────────────────────────
// Boshliq hisoboti uchun Word (.docx) hisobot — tanlangan davr (odatda oy) bo'yicha.
//
// Hujjat uch bo'limdan iborat:
//   1) Oylik hisobot: umumiy foyda, ish xaqi, ishxona xarajati, aylanmadan tashqari
//      xarajat + barcha xodimlar bo'yicha ish xaqi (jami bilan);
//   2) Aylanmadan tashqari operatsiyalar (har biri alohida qator, jami bilan);
//   3) Qaytadigan rasxodlar — mijozlar qaytarishi kerak bo'lgan, kassadan
//      ayirilmagan rasxodlar (rasxod daftari), ish vaqtidagi holat bo'yicha.
//
// Raqamlarning o'zi bu yerda HISOBLANMAYDI: BossBusinessReport ekranda ko'rsatayotgan
// qiymatlar (stats, ishchilar, aylanmadan tashqari qatorlari) shu yerga uzatiladi —
// shu sababli hujjat va ekran doim bir xil raqamni ko'rsatadi.
//
// Bu modul `docx` kutubxonasini import qiladi — shuning uchun sahifada u faqat
// tugma bosilganda dinamik `import()` bilan yuklanadi (boshlang'ich bundle'ga kirmaydi).
//
// Test: monthlyReportDocx.spec.ts
// ─────────────────────────────────────────────────────────────────────────────

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  PositionalTab,
  PositionalTabAlignment,
  PositionalTabLeader,
  PositionalTabRelativeTo,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { triggerDownload } from '@/lib/export';
import {
  carStats,
  fmtSana,
  kunFarqi,
  paidAmount,
  qaytishKuni,
  tashkentDate,
  visibleCars,
  type RasxodCar,
} from '@/lib/rasxodDaftar';
import type { LedgerRow } from '@/lib/businessLedger';

// ───────────────────────────── Kirish ma'lumotlari ─────────────────────────────

export interface WorkerPay {
  nom: string;
  summa: number;
}

export interface TashqariRow {
  sana: string; // YYYY-MM-DD
  izoh: string;
  manba: string;
  summa: number;
  kirim: boolean; // true — kirim (sof chiqimdan ayriladi), aks holda chiqim
}

export interface TashqiMaosh {
  nom: string;
  summa: number;
  sana: string; // YYYY-MM-DD
}

export interface MonthlyReportInput {
  title: string; // "Oktyabr 2026"
  periodLabel: string; // "1–13 oktyabr (oy hali tugamagan)"
  fileBase: string; // yuklab olinadigan fayl nomi (kengaytmasiz)
  generatedAt: Date;
  foyda: number;
  kirim: number; // zapchast va rasxod puli chiqarilgan kirim
  ishXaqi: number;
  ishxonaXarajati: number;
  tashqari: number; // aylanmadan tashqari sof chiqim
  ishchilar: WorkerPay[];
  tashqariRows: TashqariRow[];
  tashqiMaosh: TashqiMaosh[]; // kassadan emas berilgan maoshlar (hisobga kiritilmagan)
  rasxodCars: RasxodCar[]; // faqat qaytishi kutilayotganlari
}

// ───────────────────────────── Davr nomi ─────────────────────────────

const OYLAR = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];

const isYmd = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const capFirst = (s: string) => {
  const t = String(s || '').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export interface PeriodInfo {
  title: string;
  periodLabel: string;
  fileBase: string; // kengaytmasiz fayl nomi
}

// `from`/`to` — hisobot filtri (YYYY-MM-DD, bo'sh bo'lishi mumkin); `today` — Toshkent kuni.
export function describePeriod(from: string, to: string, today: string): PeriodInfo {
  if (isYmd(from) && isYmd(to)) {
    const [fy, fm, fd] = from.split('-').map(Number);
    const [ty, tm, td] = to.split('-').map(Number);
    const lastDay = new Date(Date.UTC(fy, fm, 0)).getUTCDate();
    if (fy === ty && fm === tm && fd === 1 && td === lastDay) {
      // To'liq kalendar oy
      const oy = OYLAR[fm - 1];
      const running = isYmd(today) && today >= from && today <= to;
      const endDay = running ? Number(today.slice(8, 10)) : lastDay;
      const title = `${capFirst(oy)} ${fy}`;
      return {
        title,
        periodLabel: `1–${endDay} ${oy}${running ? ' (oy hali tugamagan)' : ''}`,
        fileBase: `Hisobot_${title.replace(' ', '_')}`,
      };
    }
  }
  const f = isYmd(from) ? fmtSana(from) : '';
  const t = isYmd(to) ? fmtSana(to) : '';
  return {
    title: f || t ? `${f || '…'} – ${t || '…'}` : 'Barcha davr',
    periodLabel: 'Tanlangan davr',
    fileBase: `Hisobot_${isYmd(from) ? from : 'boshidan'}_${isYmd(to) ? to : 'hozirgacha'}`,
  };
}

// ───────────────────────────── Kirish ma'lumotini yig'ish ─────────────────────────────

export interface BuildReportArgs {
  from: string;
  to: string;
  stats: { kirim: number; zapchast: number; ishXaqi: number; ishxonaXarajat: number; tashqari: number; foyda: number };
  ishchilar: WorkerPay[];
  extRows: LedgerRow[]; // davr bo'yicha filtrlangan "Aylanmadan tashqari" qatorlari
  maoshTarixi: Array<{ xodimId: number | string; summa?: number; method?: string; sana?: string; createdAt?: string }>;
  xodimlar: Array<{ id: number | string; ism: string }>;
  daftar: RasxodCar[]; // rasxod daftari (barcha mashinalar)
  now?: Date;
}

// Maosh yozuvining kuni — ledger bilan bir xil qoida (createdAt'ning UTC kuni, bo'lmasa sana).
function salaryDay(m: { createdAt?: string; sana?: string }): string {
  const raw = m.createdAt || m.sana || '';
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? String(m.sana || '').slice(0, 10) : d.toISOString().slice(0, 10);
}

export function buildReportInput(args: BuildReportArgs): MonthlyReportInput {
  const now = args.now ?? new Date();
  const period = describePeriod(args.from, args.to, tashkentDate(now));
  const inRange = (day: string) => (!args.from || day >= args.from) && (!args.to || day <= args.to);

  const names = new Map<number, string>(args.xodimlar.map((w) => [Number(w.id), w.ism]));
  const tashqiMaosh = args.maoshTarixi
    .filter((m) => m.method === 'tashqi' && inRange(salaryDay(m)))
    .map((m) => ({
      nom: capFirst(names.get(Number(m.xodimId)) || 'Xodim'),
      summa: Number(m.summa) || 0,
      sana: salaryDay(m),
    }));

  // Ro'yxat eskidan yangiga (hisobotda tartib bilan o'qish uchun)
  const tashqariRows = [...args.extRows]
    .sort((a, b) => new Date(a._rawDate || a._date).getTime() - new Date(b._rawDate || b._date).getTime())
    .map((r) => ({
      sana: r._date,
      izoh: (r._izoh || '').trim(),
      manba: (r._source || '').trim(),
      summa: Number(r._amount) || 0,
      kirim: !!r._positive,
    }));

  // Faqat qaytishi kutilayotgan mashinalar (sahifadagi "Kutilmoqda" ro'yxati tartibida)
  const rasxodCars = visibleCars(args.daftar, 'kutilmoqda', '', now).filter((c) => carStats(c, now).qoldiq > 0);

  return {
    title: period.title,
    periodLabel: period.periodLabel,
    fileBase: period.fileBase,
    generatedAt: now,
    foyda: args.stats.foyda,
    kirim: args.stats.kirim - args.stats.zapchast,
    ishXaqi: args.stats.ishXaqi,
    ishxonaXarajati: args.stats.ishxonaXarajat,
    tashqari: args.stats.tashqari,
    ishchilar: args.ishchilar.map((w) => ({ nom: capFirst(w.nom), summa: w.summa })),
    tashqariRows,
    tashqiMaosh,
    rasxodCars,
  };
}

// ───────────────────────────── Ko'rinish (uslub) ─────────────────────────────

const NAVY = '1F2A44';
const GRAY = '6B7280';
const LINE = 'D0D7E2';
const HEAD_BG = 'E8EDF5';
const KEY_BG = 'F3F6FB';
const GREEN = '1E7B4F';
const RED = 'B42318';
const AMBER = '9A5B00';
const FONT = 'Calibri';

const NBSP = ' ';
const MINUS = '−';
const DOT = '·';
const DASH = '—';

// 1 234 567 — bo'linmas probel bilan (raqam satr oxirida uzilib qolmasin); manfiy — "−".
export function fmtSum(n: number): string {
  const v = Math.round(Number(n) || 0);
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return (v < 0 ? MINUS : '') + s;
}

function fmtTel(t: string | null | undefined): string {
  const d = String(t || '').replace(/\D/g, '');
  return d.length === 12 ? `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}` : String(t || '');
}

const CONTENT_W = 9638; // A4 (11906) − 2 × 1134 chekka
const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];
interface RunPart {
  text: string;
  color?: string;
  size?: number;
  bold?: boolean;
}
interface CellOpts {
  bold?: boolean;
  align?: Align;
  fill?: string;
  color?: string;
  size?: number;
  pad?: number;
  keepNext?: boolean;
  span?: number; // nechta ustunni egallaydi
}

function cell(content: string | RunPart[], width: number, o: CellOpts = {}): TableCell {
  const { bold = false, align = AlignmentType.LEFT, fill, color, size = 22, pad = 85, keepNext = false, span } = o;
  const runs = Array.isArray(content)
    ? content.map((p) => new TextRun({ font: FONT, size, bold, color, ...p }))
    : [new TextRun({ text: content, bold, font: FONT, size, color })];
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: span,
    borders,
    margins: { top: pad, bottom: pad, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    shading: fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
    children: [new Paragraph({ alignment: align, keepNext, children: runs })],
  });
}

function title1(text: string, subtitle: string): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text, bold: true, font: FONT, size: 48, color: NAVY })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: subtitle, font: FONT, size: 22, color: GRAY, italics: true })],
    }),
  ];
}

function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
    spacing: { before: 360, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 4 } },
    children: [new TextRun({ text, bold: true, font: FONT, size: 26, color: NAVY })],
  });
}

interface NoteOpts {
  before?: number;
  after?: number;
  size?: number;
  color?: string;
  bold?: boolean;
  italics?: boolean;
}
function note(text: string, o: NoteOpts = {}): Paragraph {
  return new Paragraph({
    spacing: { before: o.before ?? 60, after: o.after ?? 60 },
    children: [new TextRun({ text, font: FONT, size: o.size ?? 19, color: o.color ?? GRAY, italics: !!o.italics, bold: !!o.bold })],
  });
}

const widthOf = (cols: number[]) => ({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: cols });

// ───────────────────────────── 1-bo'lim: oylik hisobot ─────────────────────────────

function monthSection(input: MonthlyReportInput): Array<Paragraph | Table> {
  const profitColor = input.foyda >= 0 ? GREEN : RED;
  const W = [6238, 3400];

  const summary = new Table({
    ...widthOf(W),
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell("Ko'rsatkich", W[0], { bold: true, fill: HEAD_BG, color: NAVY }),
        cell("Summa (so'm)", W[1], { bold: true, fill: HEAD_BG, color: NAVY, align: AlignmentType.RIGHT }),
      ] }),
      new TableRow({ children: [
        cell('1. Umumiy foyda', W[0], { bold: true, fill: KEY_BG, size: 26 }),
        cell(fmtSum(input.foyda), W[1], { bold: true, fill: KEY_BG, align: AlignmentType.RIGHT, color: profitColor, size: 26 }),
      ] }),
      new TableRow({ children: [cell('2. Ish xaqi', W[0]), cell(fmtSum(input.ishXaqi), W[1], { align: AlignmentType.RIGHT })] }),
      new TableRow({ children: [cell('3. Ishxona xarajati', W[0]), cell(fmtSum(input.ishxonaXarajati), W[1], { align: AlignmentType.RIGHT })] }),
      new TableRow({ children: [cell('4. Aylanmadan tashqari xarajat', W[0]), cell(fmtSum(input.tashqari), W[1], { align: AlignmentType.RIGHT })] }),
    ],
  });

  const calc = note(
    `Hisob: ${fmtSum(input.kirim)} (kirim) ${MINUS} ${fmtSum(input.ishXaqi)} ${MINUS} ${fmtSum(input.ishxonaXarajati)} ` +
      `${MINUS} ${fmtSum(input.tashqari)} = ${fmtSum(input.foyda)}`,
    { before: 90, after: 20 },
  );

  // Barcha xodimlar bo'yicha ish xaqi
  const WW = [6238, 3400];
  const jamiIsh = input.ishchilar.reduce((s, w) => s + w.summa, 0);
  const workers: Array<Paragraph | Table> =
    input.ishchilar.length === 0
      ? [note("Bu davrda ish xaqi to'lanmagan.", { before: 120, size: 21 })]
      : [
          new Paragraph({ spacing: { after: 100 }, children: [] }),
          new Table({
            ...widthOf(WW),
            rows: [
              new TableRow({ tableHeader: true, children: [
                cell('Xodim', WW[0], { bold: true, fill: HEAD_BG, color: NAVY }),
                cell("Ish xaqi (so'm)", WW[1], { bold: true, fill: HEAD_BG, color: NAVY, align: AlignmentType.RIGHT }),
              ] }),
              ...input.ishchilar.map((w) => new TableRow({ cantSplit: true, children: [
                cell(w.nom, WW[0]),
                cell(fmtSum(w.summa), WW[1], { align: AlignmentType.RIGHT }),
              ] })),
              new TableRow({ cantSplit: true, children: [
                cell('JAMI', WW[0], { bold: true, fill: KEY_BG }),
                cell(fmtSum(jamiIsh), WW[1], { bold: true, fill: KEY_BG, align: AlignmentType.RIGHT }),
              ] }),
            ],
          }),
        ];

  const notes = [
    note(
      'Izoh: umumiy foyda = kirim (zapchast va rasxod puli chiqarilgan) − ish xaqi − ishxona xarajati − aylanmadan tashqari xarajat.',
      { before: 260 },
    ),
    ...input.tashqiMaosh.map((m) =>
      note(`${m.nom} ning ${fmtSana(m.sana)} dagi ${fmtSum(m.summa)} so'mlik to'lovi kassadan emas berilgani uchun hisobga kiritilmagan.`),
    ),
  ];

  return [
    ...title1(input.title, input.periodLabel),
    summary,
    calc,
    h2("Ish xaqi — xodimlar bo'yicha"),
    ...workers,
    ...notes,
  ];
}

// ───────────────────────────── 2-bo'lim: aylanmadan tashqari ─────────────────────────────

function tashqariSection(input: MonthlyReportInput): Array<Paragraph | Table> {
  const rows = input.tashqariRows;
  const net = rows.reduce((s, r) => s + (r.kirim ? -r.summa : r.summa), 0);
  const hasIncome = rows.some((r) => r.kirim);
  const head = title1(
    'Aylanmadan tashqari operatsiyalar',
    `${input.title} ${DOT} umumiy foydadan ayirilgan chiqimlar`,
  );

  if (rows.length === 0) {
    return [...head, note("Bu davrda aylanmadan tashqari operatsiya yo'q.", { before: 120, size: 21 })];
  }

  const stat = new Paragraph({
    spacing: { before: 0, after: 90 },
    children: [
      new TextRun({ text: `${input.periodLabel}   ${DOT}   ${rows.length} ta operatsiya   ${DOT}   jami `, font: FONT, size: 20, color: GRAY }),
      new TextRun({ text: fmtSum(net), font: FONT, size: 20, bold: true }),
    ],
  });

  const W = [1300, 4300, 1900, 2138];
  const table = new Table({
    ...widthOf(W),
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: [
        cell('Sana', W[0], { bold: true, fill: HEAD_BG, color: NAVY, size: 20, pad: 60 }),
        cell('Izoh', W[1], { bold: true, fill: HEAD_BG, color: NAVY, size: 20, pad: 60 }),
        cell('Manba', W[2], { bold: true, fill: HEAD_BG, color: NAVY, size: 20, pad: 60 }),
        cell("Summa (so'm)", W[3], { bold: true, fill: HEAD_BG, color: NAVY, size: 20, pad: 60, align: AlignmentType.RIGHT }),
      ] }),
      ...rows.map((r) => {
        const manba = !r.manba || r.manba === 'external' || r.manba === 'manual' ? DASH : r.manba;
        return new TableRow({ cantSplit: true, children: [
          cell(fmtSana(r.sana), W[0], { size: 20, pad: 50, color: GRAY }),
          cell(r.izoh ? capFirst(r.izoh) : DASH, W[1], { size: 20, pad: 50, color: r.izoh ? undefined : GRAY }),
          cell(manba, W[2], { size: 20, pad: 50, color: manba === DASH ? GRAY : undefined }),
          cell((r.kirim ? '+ ' : '') + fmtSum(r.summa), W[3], { size: 20, pad: 50, align: AlignmentType.RIGHT }),
        ] });
      }),
      new TableRow({ cantSplit: true, children: [
        cell(hasIncome ? 'JAMI (sof chiqim)' : 'JAMI', W[0] + W[1], { bold: true, fill: KEY_BG, size: 20, pad: 60, span: 2 }),
        cell('', W[2], { fill: KEY_BG, size: 20, pad: 60 }),
        cell(fmtSum(net), W[3], { bold: true, fill: KEY_BG, size: 20, pad: 60, align: AlignmentType.RIGHT }),
      ] }),
    ],
  });

  return [...head, stat, table];
}

// ───────────────────────────── 3-bo'lim: qaytadigan rasxodlar ─────────────────────────────

function rasxodSection(input: MonthlyReportInput): Array<Paragraph | Table> {
  const now = input.generatedAt;
  const bugun = fmtSana(tashkentDate(now));
  const head = title1(
    'Qaytadigan rasxodlar',
    `Mijozlar qaytarishi kerak bo'lgan, kassadan ayirilmagan rasxodlar ${DOT} ${bugun} holatiga`,
  );
  const cars = input.rasxodCars.map((car) => ({ car, st: carStats(car, now) }));
  if (cars.length === 0) {
    return [...head, note("Qaytishi kutilayotgan rasxod yo'q.", { before: 120, size: 21 })];
  }

  const total = cars.reduce(
    (s, c) => ({ jami: s.jami + c.st.jami, tulangan: s.tulangan + c.st.tulangan, qoldiq: s.qoldiq + c.st.qoldiq }),
    { jami: 0, tulangan: 0, qoldiq: 0 },
  );
  const carTitle = (c: RasxodCar) => (c.mashina && c.mashina.trim() ? c.mashina.trim() : 'Mashina (nomi kiritilmagan)');

  // Umumiy jadval
  const SW = [500, 3150, 1450, 1500, 1500, 1538];
  const sHead = (t: string, i: number) =>
    cell(t, SW[i], { bold: true, fill: HEAD_BG, color: NAVY, size: 20, pad: 70, align: i >= 3 ? AlignmentType.RIGHT : AlignmentType.LEFT });
  const summary = new Table({
    ...widthOf(SW),
    rows: [
      new TableRow({ tableHeader: true, children: ['№', 'Mashina', 'Raqam', 'Jami', "To'langan", 'Qoldiq'].map(sHead) }),
      ...cars.map(({ car, st }, i) => new TableRow({ cantSplit: true, children: [
        cell(String(i + 1), SW[0], { size: 20, pad: 70 }),
        cell(carTitle(car), SW[1], { size: 20, pad: 70 }),
        cell(car.raqam || DASH, SW[2], { size: 20, pad: 70 }),
        cell(fmtSum(st.jami), SW[3], { size: 20, pad: 70, align: AlignmentType.RIGHT }),
        cell(st.tulangan ? fmtSum(st.tulangan) : DASH, SW[4], { size: 20, pad: 70, align: AlignmentType.RIGHT, color: st.tulangan ? GREEN : GRAY }),
        cell(fmtSum(st.qoldiq), SW[5], { size: 20, pad: 70, align: AlignmentType.RIGHT, bold: true }),
      ] })),
      new TableRow({ cantSplit: true, children: [
        cell('', SW[0], { fill: KEY_BG, size: 20, pad: 70 }),
        cell('JAMI', SW[1], { bold: true, fill: KEY_BG, size: 20, pad: 70 }),
        cell('', SW[2], { fill: KEY_BG, size: 20, pad: 70 }),
        cell(fmtSum(total.jami), SW[3], { bold: true, fill: KEY_BG, size: 20, pad: 70, align: AlignmentType.RIGHT }),
        cell(fmtSum(total.tulangan), SW[4], { bold: true, fill: KEY_BG, size: 20, pad: 70, align: AlignmentType.RIGHT, color: GREEN }),
        cell(fmtSum(total.qoldiq), SW[5], { bold: true, fill: KEY_BG, size: 20, pad: 70, align: AlignmentType.RIGHT }),
      ] }),
    ],
  });
  const totalLine = note(
    `Jami ${fmtSum(total.jami)} so'mdan ${fmtSum(total.tulangan)} so'm qaytgan, ${fmtSum(total.qoldiq)} so'm qaytishi kutilmoqda.`,
    { before: 100, after: 40, size: 20, color: NAVY, bold: true },
  );

  // Har bir mashina bo'yicha qatorlar
  const blocks = cars.flatMap(({ car, st }, idx) => {
    const holatText =
      (st.holat === 'tulandi' ? "To'liq to'langan" : st.holat === 'qisman' ? "Qisman to'langan" : 'Kutilmoqda') +
      (st.kutishKuni !== null ? ` ${DOT} ${st.kutishKuni} kun` : '');
    const info = [
      car.raqam ? `Raqam: ${car.raqam}` : null,
      car.mijoz ? `Mijoz: ${car.mijoz}` : null,
      car.tel ? `Tel: ${fmtTel(car.tel)}` : null,
    ].filter(Boolean).join(`   ${DOT}   `);

    const heading = new Paragraph({
      heading: HeadingLevel.HEADING_3,
      keepNext: true,
      spacing: { before: idx === 0 ? 120 : 300, after: 20 },
      children: [
        new TextRun({ text: `${idx + 1}. ${carTitle(car)}`, bold: true, font: FONT, size: 26, color: NAVY }),
        new TextRun({ text: `   ${holatText}`, bold: true, font: FONT, size: 20, color: st.holat === 'tulandi' ? GREEN : AMBER }),
      ],
    });
    const infoLine = new Paragraph({
      keepNext: true,
      spacing: { before: 0, after: 20 },
      children: [new TextRun({ text: info || ' ', font: FONT, size: 19, color: GRAY })],
    });
    const stat = new Paragraph({
      keepNext: true,
      spacing: { before: 0, after: 90 },
      children: [
        new TextRun({ text: 'Jami ', font: FONT, size: 21, color: GRAY }),
        new TextRun({ text: fmtSum(st.jami), font: FONT, size: 21, bold: true }),
        new TextRun({ text: "     To'langan ", font: FONT, size: 21, color: GRAY }),
        new TextRun({ text: fmtSum(st.tulangan), font: FONT, size: 21, bold: true, color: st.tulangan ? GREEN : undefined }),
        new TextRun({ text: '     Qoldiq ', font: FONT, size: 21, color: GRAY }),
        new TextRun({ text: fmtSum(st.qoldiq), font: FONT, size: 21, bold: true }),
      ],
    });

    const W = [1300, 3300, 1600, 3438];
    const last = car.items.length - 1;
    const rows = [
      new TableRow({ tableHeader: true, cantSplit: true, children: [
        cell('Sana', W[0], { bold: true, fill: HEAD_BG, color: NAVY, size: 20, pad: 60, keepNext: true }),
        cell('Nima uchun', W[1], { bold: true, fill: HEAD_BG, color: NAVY, size: 20, pad: 60, keepNext: true }),
        cell("Summa (so'm)", W[2], { bold: true, fill: HEAD_BG, color: NAVY, size: 20, pad: 60, align: AlignmentType.RIGHT, keepNext: true }),
        cell('Holati', W[3], { bold: true, fill: HEAD_BG, color: NAVY, size: 20, pad: 60, keepNext: true }),
      ] }),
      ...car.items.map((it, i) => {
        const kn = i !== last; // mashina jadvali bir sahifada turishi uchun
        let holat: RunPart[];
        if (it.tulandi) {
          const paidDay = it.tulangan_vaqt ? fmtSana(tashkentDate(new Date(it.tulangan_vaqt))) : DASH;
          const days = qaytishKuni(it);
          holat = [{ text: `To'langan ${paidDay}`, color: GREEN }];
          if (days !== null) holat.push({ text: `  (${days} kunda qaytdi)`, color: GRAY, size: 18 });
        } else if (paidAmount(it) > 0) {
          holat = [{ text: `Qisman: ${fmtSum(paidAmount(it))} to'langan, qoldi ${fmtSum(it.summa - paidAmount(it))}`, color: AMBER }];
        } else {
          holat = [{ text: `Kutilmoqda ${DOT} ${kunFarqi(it.sana, now)} kun`, color: AMBER }];
        }
        return new TableRow({ cantSplit: true, children: [
          cell(fmtSana(it.sana), W[0], { size: 20, pad: 55, color: GRAY, keepNext: kn }),
          cell(capFirst(it.nom), W[1], { size: 20, pad: 55, keepNext: kn }),
          cell(fmtSum(it.summa), W[2], { size: 20, pad: 55, align: AlignmentType.RIGHT, keepNext: kn }),
          cell(holat, W[3], { size: 20, pad: 55, keepNext: kn }),
        ] });
      }),
    ];
    return [heading, infoLine, stat, new Table({ ...widthOf(W), rows })];
  });

  return [...head, summary, totalLine, ...blocks];
}

// ───────────────────────────── Hujjat ─────────────────────────────

const rightTab = () =>
  new PositionalTab({
    alignment: PositionalTabAlignment.RIGHT,
    relativeTo: PositionalTabRelativeTo.MARGIN,
    leader: PositionalTabLeader.NONE,
  });

const makeHeader = (right: string) =>
  new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
        children: [
          new TextRun({ text: 'Asia Auto Service', bold: true, font: FONT, size: 20, color: NAVY }),
          new TextRun({ children: [rightTab(), right], font: FONT, size: 20, color: GRAY }),
        ],
      }),
    ],
  });

const makeFooter = (generated: string) =>
  new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `Tayyorlangan sana: ${generated}`, font: FONT, size: 18, color: GRAY }),
          new TextRun({ children: [rightTab(), 'Sahifa ', PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: GRAY }),
        ],
      }),
    ],
  });

export function buildMonthlyReportDocument(input: MonthlyReportInput): Document {
  const generated = fmtSana(tashkentDate(input.generatedAt));
  const pageProps = {
    page: {
      size: { width: 11906, height: 16838 }, // A4
      margin: { top: 1300, right: 1134, bottom: 1200, left: 1134, header: 600, footer: 500 },
    },
  };
  const section = (headerText: string, children: Array<Paragraph | Table>) => ({
    properties: pageProps,
    headers: { default: makeHeader(headerText) },
    footers: { default: makeFooter(generated) },
    children,
  });

  return new Document({
    creator: 'Asia Auto Service',
    title: `Hisobot — ${input.title}`,
    styles: {
      default: { document: { run: { font: FONT, size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 48, bold: true, color: NAVY },
          paragraph: { spacing: { before: 0, after: 40 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 26, bold: true, color: NAVY },
          paragraph: { spacing: { before: 360, after: 60 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 26, bold: true, color: NAVY },
          paragraph: { spacing: { before: 300, after: 20 }, outlineLevel: 2 } },
      ],
    },
    sections: [
      section('Oylik moliyaviy hisobot', monthSection(input)),
      section('Aylanmadan tashqari', tashqariSection(input)),
      section('Qaytadigan rasxodlar', rasxodSection(input)),
    ],
  });
}

export async function buildMonthlyReportBlob(input: MonthlyReportInput): Promise<Blob> {
  return Packer.toBlob(buildMonthlyReportDocument(input));
}

// Hujjatni yaratib, brauzerda yuklab olishni boshlaydi.
export async function downloadMonthlyReport(input: MonthlyReportInput): Promise<void> {
  const blob = await buildMonthlyReportBlob(input);
  triggerDownload(blob, `${input.fileBase}.docx`);
}
