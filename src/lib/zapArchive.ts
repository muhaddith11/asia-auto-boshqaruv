// ─────────────────────────────────────────────────────────────────────────────
// Zapchastlar hisoboti DOIMIY bo'lishi uchun: buyurtmadan olib tashlangan
// zapchast qatorlari (tahrirlashda o'chirilgan yoki buyurtma o'chirilgan)
// `zap_archive` jadvaliga nusxalanadi (qarang: db/zap_archive.sql).
//
// Bu fayl — sof mantiq (DB'siz): qaysi qatorlar olib tashlangani, ularning
// rasxod summasi va arxiv qatorini qurish. DB bilan ishlash: zapArchiveRepo.ts.
// ─────────────────────────────────────────────────────────────────────────────

export type ZapLike = {
  id?: number | string | null;
  nom?: string;
  name?: string;
  narx?: number | string;
  price?: number | string;
  rasxod?: boolean;
  kat?: string;
  xodim_nomi?: string;
  vaqt?: string;
} & Record<string, unknown>;

// tahrirlandi — buyurtmani tahrirlashda (yoki chek qayta chiqarilganda) qator olib tashlandi.
// buyurtma_ochirildi — butun buyurtma o'chirildi.
export type ArchiveReason = 'tahrirlandi' | 'buyurtma_ochirildi';

// Olib tashlash paytidagi buyurtma ma'lumotlari (arxivga nusxa sifatida yoziladi).
export interface ArchiveOrder {
  id: number | string;
  mashina?: string | null;
  raqam?: string | null;
  ism?: string | null;
  qabul_xodim_nomi?: string | null;
  created_at?: string | null;
  holat?: string | null;
}

export interface ZapArchiveInsert {
  order_id: number;
  zap: ZapLike;
  mashina: string;
  raqam: string;
  ism: string;
  xodim: string;
  order_holat: string | null;
  sana: string | null;
  sabab: ArchiveReason;
}

// Bazadan (yoki API'dan) o'qilgan arxiv qatori.
export interface ArchivedZap {
  id: number;
  order_id: number;
  zap: ZapLike;
  mashina: string;
  raqam: string;
  ism: string;
  xodim: string;
  order_holat: string | null;
  sana: string | null;
  sabab: ArchiveReason;
  removed_at: string;
}

// Rasxod (bot-ui'dan kiritilgan xarajat) qatorimi? Hisobot va kassa mantig'i bilan bir xil belgi.
export function isRasxodZap(z: ZapLike | null | undefined): boolean {
  return z?.rasxod === true || z?.kat === 'Rasxod';
}

const nameOf = (z: ZapLike) => String(z.nom ?? z.name ?? '').trim().toLowerCase();
const priceOf = (z: ZapLike) => Number(z.narx ?? z.price ?? 0) || 0;
const hasId = (z: ZapLike) => z.id !== null && z.id !== undefined && String(z.id) !== '';

// Buyurtmaning eski zaps'idan yangisiga o'tishda OLIB TASHLANGAN qatorlar.
//
// Qatorlarning barqaror identifikatori yo'q (tahrirlash sahifasi massivni qayta
// quradi), shuning uchun har bir eski qatorga yangi ro'yxatdan bittadan "juft"
// qidiriladi (multiset — bir xil zapchast ikki marta bo'lsa ham to'g'ri sanaladi):
//  • RASXOD qatorlari — nom VA narx bo'yicha aniq juftlanadi. Bu yerda pul bor
//    (olib tashlangan rasxod kassaga qaytariladi), shuning uchun mos kelish qat'iy.
//  • Oddiy zapchastlar — avval id, keyin nom bo'yicha. Bu faqat arxiv uchun
//    (pulga tegmaydi), shuning uchun yumshoqroq: nomi o'zgargan/qo'lda kiritilgan
//    qator katalogdagi zapchastga bog'lansa ham "olib tashlangan" hisoblanmaydi.
export function diffRemovedZaps(
  prev: ZapLike[] | null | undefined,
  next: ZapLike[] | null | undefined,
): ZapLike[] {
  const prevList = Array.isArray(prev) ? prev.filter(Boolean) : [];
  const nextList = Array.isArray(next) ? next.filter(Boolean) : [];

  const nextRasxod = nextList.filter(isRasxodZap);
  const nextRegular = nextList.filter((z) => !isRasxodZap(z));
  const removed: ZapLike[] = [];

  for (const p of prevList) {
    if (isRasxodZap(p)) {
      const i = nextRasxod.findIndex((n) => nameOf(n) === nameOf(p) && priceOf(n) === priceOf(p));
      if (i >= 0) nextRasxod.splice(i, 1);
      else removed.push(p);
      continue;
    }
    let i = hasId(p) ? nextRegular.findIndex((n) => hasId(n) && String(n.id) === String(p.id)) : -1;
    if (i < 0) i = nextRegular.findIndex((n) => nameOf(n) === nameOf(p));
    if (i >= 0) nextRegular.splice(i, 1);
    else removed.push(p);
  }
  return removed;
}

// Olib tashlangan qatorlar ichidagi rasxodlarning jami summasi (kassaga qaytariladigan pul).
export function removedRasxodTotal(removed: ZapLike[]): number {
  return removed.filter(isRasxodZap).reduce((sum, z) => sum + priceOf(z), 0);
}

function toIso(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

// Arxiv qatorlarini quradi. `sana` — hisobotdagi tartib joyi saqlanishi uchun qator
// qo'shilgan vaqt (zap.vaqt), bo'lmasa buyurtma yaratilgan vaqt — olib tashlangan vaqt emas.
export function buildArchiveRows(
  order: ArchiveOrder,
  removed: ZapLike[],
  sabab: ArchiveReason,
): ZapArchiveInsert[] {
  return removed.map((z) => ({
    order_id: Number(order.id),
    zap: z,
    mashina: order.mashina || '',
    raqam: order.raqam || '',
    ism: order.ism || '',
    xodim: (isRasxodZap(z) ? z.xodim_nomi : order.qabul_xodim_nomi) || '',
    order_holat: order.holat ?? null,
    sana: toIso(z.vaqt) ?? toIso(order.created_at),
    sabab,
  }));
}
