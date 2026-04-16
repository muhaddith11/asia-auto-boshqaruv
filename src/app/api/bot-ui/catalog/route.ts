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
      .range(0, 5000)
      .order('brand', { ascending: true });

    if (carsError) throw carsError;

    // 2. Fetch all services (fetching in chunks to overcome the 1000 row limit)
    const [srv1, srv2, srv3] = await Promise.all([
      supabase.from('services_list').select('brand, car_model, name, price').range(0, 999),
      supabase.from('services_list').select('brand, car_model, name, price').range(1000, 1999),
      supabase.from('services_list').select('brand, car_model, name, price').range(2000, 2999)
    ]);

    const services = [
      ...(srv1.data || []),
      ...(srv2.data || []),
      ...(srv3.data || [])
    ];

    if (srv1.error) throw srv1.error;

    function toProperCase(str: string) {
      if (!str) return '';
      return str.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    // 3. build catalog with normalization
    const normalizedCatalog: any = {};
    const brandsSet = new Set<string>();

    // Process services first (as they contain the actual data)
    services?.forEach((s: any) => {
      const b = toProperCase(s.brand || 'Boshqa');
      const m = toProperCase(s.car_model || 'Umumiy');
      
      if (!normalizedCatalog[b]) normalizedCatalog[b] = {};
      if (!normalizedCatalog[b][m]) normalizedCatalog[b][m] = [];

      normalizedCatalog[b][m].push({
        name: s.name,
        price: s.price
      });
      brandsSet.add(b);
    });

    // Add brands/models from cars_list if they didn't have services yet
    cars?.forEach((c: any) => {
      const b = toProperCase(c.brand);
      const m = toProperCase(c.name);
      brandsSet.add(b);
      if (!normalizedCatalog[b]) normalizedCatalog[b] = {};
      if (!normalizedCatalog[b][m]) normalizedCatalog[b][m] = [];
    });

    // Cleanup: Filter out models that have 0 services if there are other models with services
    const finalCatalog: any = {};
    const finalBrands = Array.from(brandsSet).sort();

    finalBrands.forEach(b => {
      if (normalizedCatalog[b]) {
        const models = Object.keys(normalizedCatalog[b]);
        const brandObj: any = {};
        models.forEach(m => {
          if (normalizedCatalog[b][m] && normalizedCatalog[b][m].length > 0) {
            brandObj[m] = normalizedCatalog[b][m];
          }
        });
        
        // If brand exists but all models empty, at least show models
        if (Object.keys(brandObj).length === 0) {
           models.forEach(m => brandObj[m] = []);
        }
        finalCatalog[b] = brandObj;
      }
    });

    return new NextResponse(JSON.stringify({ 
      version: "v5_persistence_fix",
      count: { raw_cars: cars?.length, raw_services: services?.length },
      brands: finalBrands, 
      catalog: finalCatalog 
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
