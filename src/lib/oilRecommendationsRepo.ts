import supabase from '@/lib/supabaseClient';
import { OilRecommendation } from '@/lib/geminiOilVision';

// ─────────────────────────────────────────────────────────────────────────────
// AI (Gemini) orqali topilgan mashina modeliga mos yog' tavsiyasi keshi
// (oil_recommendations). Bir marta bitta brand+model uchun AI'dan so'ralgan
// tavsiya shu yerda saqlanadi — keyingi safar bir xil model kelsa AI'ga
// murojaat qilinmay, darrov shu yerdan qaytariladi (tez + doim bir xil javob).
// Server-only.
// ─────────────────────────────────────────────────────────────────────────────

export interface CachedOilRecommendation extends OilRecommendation {
  id: number;
  brand: string;
  model: string;
  isElectric: boolean;
}

function fromRow(row: any): CachedOilRecommendation {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    isElectric: !!row.is_electric,
    motorYogTuri: row.motor_yog_turi || '',
    motorLitr: row.motor_litr != null ? Number(row.motor_litr) : null,
    korobkaYogTuri: row.korobka_yog_turi || '',
    korobkaLitr: row.korobka_litr != null ? Number(row.korobka_litr) : null,
    reduktorYogTuri: row.reduktor_yog_turi || null,
    reduktorLitr: row.reduktor_litr != null ? Number(row.reduktor_litr) : null,
    izoh: row.izoh || '',
  };
}

export async function getCachedOilRecommendation(
  brand: string,
  model: string
): Promise<CachedOilRecommendation | null> {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const b = brand.trim();
  const m = model.trim();
  if (!b || !m) return null;
  const { data, error } = await supabase
    .from('oil_recommendations')
    .select('*')
    .ilike('brand', b)
    .ilike('model', m)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? fromRow(data) : null;
}

export async function saveOilRecommendation(
  brand: string,
  model: string,
  isElectric: boolean,
  rec: OilRecommendation
): Promise<CachedOilRecommendation> {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const patch = {
    brand: brand.trim(),
    model: model.trim(),
    is_electric: isElectric,
    motor_yog_turi: rec.motorYogTuri || null,
    motor_litr: rec.motorLitr,
    korobka_yog_turi: rec.korobkaYogTuri || null,
    korobka_litr: rec.korobkaLitr,
    reduktor_yog_turi: rec.reduktorYogTuri,
    reduktor_litr: rec.reduktorLitr,
    izoh: rec.izoh || null,
    manba: 'ai',
    updated_at: new Date().toISOString(),
  };
  // brand+model bo'yicha unikal indeks bor — mavjud bo'lsa yangilanadi (masalan
  // avval elektromobil deb noto'g'ri aniqlangan bo'lsa, endi to'g'rilanadi).
  const { data, error } = await supabase
    .from('oil_recommendations')
    .upsert(patch, { onConflict: 'brand,model', ignoreDuplicates: false })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return fromRow(data);
}
