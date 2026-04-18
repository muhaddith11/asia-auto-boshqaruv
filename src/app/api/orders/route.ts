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
  // Calculate chegirma from total and final since the DB column is missing
  r.chegirma = (r.total || 0) - (r.final || 0);
  return r;
}

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  
  // Clean up fields that don't exist in Supabase 'orders' table
  const fieldsToRemove = ['createdAt', 'chegirma', 'chegirmaFoiz', 'subTotal', 'finalTotal'];
  
  if (b.createdAt !== undefined) {
    b.createdat = b.createdAt;
    b.created_at = b.createdAt;
  }

  fieldsToRemove.forEach(f => {
    if (f in b) delete b[f];
  });

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
