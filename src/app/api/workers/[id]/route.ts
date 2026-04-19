import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const WORKER_COLUMNS = 'id, ism, familiya, tel, mutax, foiz, status, role, telegram, login, parol, "shareType", "parentId", created_at';

function mapRowToApp(row: any) {
  if (!row) return row;
  const r = { ...row } as any;
  const date = r.created_at || r.createdat;
  if (date !== undefined) {
    r.createdAt = date;
    r.createdat = date; // Support both for safety
  }
  return r;
}

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  const allowed = ['id', 'ism', 'familiya', 'tel', 'mutax', 'foiz', 'status', 'role', 'telegram', 'login', 'parol', 'shareType', 'parentId'];
  const clean: any = {};
  allowed.forEach(key => {
    if (b[key] !== undefined) clean[key] = b[key];
  });
  return clean;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const body = await request.json();
    const dbBody = mapAppToDB(body);
    
    // Explicitly select only available columns
    const { data, error } = await supabase.from('workers').update(dbBody).eq('id', id).select(WORKER_COLUMNS);
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const updated = (data && data[0]) ?? null;
    return NextResponse.json(mapRowToApp(updated));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return PATCH(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    
    // Explicitly select response columns
    const { data, error } = await supabase.from('workers').delete().eq('id', id).select(WORKER_COLUMNS);
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const deleted = (data && data[0]) ?? null;
    return NextResponse.json({ success: true, deleted: mapRowToApp(deleted) });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
