import supabase from '@/lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Yog' narxlari (oil_prices) bilan ishlash — DB mantiqi.
// Zapchastlar katalogi (spare_parts)dan ATAYLAB ALOHIDA: bu yerda HAR ikkala
// narx ham bor — narx (sotish) VA tannarx (sotib olish), chunki yog' bo'limida
// "xizmat" tushunchasi yo'q — foyda faqat narx−tannarx farqidan olinadi.
// Server-only. Kirish tekshiruvi (boshliq) route darajasida bo'ladi.
// ─────────────────────────────────────────────────────────────────────────────

export type OilTuri = 'yog' | 'yog_filtri' | 'salon_filtri';
const ALLOWED_TURI: OilTuri[] = ['yog', 'yog_filtri', 'salon_filtri'];

const ALLOWED_FIELDS = ['turi', 'nom', 'mashina', 'narx', 'tannarx'] as const;

function clean(body: any) {
  const out: any = {};
  ALLOWED_FIELDS.forEach((k) => {
    if (body?.[k] !== undefined) out[k] = body[k];
  });
  if (out.turi !== undefined && !ALLOWED_TURI.includes(out.turi)) delete out.turi;
  if (out.narx !== undefined) out.narx = Number(out.narx) || 0;
  if (out.tannarx !== undefined) out.tannarx = Number(out.tannarx) || 0;
  if (out.mashina !== undefined) out.mashina = String(out.mashina || '').trim() || 'UMUMIY';
  return out;
}

// turi berilsa — faqat o'sha turdagi yozuvlar (masalan xodim tanlash ekrani uchun).
// berilmasa — hammasi (boshliq boshqaruvi uchun).
export async function listOilPrices(turi?: OilTuri | OilTuri[] | null) {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  let query = supabase.from('oil_prices').select('*').order('created_at', { ascending: false });
  if (turi) query = Array.isArray(turi) ? query.in('turi', turi) : query.eq('turi', turi);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createOilPrice(body: any) {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const patch = clean(body);
  if (!patch.turi) throw new Error("Turi noto'g'ri (yog / yog_filtri / salon_filtri)");
  if (!String(patch.nom || '').trim()) throw new Error('Nomi kerak');
  const { data, error } = await supabase.from('oil_prices').insert([patch]).select();
  if (error) throw new Error(error.message);
  return (data && data[0]) ?? null;
}

export async function updateOilPrice(id: number, body: any) {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const patch = clean(body);
  patch.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('oil_prices').update(patch).eq('id', id).select();
  if (error) throw new Error(error.message);
  return (data && data[0]) ?? null;
}

export async function deleteOilPrice(id: number) {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const { data, error } = await supabase.from('oil_prices').delete().eq('id', id).select();
  if (error) throw new Error(error.message);
  return (data && data[0]) ?? null;
}
