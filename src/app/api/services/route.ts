import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { fetchAllRows } from '@/lib/fetchAllRows';

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

    // ⚠️ services_list eng katta jadval (~4000 qator = 5 ta bo'lak).
    // Ilgari bo'laklar ketma-ket so'ralardi — jami ~2 soniya, ya'ni butun
    // loadInitialData shu so'rovni kutib turardi. Endi PARALLEL.
    const rows = await fetchAllRows<any>((fromIdx, toIdx, withCount) => {
      let query = withCount
        ? supabase.from('services_list').select('*', { count: 'exact' })
        : supabase.from('services_list').select('*');

      query = query
        .order('brand', { ascending: true })
        .order('car_model', { ascending: true })
        .order('id', { ascending: true }); // Added stable sort

      if (carModel) {
        query = query.eq('car_model', carModel);
      }
      if (brand) {
        query = query.eq('brand', brand);
      }

      return query.range(fromIdx, toIdx);
    }, 51);

    // id bo'yicha takrorlarni olib tashlaymiz (eski xulq saqlanadi)
    const uniqueData = new Map();
    rows.forEach((item: any) => uniqueData.set(item.id, item));

    return NextResponse.json(Array.from(uniqueData.values()));
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
      .insert(services)
      .select();


    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
