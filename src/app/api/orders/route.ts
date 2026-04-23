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
  
  // Safe mapping for status/holat
  if (b.holat !== undefined) {
    b.status = b.holat;
  }

  const fieldsToRemove = [
    'createdAt', 'created_at', 'createdat', 
    'chegirmaFoiz', 'subTotal', 'finalTotal',
    'print_status'
  ];
  
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
    
    // Map application fields to database schema
    const dbBodyRaw = mapAppToDB(body);
    
    // Whitelist
    const whitelist = [
      'ism', 'tel', 'mashina', 'raqam', 'vin', 'yil', 'km', 'muammo',
      'srv', 'zap', 'total', 'final', 'holat', 'sana',
      'services', 'zaps', 'zarplata', 'pribil'
    ];
    
    const dbBody: any = {};
    whitelist.forEach(key => {
      if (dbBodyRaw[key] !== undefined) dbBody[key] = dbBodyRaw[key];
    });

    const { data, error } = await supabase.from('orders').insert([dbBody]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const created = (data && data[0]) ?? null;
    return NextResponse.json(mapRowToApp(created), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
