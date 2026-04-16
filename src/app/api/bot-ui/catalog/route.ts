import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!supabase) {
      throw new Error("Supabase ulanishi mavjud emas. ENV o'zgaruvchilarini tekshiring.");
    }

    // 1. Fetch all cars
    const { data: cars, error: carsError } = await supabase
      .from('cars_list')
      .select('brand, name')
      .range(0, 2000)
      .order('brand', { ascending: true });

    if (carsError) throw carsError;

    // 2. Fetch all services
    const { data: services, error: srvError } = await supabase
      .from('services_list')
      .select('brand, car_model, name, price')
      .range(0, 10000)
      .order('car_model', { ascending: true });

    if (srvError) throw srvError;

    // 3. Build brands list
    const brandsSet = new Set<string>();
    cars?.forEach((c: any) => brandsSet.add(c.brand));
    const brands = Array.from(brandsSet).sort();

    // 4. Build catalog
    const catalog: any = {};
    services?.forEach((s: any) => {
      const b = s.brand;
      const m = s.car_model;

      if (!catalog[b]) catalog[b] = {};
      if (!catalog[b][m]) catalog[b][m] = [];

      catalog[b][m].push({
        name: s.name,
        price: s.price
      });
    });

    return new NextResponse(JSON.stringify({ 
      version: "v3_final_check",
      count: { cars: cars?.length, services: services?.length },
      brands, 
      catalog 
    }), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });

  } catch (error: any) {
    console.error('❌ Bot Catalog API Error:', error);
    return NextResponse.json({ error: error.message, catalog: {}, brands: [] }, { status: 500 });
  }
}
