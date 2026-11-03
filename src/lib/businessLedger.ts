// ─────────────────────────────────────────────────────────────────────────────
// Ishxona bo'yicha kirim-chiqim daftari — yagona, sof (pure) manba.
//
// `/reports/business` (barcha rollar uchun to'liq amaliyotlar jadvali) va
// boshliqning buyurtma-markazli hisoboti (BossBusinessReport) IKKALASI ham shu
// yerdan foydalanadi — shu sababli ikkalasining qatorlari va kirimi har doim
// BIR XIL chiqadi (ikki joyda mustaqil hisoblanмаydi).
//
// Qatorlar uch manbadan yig'iladi (reports/business/page.tsx'dagi asl mantiqqa
// aynan mos, faqat O(n) ga optimallashtirilgan va _orderId/_isRasxod qo'shilgan):
//  1) Kassa operatsiyalari (asosiy moliya manbasi);
//  2) To'langan, lekin to'lov operatsiyasi topilmagan buyurtmalar (zaxira);
//  3) Maoshlar — shtraf/bonus va 'tashqi' (kassadan berilmagan) bundan mustasno.
//
// Test: businessLedger.spec.ts
// ─────────────────────────────────────────────────────────────────────────────

import { orderKassaTotal, type BossZapLike } from './bossProfit';

export interface LedgerOpLike {
  id: number | string;
  type: 'income' | 'expense' | 'transfer';
  method?: string;
  amount?: number;
  category?: string;
  comment?: string;
  source?: string;
  date?: string;
  createdAt?: string;
  created_at?: string;
  orderId?: string | number;
  order_id?: string | number;
}

export interface LedgerOrderLike {
  id: number | string;
  holat: string;
  ism?: string;
  mashina?: string;
  final?: number;
  zaps?: BossZapLike[] | null;
  sana?: string;
  createdAt?: string;
  created_at?: string;
}

export interface LedgerSalaryLike {
  id: number | string;
  xodimId: number | string;
  summa?: number;
  method?: string;
  sana?: string;
  izoh?: string;
  createdAt?: string;
}

export interface LedgerWorkerLike {
  id: number | string;
  ism: string;
}

export interface LedgerRow {
  _id: string;
  _date: string; // YYYY-MM-DD
  _displayDate: string;
  _rawDate: string;
  _category: string;
  _izoh: string;
  _mijoz: string;
  _amount: number;
  _method: string;
  _positive: boolean; // true — kirim, false — chiqim
  _orderId: number | null; // shu qatorga bog'liq buyurtma id (topilmasa null)
  // Bot-ui orqali xodim kiritgan, buyurtmaga bog'liq "Rasxod: ..." chiqim yozuvi.
  // Summasi haqiqiy (kassadan chiqqan) — statistikadan OLIB TASHLANMAYDI, faqat
  // ba'zi ko'rinishlarda (boshliq) alohida qator sifatida RO'YXATDAN yashiriladi,
  // chunki u allaqachon o'sha buyurtmaning o'z zap/final summasida hisobga olingan.
  _isRasxod: boolean;
  // Kassa operatsiyasini kim/qayerga yozgani (op.source) — faqat operatsiya qatorlarida.
  _source?: string;
}

function opOrderId(op: LedgerOpLike): number {
  const idFromComment = op.comment ? Number((op.comment.match(/Buyurtma #(\d+)/) || [])[1]) : null;
  return Number(op.order_id || op.orderId || idFromComment);
}

function dateParts(raw: string, fallback: string): { date: string; display: string } {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { date: fallback, display: fallback };
  return {
    date: d.toISOString().split('T')[0],
    display: d.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
}

export function buildLedgerRows(
  buyurtmalar: LedgerOrderLike[],
  ishxonaOperatsiyalar: LedgerOpLike[],
  maoshTarixi: LedgerSalaryLike[],
  xodimlar: LedgerWorkerLike[],
): LedgerRow[] {
  const rows: LedgerRow[] = [];
  try {
    const orderById = new Map<number, LedgerOrderLike>(buyurtmalar.map((b) => [Number(b.id), b]));

    // 1. Kassa operatsiyalari (asosiy moliya manbasi)
    const opOrderIds = new Set<number>();
    for (const op of ishxonaOperatsiyalar) {
      const orderId = opOrderId(op);
      const hasOrder = Number.isFinite(orderId) && orderId !== 0;
      if (hasOrder) opOrderIds.add(orderId);
      const raw = op.created_at || op.createdAt || op.date || '';
      const { date, display } = dateParts(raw, op.date || '');
      const izoh = op.comment || '';
      const isRasxod = hasOrder && izoh.startsWith('Rasxod: ');
      // Buyurtma to'langach, uning rasxod qatorlari hisobotdan tushib ketadi
      // (rasxod pul buyurtma yakuniy summasi ichida kassaga qaytgan).
      if (isRasxod && orderById.get(orderId)?.holat === 'tulangan') continue;
      rows.push({
        _id: String(op.id),
        _date: date,
        _displayDate: display,
        _rawDate: raw,
        _category: op.category || (op.source === 'buyurtma' ? 'Buyurtma' : 'Operatsiya'),
        _izoh: izoh,
        _mijoz: op.source === 'buyurtma' ? orderById.get(orderId)?.ism || '' : '',
        _amount: Number(op.amount) || 0,
        _method: (op.method || '').toUpperCase(),
        _positive: op.type === 'income',
        _orderId: hasOrder ? orderId : null,
        // Bot-ui'ning /api/bot-ui/rasxod route'i shu shaklda comment yozadi
        // (src/app/api/bot-ui/rasxod/route.ts) — boshqa hech kim bunday izoh yozmaydi.
        _isRasxod: isRasxod,
        _source: op.source || '',
      });
    }

    // 2. To'langan buyurtmalar — faqat to'lov operatsiyasi yo'qlari (aks holda ikki marta sanaladi).
    // Alohida zapchast puli kassaga tushmagan, shu sababli kirimga yozilmaydi:
    // faqat alohida zapchastdan iborat buyurtma ro'yxatda 0 summa bilan turadi.
    for (const b of buyurtmalar) {
      if (b.holat !== 'tulangan' || opOrderIds.has(Number(b.id))) continue;
      const raw = b.createdAt || b.created_at || b.sana || '';
      const { date, display } = dateParts(raw, b.sana || '');
      const kassaSumma = orderKassaTotal(b);
      const alohida = (Number(b.final) || 0) - kassaSumma;
      rows.push({
        _id: String(b.id),
        _date: date,
        _displayDate: display,
        _rawDate: raw,
        _category: "Buyurtma to'lovi",
        _izoh: `Buyurtma #${b.id} - ${b.mashina || ''}${alohida > 0 ? ` | Alohida zapchast: ${alohida.toLocaleString()}` : ''}`,
        _mijoz: b.ism || '',
        _amount: kassaSumma,
        _method: 'NAQD',
        _positive: true,
        _orderId: Number(b.id),
        _isRasxod: false,
      });
    }

    // 3. Maoshlar. Shtraf/bonus kirmaydi — ular kassaga tegmaydi, faqat maoshdan
    // ayiriladi/qo'shiladi. Bonus kiritilsa, chiqim sifatida IKKI marta hisoblanardi.
    // 'tashqi' — xodimga kassadan emas, boshqa manbadan berilgan: ishxona chiqimi
    // emas, shuning uchun hisobotga kirmaydi (xodim tarixida esa turadi).
    const workerById = new Map<number, LedgerWorkerLike>(xodimlar.map((w) => [Number(w.id), w]));
    for (const m of maoshTarixi) {
      if (m.method === 'shtraf' || m.method === 'bonus' || m.method === 'tashqi') continue;
      const raw = m.createdAt || m.sana || '';
      const { date, display } = dateParts(raw, m.sana || '');
      rows.push({
        _id: String(m.id),
        _date: date,
        _displayDate: display,
        _rawDate: raw,
        _category: 'Ish xaqi',
        _izoh: m.izoh || '',
        _mijoz: workerById.get(Number(m.xodimId))?.ism || 'Xodim',
        _amount: Number(m.summa) || 0,
        _method: (m.method || '').toUpperCase(),
        _positive: false,
        _orderId: null,
        _isRasxod: false,
      });
    }
  } catch (e) {
    console.error('Data processing error:', e);
  }

  return rows
    .map((r) => ({ r, t: new Date(r._rawDate || r._date).getTime() }))
    .sort((a, b) => b.t - a.t)
    .map((x) => x.r);
}

export interface XarajatJami {
  ishxona: number;  // qo'lda kiritilgan ishxona chiqimlari
  ishXaqi: number;  // kassadan berilgan maoshlar
  rasxod: number;   // xodimlar bot orqali mashinaga sarflagani
  tashqari: number; // aylanmadan tashqari chiqimlar
  jami: number;
}

// Davr ichida kassadan chiqqan BARCHA xarajat (`from`/`to` bo'sh bo'lsa — chegarasiz).
// `ops` ga ishxona VA aylanmadan tashqari operatsiyalari birga beriladi. Perevod
// xarajat emas. buildLedgerRows'ga buyurtmalar ataylab berilmaydi: to'langan
// buyurtmaning rasxodi ro'yxatdan yashirilgani bilan pul kassadan chiqqan.
export function computeXarajatJami(
  ops: LedgerOpLike[],
  maoshTarixi: LedgerSalaryLike[],
  from: string,
  to: string,
): XarajatJami {
  const res: XarajatJami = { ishxona: 0, ishXaqi: 0, rasxod: 0, tashqari: 0, jami: 0 };
  const rows = buildLedgerRows([], ops.filter((op) => op.type === 'expense'), maoshTarixi, []);
  for (const r of rows) {
    if ((from && r._date < from) || (to && r._date > to)) continue;
    if (r._category === 'Ish xaqi') res.ishXaqi += r._amount;
    else if (r._category === 'Aylanmadan tashqari') res.tashqari += r._amount;
    else if (r._isRasxod) res.rasxod += r._amount;
    else res.ishxona += r._amount;
    res.jami += r._amount;
  }
  return res;
}
