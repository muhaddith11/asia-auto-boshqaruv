import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { FULL_ACCESS, readJsonObject, requireRole, requireSection } from '@/lib/routeGuard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireSection(request, 'reports');
  if (guard.denied) return guard.denied;

  const { data, error } = await supabase.from('kassa').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || { naqd: 0, karta: 0 });
}

// Qoldiqni tashqaridan yozib bo'lmaydi: kassa faqat operatsiya, maosh va to'lov
// orqali o'zgaradi (@/lib/kassa). Yangilanishdan oldin ochilgan eski tablar shu
// yerga absolyut raqam yuborishda davom etadi — ular e'tiborga olinmaydi, joriy
// qoldiq qaytadi. Yagona istisno: "Kassani nolga tushirish" tugmasi.
export async function POST(request: NextRequest) {
  const guard = await requireRole(request, FULL_ACCESS);
  if (guard.denied) return guard.denied;

  const body = await readJsonObject(request);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  if (body.reset !== true) {
    const { data, error } = await supabase.from('kassa').select('*').eq('id', 1).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('kassa')
    .update({ naqd: 0, karta: 0, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit({ req: request, action: 'update', entity: 'kassa', entityId: 1, details: { reset: true } });
  return NextResponse.json(data);
}
