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

    // 2. Fetch ALL services in pages until exhausted
    const services: any[] = [];
    let page = 0;
    const PAGE = 1000;
    while (true) {
      const { data: chunk, error: chunkErr } = await supabase
        .from('services_list')
        .select('brand, car_model, name, price')
        .order('id', { ascending: true })
        .range(page * PAGE, (page + 1) * PAGE - 1);
      if (chunkErr) throw chunkErr;
      if (!chunk || chunk.length === 0) break;
      services.push(...chunk);
      if (chunk.length < PAGE) break;
      page++;
      if (page > 20) break; // safety cap at 20k services
    }

    function toProperCase(str: string) {
      if (!str) return '';
      
      // Homoglyph normalization: replace Cyrillic lookalikes with Latin equivalents
      // This is crucial for brands like Chevrolet (Latin 'e' vs Cyrillic 'е')
      const homoglyphs: Record<string, string> = {
        'е': 'e', 'а': 'a', 'о': 'o', 'с': 'c', 'р': 'p', 'х': 'x',
        'Е': 'E', 'А': 'A', 'О': 'O', 'С': 'C', 'Р': 'P', 'Х': 'X'
      };
      
      let clean = str.replace(/[еаосрхЕАОСРХ]/g, m => homoglyphs[m] || m);
      
      // Fix common typo: 'Chevolet' -> 'Chevrolet'
      clean = clean.replace(/Chevolet/gi, 'Chevrolet');

      
      // Aggressive cleanup: remove non-breaking spaces and other weird whitespace
      clean = clean.replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ').trim();
      
      if (!clean) return '';
      return clean.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }


    // 3. build catalog with normalization
    const normalizedCatalog: any = {};
    const brandsSet = new Set<string>();

    // Process services first (as they contain the actual data)
    services?.forEach((s: any) => {
      // "UMUMIY" brandli xizmatlar botda ko'rsatilmaydi
      if (!s.brand || s.brand.toUpperCase() === 'UMUMIY') return;

      const b = toProperCase(s.brand || 'Boshqa');
      const m = toProperCase(s.car_model || 'Umumiy');
      
      if (!normalizedCatalog[b]) normalizedCatalog[b] = {};
      if (!normalizedCatalog[b][m]) normalizedCatalog[b][m] = [];

      // Upsert by name — latest row (highest id, sorted asc) wins
      const existingIdx = normalizedCatalog[b][m].findIndex((existing: any) =>
        existing.name.trim().toUpperCase() === s.name.trim().toUpperCase()
      );
      if (existingIdx >= 0) {
        normalizedCatalog[b][m][existingIdx] = { name: s.name, price: s.price };
      } else {
        normalizedCatalog[b][m].push({ name: s.name, price: s.price });
      }
      brandsSet.add(b);
    });

    // Add brands/models from cars_list if they didn't have services yet
    cars?.forEach((c: any) => {
      // "UMUMIY" brandli mashinalar botda ko'rsatilmaydi
      if (!c.brand || c.brand.toUpperCase() === 'UMUMIY') return;

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
      version: "v13_stable_parts",
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
