import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Faqat ruxsat etilgan ustunlar bazaga tushadi.
function mapAppToDB(body: any) {
  const b = { ...body } as any;
  const allowed = ['nom', 'artikul', 'brand', 'mashina', 'rasmlar', 'izoh'];
  const clean: any = {};
  allowed.forEach((key) => {
    if (b[key] !== undefined) clean[key] = b[key];
  });
  // rasmlar har doim massiv bo'lsin
  if (clean.rasmlar !== undefined && !Array.isArray(clean.rasmlar)) {
    clean.rasmlar = [];
  }
  return clean;
}

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Supabase sozlanmagan' }, { status: 500 });
  const { data, error } = await supabase
    .from('spare_parts')
    .select('*')
    .range(0, 10000)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Supabase sozlanmagan' }, { status: 500 });
  try {
    const body = await request.json();
    const dbBody = mapAppToDB(body);
    if (!dbBody.nom && !dbBody.artikul) {
      return NextResponse.json({ error: 'Nom yoki detal nomeri kerak' }, { status: 400 });
    }
    const { data, error } = await supabase.from('spare_parts').insert([dbBody]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data && data[0]) ?? null, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
