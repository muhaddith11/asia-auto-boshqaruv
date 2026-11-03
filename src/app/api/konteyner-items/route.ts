import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { tekshirQolItem } from '@/lib/konteyner';

export const dynamic = 'force-dynamic';

// 3D konteyner omboriga tashqaridan olib kelinib qo'lda qo'yilgan zapchastlar.
// Ombor (parts), kassa va hisobotlarga aralashmaydi — db/konteyner_items.sql.
const COLS = 'id, javon, nom, narx, soni, ogirlik, izoh, javon_tur, created_at';

export async function GET() {
  const { data, error } = await supabase
    .from('konteyner_items')
    .select(COLS)
    .order('javon', { ascending: true })
    .order('nom', { ascending: true })
    .range(0, 5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const checked = tekshirQolItem(body, true);
  if ('error' in checked) return NextResponse.json({ error: checked.error }, { status: 400 });

  const { data, error } = await supabase.from('konteyner_items').insert([checked.data]).select(COLS).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
