import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  // Standardized columns for comprehensive inventory management
  const allowed = [
    'nom', 'narx', 'mashina', 'sebestoimost', 'balance', 
    'bir', 'kat', 'supplier', 'min_qoldiq', 'artikul', 'soni', 'sotuv'
  ];
  const clean: any = {};
  allowed.forEach(key => {
    if (b[key] !== undefined) clean[key] = b[key];
  });
  return clean;
}

export async function GET() {
  const { data, error } = await supabase.from('parts').select('*').range(0, 10000).order('nom', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dbBody = mapAppToDB(body);
    const { data, error } = await supabase.from('parts').insert([dbBody]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data && data[0]) ?? null, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
