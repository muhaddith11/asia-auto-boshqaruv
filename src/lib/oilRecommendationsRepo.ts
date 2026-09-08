import supabase from '@/lib/supabaseClient';
import { OilRecommendation, VehicleType } from '@/lib/geminiOilVision';

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
  vehicleType: VehicleType;
}

function fromRow(row: any): CachedOilRecommendation {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    vehicleType: (row.vehicle_type as VehicleType) || 'ICE',
    motorYogTuri: row.motor_yog_turi || null,
    motorLitr: row.motor_litr != null ? Number(row.motor_litr) : null,
    korobkaYogTuri: row.korobka_yog_turi || null,
    korobkaLitr: row.korobka_litr != null ? Number(row.korobka_litr) : null,
    reduktorYogTuri: row.reduktor_yog_turi || null,
    reduktorLitr: row.reduktor_litr != null ? Number(row.reduktor_litr) : null,
    izoh: row.izoh || '',
  };
}

export async function getCachedOilRecommendation(
  brand: string,
  model: string,
  vehicleType: VehicleType
): Promise<CachedOilRecommendation | null> {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const b = brand.trim();
  const m = model.trim();
  if (!b || !m) return null;
  // vehicle_type ham kalitga kiradi — bir xil model nomi ICE'da ham,
  // gibridda ham bo'lishi mumkin (masalan Panamera / Panamera 4 E-Hybrid),
  // ular uchun tavsiya butunlay boshqa.
  const { data, error } = await supabase
    .from('oil_recommendations')
    .select('*')
    .ilike('brand', b)
    .ilike('model', m)
    .eq('vehicle_type', vehicleType)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? fromRow(data) : null;
}

export async function saveOilRecommendation(
  brand: string,
  model: string,
  vehicleType: VehicleType,
  rec: OilRecommendation
): Promise<CachedOilRecommendation> {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const patch = {
    brand: brand.trim(),
    model: model.trim(),
    vehicle_type: vehicleType,
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
  // brand+model+vehicle_type bo'yicha unikal indeks bor — mavjud bo'lsa yangilanadi.
  const { data, error } = await supabase
    .from('oil_recommendations')
    .upsert(patch, { onConflict: 'brand,model,vehicle_type', ignoreDuplicates: false })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return fromRow(data);
}
