import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('🚗 API_CARS: Mashinalarni bazadan olish boshlandi...');
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
    
    console.log(`✅ API_CARS: Muvaffaqiyatli! ${data?.length || 0} ta mashina topildi.`);
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
