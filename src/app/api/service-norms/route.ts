import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { normalizeServiceName } from '@/lib/points/norms';

export const dynamic = 'force-dynamic';

// Xizmat vaqt normalari — egasi shu yerdan "injektor tozalash 1 soat" deb belgilaydi.
// GET buyurtmalarda HAQIQATDA uchragan xizmat nomlarini ham qaytaradi, shunda egasi
// qaysi xizmat hali normasiz turganini ko'radi (normasiz = ball berilmaydi).

interface NormRow {
  id: number;
  nom_norm: string;
  nom_asl: string | null;
  brand: string | null;
  car_model: string | null;
  norma_daqiqa: number;
  izoh: string | null;
}

export async function GET() {
  try {
    const { data: norms, error: normErr } = await supabase
      .from('service_norms')
      .select('id, nom_norm, nom_asl, brand, car_model, norma_daqiqa, izoh')
      .order('nom_norm');
    if (normErr) throw new Error(normErr.message);

    // Buyurtmalarda ishlatilgan nomlar — eng muhimi shular (katalogdagi 621 nomning
    // ko'pi hech qachon ishlatilmagan).
    const { data: orders, error: ordErr } = await supabase
      .from('orders')
      .select('services')
      .limit(3000);
    if (ordErr) throw new Error(ordErr.message);

    const usage = new Map<string, { nom_asl: string; marta: number }>();
    for (const o of orders || []) {
      for (const s of (o.services || []) as Array<{ nom?: string }>) {
        const key = normalizeServiceName(s?.nom);
        if (!key) continue;
        const cur = usage.get(key);
        if (cur) cur.marta++;
        else usage.set(key, { nom_asl: (s.nom || '').trim(), marta: 1 });
      }
    }

    // Umumiy (brand/model belgilanmagan) normalar — ro'yxatda ko'rsatish uchun.
    const umumiy = new Map<string, number>();
    for (const n of (norms || []) as NormRow[]) {
      if (!n.brand && !n.car_model) umumiy.set(n.nom_norm, n.norma_daqiqa);
    }

    const services = Array.from(usage.entries())
      .map(([nom_norm, v]) => ({
        nom_norm,
        nom_asl: v.nom_asl,
        marta: v.marta,
        norma_daqiqa: umumiy.get(nom_norm) ?? null,
      }))
      .sort((a, b) => b.marta - a.marta);

    return NextResponse.json({ ok: true, norms: norms || [], services });
  } catch (err) {
    console.error('service-norms GET xatosi:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom_asl, brand, car_model, norma_daqiqa, izoh } = body as {
      nom_asl?: string;
      brand?: string | null;
      car_model?: string | null;
      norma_daqiqa?: number;
      izoh?: string | null;
    };

    const nom_norm = normalizeServiceName(nom_asl);
    if (!nom_norm) {
      return NextResponse.json({ ok: false, error: 'Xizmat nomi bo\'sh.' }, { status: 400 });
    }
    const minutes = Number(norma_daqiqa);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      return NextResponse.json({ ok: false, error: 'Norma 0 dan katta bo\'lishi kerak.' }, { status: 400 });
    }

    const row = {
      nom_norm,
      nom_asl: (nom_asl || '').trim(),
      brand: brand?.trim() || null,
      car_model: car_model?.trim() || null,
      norma_daqiqa: Math.round(minutes),
      izoh: izoh?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    // Mavjud yozuvni topib yangilaymiz, yo'q bo'lsa qo'shamiz.
    // (`upsert(onConflict)` bu yerda yaramaydi: unique indeks coalesce(brand,'')
    // ustiga qurilgan — PostgREST esa onConflict'ga oddiy ustun nomini kutadi.
    // Postgres'da null <> null, shuning uchun null'lar `.is()` bilan qidiriladi.)
    let q = supabase.from('service_norms').select('id').eq('nom_norm', nom_norm);
    q = row.brand === null ? q.is('brand', null) : q.eq('brand', row.brand);
    q = row.car_model === null ? q.is('car_model', null) : q.eq('car_model', row.car_model);
    const { data: existing, error: findErr } = await q.maybeSingle();
    if (findErr) throw new Error(findErr.message);

    if (existing?.id) {
      const { error: updErr } = await supabase.from('service_norms').update(row).eq('id', existing.id);
      if (updErr) throw new Error(updErr.message);
      return NextResponse.json({ ok: true, id: existing.id });
    }

    const { data, error } = await supabase.from('service_norms').insert([row]).select('id').single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('service-norms POST xatosi:', err);
    return NextResponse.json({ ok: false, error: 'Saqlashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'id kerak' }, { status: 400 });
    const { error } = await supabase.from('service_norms').delete().eq('id', Number(id));
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('service-norms DELETE xatosi:', err);
    return NextResponse.json({ ok: false, error: 'O\'chirishda xatolik' }, { status: 500 });
  }
}
