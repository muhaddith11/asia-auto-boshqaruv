import supabase from '@/lib/supabaseClient';
import { fetchAllRows } from '@/lib/fetchAllRows';
import {
  buildArchiveRows,
  type ArchiveOrder, type ArchiveReason, type ArchivedZap, type ZapLike,
} from '@/lib/zapArchive';

// ─────────────────────────────────────────────────────────────────────────────
// zap_archive jadvali (db/zap_archive.sql) bilan ishlash — server-only.
// Jadval faqat QO'SHILADI: bu yerda hech qachon update/delete yo'q.
// ─────────────────────────────────────────────────────────────────────────────

const TABLE = 'zap_archive';

// Olib tashlangan qatorlarni arxivga yozadi. Asosiy amalni (buyurtmani saqlash)
// BLOKLAMAYDI — xatolik bo'lsa faqat konsolga yozadi (stock.ts / audit.ts kabi).
export async function archiveRemovedZaps(
  order: ArchiveOrder,
  removed: ZapLike[],
  sabab: ArchiveReason,
): Promise<void> {
  if (removed.length === 0) return;
  try {
    if (!supabase) return;
    const { error } = await supabase.from(TABLE).insert(buildArchiveRows(order, removed, sabab));
    if (error) console.error(`❌ ${TABLE} ga yozishda xatolik (buyurtma #${order.id}):`, error);
  } catch (e) {
    console.error(`❌ ${TABLE} ga yozishda xatolik (buyurtma #${order.id}):`, e);
  }
}

type DbRow = Record<string, unknown>;

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const optStr = (v: unknown) => (v === null || v === undefined || v === '' ? null : String(v));

// bigint/numeric ustunlar ba'zan satr bo'lib keladi — sonlarga keltiramiz.
function toArchived(row: DbRow): ArchivedZap {
  return {
    id: Number(row.id),
    order_id: Number(row.order_id),
    zap: (row.zap && typeof row.zap === 'object' ? row.zap : {}) as ZapLike,
    mashina: str(row.mashina),
    raqam: str(row.raqam),
    ism: str(row.ism),
    xodim: str(row.xodim),
    order_holat: optStr(row.order_holat),
    sana: optStr(row.sana),
    sabab: row.sabab === 'buyurtma_ochirildi' ? 'buyurtma_ochirildi' : 'tahrirlandi',
    removed_at: str(row.removed_at),
  };
}

export async function listArchivedZaps(): Promise<ArchivedZap[]> {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const rows = await fetchAllRows<DbRow>((from, to, withCount) =>
    (withCount ? supabase.from(TABLE).select('*', { count: 'exact' }) : supabase.from(TABLE).select('*'))
      .order('id', { ascending: false })
      .range(from, to));
  return rows.map(toArchived);
}
