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
    // Orders table uses lowercase 'createdat', others might use 'created_at'
    b.createdat = b.createdAt;
    b.created_at = b.createdAt; // Set both just in case, PG will ignore extra if not in request
    delete b.createdAt;
  }
  return b;
}

export async function GET() {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const mapped = (data ?? []).map(mapRowToApp);
  return NextResponse.json(mapped);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dbBody = mapAppToDB(body);
    const { data, error } = await supabase.from('orders').insert([dbBody]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const created = (data && data[0]) ?? null;
    return NextResponse.json(mapRowToApp(created), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
