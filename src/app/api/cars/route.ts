import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('cars_list')
      .select('*')
      .range(0, 10000)
      .order('brand', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ API_CARS: Supabase xatosi:', error);
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ API_CARS: Server xatosi:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('cars_list')
      .upsert(body, { onConflict: 'name' })
      .select();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
