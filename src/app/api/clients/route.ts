import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mapRowToApp(row: any) {
  if (!row) return row;
  return { ...row };
}

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  // Remove fields not present in Supabase 'clients' table
  const allowed = ['id', 'ism', 'tel', 'mashina', 'raqam', 'vin', 'tashriflar', 'jami', 'qarzdorlik', 'created_at', 'createdat'];
  Object.keys(b).forEach(key => {
    if (!allowed.includes(key)) {
      delete b[key];
    }
  });
  return b;
}

export async function GET() {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapRowToApp));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("DEBUG: Incoming Client Body:", body);
    const dbBody = mapAppToDB(body);
    console.log("DEBUG: Mapped DB Body:", dbBody);
    
    const { data, error } = await supabase.from('clients').insert([dbBody]).select();
    
    if (error) {
      console.error("DEBUG: Supabase Client Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("DEBUG: Supabase Result:", data ? data[0] : 'No data');
    return NextResponse.json(mapRowToApp((data && data[0]) ?? null), { status: 201 });
  } catch (err) {
    console.error("DEBUG: Client Route Catch Error:", err);
    return NextResponse.json({ error: 'Invalid JSON or server error' }, { status: 400 });
  }
}
