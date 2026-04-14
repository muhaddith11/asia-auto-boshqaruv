import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabase) {
      throw new Error("Supabase is not initialized. Check your environment variables.");
    }

    // 1. Fetch all cars
    const { data: cars, error: carsError } = await supabase
      .from('cars_list')
      .select('brand, name')
      .order('brand', { ascending: true })
      .order('name', { ascending: true });

    if (carsError) throw carsError;

    // 2. Fetch all services
    const { data: services, error: srvError } = await supabase
      .from('services_list')
      .select('brand, car_model, name, price')
      .order('name', { ascending: true });

    if (srvError) throw srvError;

    // 3. Build brands list
    const brandsSet = new Set<string>();
    cars?.forEach((c: any) => brandsSet.add(c.brand));
    // Also include brands from services that might not be in the cars_list
    services?.forEach((s: any) => { if(s.brand) brandsSet.add(s.brand); });
    
    // Default/Must-have brands if list is small
    ['Chevrolet', 'BYD', 'Kia', 'Hyundai', 'Daewoo', 'Lada'].forEach(b => brandsSet.add(b));
    
    const brands = Array.from(brandsSet).sort();

    // 4. Build catalog structure: Brand -> Model -> [ {name, price} ]
    const catalog: any = {};

    // First, initialize models for each brand from cars_list
    cars?.forEach((c: any) => {
      if (!catalog[c.brand]) catalog[c.brand] = {};
      if (!catalog[c.brand][c.name]) catalog[c.brand][c.name] = [];
    });

    // Then, populate services
    services?.forEach((s: any) => {
      const b = s.brand || 'Boshqa';
      const m = s.car_model || 'Umumiy';

      if (!catalog[b]) catalog[b] = {};
      if (!catalog[b][m]) catalog[b][m] = [];

      catalog[b][m].push({
        name: s.name,
        price: s.price
      });
    });

    // Cleanup: Remove empty models or ensure "Umumiy" exists for brands
    brands.forEach(b => {
      if (!catalog[b]) catalog[b] = { "Umumiy": [] };
      if (Object.keys(catalog[b]).length === 0) catalog[b]["Umumiy"] = [];
    });

    return NextResponse.json({ brands, catalog });

  } catch (error: any) {
    console.error('Bot Catalog API Error:', error);
    return NextResponse.json({ 
      error: error.message,
      brands: ['Chevrolet', 'BYD', 'Kia', 'Hyundai', 'Lada'], 
      catalog: {} 
    }, { status: 500 });
  }
}
