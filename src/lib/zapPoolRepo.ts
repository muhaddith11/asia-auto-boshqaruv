import supabase from '@/lib/supabaseClient';
import { fetchAllRows } from '@/lib/fetchAllRows';
import type { ChiqimInput, ZapPoolChiqim } from '@/lib/zapPool';

// ─────────────────────────────────────────────────────────────────────────────
// zap_puli_chiqim jadvali (db/zap_puli_chiqim.sql) bilan ishlash — server-only.
// Kassaga/operations'ga tegmaydi (bu pul kassada bo'lmagan).
// ─────────────────────────────────────────────────────────────────────────────

const TABLE = 'zap_puli_chiqim';

type DbRow = Record<string, unknown>;

function toChiqim(row: DbRow): ZapPoolChiqim {
  return {
    id: Number(row.id),
    summa: Number(row.summa) || 0,
    izoh: row.izoh === null || row.izoh === undefined ? '' : String(row.izoh),
    sana: String(row.sana ?? '').slice(0, 10),
    created_at: String(row.created_at ?? ''),
  };
}

export async function listZapPoolChiqim(): Promise<ZapPoolChiqim[]> {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const rows = await fetchAllRows<DbRow>((from, to, withCount) =>
    (withCount ? supabase.from(TABLE).select('*', { count: 'exact' }) : supabase.from(TABLE).select('*'))
      .order('id', { ascending: false })
      .range(from, to));
  return rows.map(toChiqim);
}

export async function createZapPoolChiqim(input: ChiqimInput, sana: string): Promise<ZapPoolChiqim> {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ summa: input.summa, izoh: input.izoh, sana }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toChiqim(data as DbRow);
}

// O'chirilgan qator (topilmasa null) — audit uchun summasi qaytariladi.
export async function deleteZapPoolChiqim(id: number): Promise<ZapPoolChiqim | null> {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select().maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toChiqim(data as DbRow) : null;
}
