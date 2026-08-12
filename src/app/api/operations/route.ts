import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { logAudit } from '@/lib/audit';
import { fetchAllRows } from '@/lib/fetchAllRows';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const from = sp.get('from');
  const to = sp.get('to');
  const pageParam = sp.get('page');
  const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '50', 10)));

  let query = supabase.from('operations').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  if (pageParam) {
    const page = Math.max(1, parseInt(pageParam, 10));
    const fromIdx = (page - 1) * limit;
    const { data, error, count } = await query.range(fromIdx, fromIdx + limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    });
  }

  // ⚠️ MUHIM: Supabase bitta so'rovda ko'pi bilan 1000 qator qaytaradi.
  // Operatsiyalar 1000 dan oshgani uchun eskilari tushib qolib, kassa va
  // hisobotlar xato hisoblanardi. Barchasini bo'laklab yuklaymiz — bo'laklar
  // PARALLEL so'raladi (fetchAllRows), ilgarigi ketma-ket sikl emas.
  try {
    const all = await fetchAllRows<any>((fromIdx, toIdx, withCount) => {
      let q = withCount
        ? supabase.from('operations').select('*', { count: 'exact' })
        : supabase.from('operations').select('*');
      q = q.order('created_at', { ascending: false });
      if (from) q = q.gte('date', from);
      if (to) q = q.lte('date', to);
      return q.range(fromIdx, toIdx);
    });
    return NextResponse.json(all);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Operatsiyalarni yuklashda xatolik' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Bazada borligi aniq bo'lgan ustunlarni saralab olamiz
    const cleanBody: any = {
      date: body.date,
      type: body.type,
      amount: body.amount,
      category: body.category,
      comment: body.comment || '',
      method: body.method || 'naqd',
      source: body.source || 'manual',
      tomethod: body.toMethod || body.tomethod || null,
    };
    
    const { data, error, status } = await supabase
      .from('operations')
      .insert([cleanBody])
      .select()
      .single();

    if (error) {
       console.error("❌ Supabase Operations Error:", error);
       return NextResponse.json({
         error: error.message,
         details: error.details,
         hint: error.hint,
         status: status
       }, { status: 500 });
    }

    await logAudit({
      req: request,
      action: cleanBody.type === 'transfer' ? 'transfer' : 'create',
      entity: 'operation',
      entityId: data?.id,
      details: { type: cleanBody.type, amount: cleanBody.amount, category: cleanBody.category, method: cleanBody.method },
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Operations Handler Error:", err);
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 });
  }
}
