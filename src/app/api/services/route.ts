import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  const allowed = ['id', 'name', 'brand', 'car_model', 'price', 'stavka'];
  const clean: any = {};
  allowed.forEach(key => {
    if (b[key] !== undefined) clean[key] = b[key];
  });
  return clean;
}

// GET: Fetch all services or filter by car_model
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const carModel = searchParams.get('car_model');
    const brand = searchParams.get('brand');

    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      let query = supabase.from('services_list').select('*').range(page * pageSize, (page + 1) * pageSize - 1).order('brand', { ascending: true }).order('car_model', { ascending: true });

      if (carModel) {
        query = query.eq('car_model', carModel);
      }
      if (brand) {
        query = query.eq('brand', brand);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
      
      // Safety break to prevent infinite loop
      if (page > 50) hasMore = false; 
    }

    return NextResponse.json(allData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Upsert services (supports batch)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Ensure body is an array for batch upsert
    const servicesRaw = Array.isArray(body) ? body : [body];
    const services = servicesRaw.map(s => mapAppToDB(s));

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
