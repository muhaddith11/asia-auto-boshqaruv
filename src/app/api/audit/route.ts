import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server tomon pagination + sana filtri bilan audit loglarini qaytaradi.
// Query: ?page=1&limit=50&from=YYYY-MM-DD&to=YYYY-MM-DD&entity=order&action=delete
export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'DB ulanmagan' }, { status: 500 });

  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '50', 10)));
  const from = sp.get('from');
  const to = sp.get('to');
  const entity = sp.get('entity');
  const action = sp.get('action');

  const fromIdx = (page - 1) * limit;
  const toIdx = fromIdx + limit - 1;

  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (from) query = query.gte('created_at', `${from}T00:00:00`);
  if (to) query = query.lte('created_at', `${to}T23:59:59`);
  if (entity) query = query.eq('entity', entity);
  if (action) query = query.eq('action', action);

  const { data, error, count } = await query.range(fromIdx, toIdx);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
  });
}
