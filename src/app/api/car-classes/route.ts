import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { normalizeCarKey } from '@/lib/points/norms';

export const dynamic = 'force-dynamic';

// Mashina klassi koeffitsientlari — qimmat avtomobil va elektromobil ishi
// odatdagidan uzoqroq davom etadi. Yakuniy norma = bazaviy norma x koeffitsient.

export async function GET() {
  try {
    const { data: classes, error } = await supabase
      .from('car_classes')
      .select('id, brand_norm, car_model_norm, brand_asl, car_model_asl, klass, koeffitsient, izoh')
      .order('koeffitsient')
      .order('brand_asl');
    if (error) throw new Error(error.message);

    // Buyurtmalarda uchragan markalar — qaysi marka hali klasssiz turganini ko'rsatish uchun.
    const { data: orders, error: ordErr } = await supabase
      .from('orders')
      .select('mashina')
      .limit(3000);
    if (ordErr) throw new Error(ordErr.message);

    type ClassRow = { car_model_norm: string | null; brand_norm: string };
    const known = new Set(
      ((classes || []) as ClassRow[]).filter((c) => !c.car_model_norm).map((c) => c.brand_norm),
    );
    const missing = new Map<string, { asl: string; marta: number }>();
    for (const o of orders || []) {
      const brandAsl = String(o.mashina || '').trim().split(/\s+/)[0] || '';
      const key = normalizeCarKey(brandAsl);
      if (!key || known.has(key)) continue;
      const cur = missing.get(key);
      if (cur) cur.marta++;
      else missing.set(key, { asl: brandAsl, marta: 1 });
    }

    return NextResponse.json({
      ok: true,
      classes: classes || [],
      klasssiz: Array.from(missing.entries())
        .map(([brand_norm, v]) => ({ brand_norm, brand_asl: v.asl, marta: v.marta }))
        .sort((a, b) => b.marta - a.marta),
    });
  } catch (err) {
    console.error('car-classes GET xatosi:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brand_asl, car_model_asl, klass, koeffitsient } = body as {
      brand_asl?: string;
      car_model_asl?: string | null;
      klass?: string;
      koeffitsient?: number;
    };

    const brand_norm = normalizeCarKey(brand_asl);
    if (!brand_norm) {
      return NextResponse.json({ ok: false, error: 'Marka nomi bo\'sh.' }, { status: 400 });
    }
    const koef = Number(koeffitsient);
    if (!Number.isFinite(koef) || koef <= 0 || koef > 5) {
      return NextResponse.json({ ok: false, error: 'Koeffitsient 0 dan 5 gacha bo\'lsin.' }, { status: 400 });
    }

    const car_model_norm = normalizeCarKey(car_model_asl) || null;
    const row = {
      brand_norm,
      car_model_norm,
      brand_asl: (brand_asl || '').trim(),
      car_model_asl: car_model_asl?.trim() || null,
      klass: (klass || 'oddiy').trim(),
      koeffitsient: koef,
      updated_at: new Date().toISOString(),
    };

    // Postgres'da null <> null, shuning uchun null'lar `.is()` bilan qidiriladi.
    let q = supabase.from('car_classes').select('id').eq('brand_norm', brand_norm);
    q = car_model_norm === null ? q.is('car_model_norm', null) : q.eq('car_model_norm', car_model_norm);
    const { data: existing, error: findErr } = await q.maybeSingle();
    if (findErr) throw new Error(findErr.message);

    if (existing?.id) {
      const { error: updErr } = await supabase.from('car_classes').update(row).eq('id', existing.id);
      if (updErr) throw new Error(updErr.message);
      return NextResponse.json({ ok: true, id: existing.id });
    }

    const { data, error } = await supabase.from('car_classes').insert([row]).select('id').single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('car-classes POST xatosi:', err);
    return NextResponse.json({ ok: false, error: 'Saqlashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'id kerak' }, { status: 400 });
    const { error } = await supabase.from('car_classes').delete().eq('id', Number(id));
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('car-classes DELETE xatosi:', err);
    return NextResponse.json({ ok: false, error: 'O\'chirishda xatolik' }, { status: 500 });
  }
}
