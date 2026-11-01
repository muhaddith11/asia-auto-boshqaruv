import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { logAudit } from '@/lib/audit';
import { changeKassa, salaryDelta, type KassaBalance } from '@/lib/kassa';
import { FULL_ACCESS, requireRole, requireSection } from '@/lib/routeGuard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireSection(request, 'reports');
  if (guard.denied) return guard.denied;

  const { data, error } = await supabase
    .from('salaries')
    .select('*')
    .order('date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const guard = await requireRole(request, FULL_ACCESS);
  if (guard.denied) return guard.denied;

  try {
    const body = await request.json();

    // Whitelist and map fields correctly
    const cleanBody = {
      worker_id: body.worker_id,
      amount: body.amount,
      method: body.method || 'naqd',
      date: body.date || new Date().toISOString().split('T')[0],
      comment: body.comment || ''
    };

    const { data, error } = await supabase
      .from('salaries')
      .insert([cleanBody])
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Yozuv va kassa birga: kassa o'zgarmasa yozuv ham qolmaydi.
    const delta = salaryDelta(cleanBody);
    let kassa: KassaBalance | null = null;
    if (delta) {
      try {
        kassa = await changeKassa(delta);
      } catch (kassaErr) {
        console.error('❌ Maosh: kassa yangilanmadi:', kassaErr);
        await supabase.from('salaries').delete().eq('id', data.id);
        return NextResponse.json({ error: 'Kassa yangilanmadi' }, { status: 500 });
      }
    }

    await logAudit({
      req: request,
      action: 'salary',
      entity: 'salary',
      entityId: data?.id,
      details: { worker_id: cleanBody.worker_id, amount: cleanBody.amount, method: cleanBody.method, kassa: kassa ?? undefined },
    });
    return NextResponse.json({ ...data, kassa });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
