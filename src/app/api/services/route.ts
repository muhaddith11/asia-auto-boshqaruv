import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch all services or filter by car_model
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const carModel = searchParams.get('car_model');
    const brand = searchParams.get('brand');

    let query = supabase.from('services_list').select('*').order('name', { ascending: true });

    if (carModel) {
      query = query.eq('car_model', carModel);
    }
    if (brand) {
      query = query.eq('brand', brand);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Upsert services (supports batch)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Ensure body is an array for batch upsert
    const services = Array.isArray(body) ? body : [body];

    const { data, error } = await supabase
      .from('services_list')
      .upsert(services, { onConflict: 'name,brand,car_model' }) // Unique constraint should be on these
      .select();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
