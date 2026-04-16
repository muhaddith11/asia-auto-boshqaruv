import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mapRowToApp(row: any) {
  if (!row) return row;
  const r = { ...row } as any;
  const date = r.created_at || r.createdat;
  if (date !== undefined) {
    r.createdAt = date;
  }
  return r;
}

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  if (b.createdAt !== undefined) {
    b.createdat = b.createdAt;
    b.created_at = b.createdAt;
    delete b.createdAt;
  }
  return b;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const body = await request.json();
    const dbBody = mapAppToDB(body);
    const { data, error } = await supabase.from('orders').update(dbBody).eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapRowToApp((data && data[0]) ?? null));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const { data, error } = await supabase.from('orders').delete().eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: mapRowToApp((data && data[0]) ?? null) });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
