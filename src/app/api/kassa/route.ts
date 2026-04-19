import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase.from('kassa_state').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || { naqd: 0, karta: 0 });
}

export async function POST(request: NextRequest) {
  try {
    const { naqd, karta } = await request.json();
    const { data, error } = await supabase
      .from('kassa_state')
      .upsert({ id: 1, naqd, karta, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
