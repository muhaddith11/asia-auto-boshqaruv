import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const catalogPath = path.join(process.cwd(), 'src/app/api/bot-ui/catalog/route.ts');
    const content = fs.readFileSync(catalogPath, 'utf-8');

    const startMatch = content.indexOf('const data = {');
    const endMatch = content.lastIndexOf('};');
    
    if (startMatch === -1 || endMatch === -1) {
      return NextResponse.json({ error: 'Catalog data could not be found' }, { status: 500 });
    }

    const jsonStr = content.substring(startMatch + 'const data = '.length, endMatch + 1);
    
    // We can use a trick to evaluate the catalog object safely-ish in this context
    const data = (new Function(`return ${jsonStr}`))();
    const catalog = data.catalog;

    const carsToInsert: { name: string, brand: string }[] = [];

    for (const brand in catalog) {
      for (const model in catalog[brand]) {
        carsToInsert.push({
          name: model.trim(),
          brand: brand.trim()
        });
      }
    }

    // Filter duplicates locally just in case
    const uniqueCarsMap = new Map();
    carsToInsert.forEach(car => uniqueCarsMap.set(car.name, car));
    const finalCars = Array.from(uniqueCarsMap.values());

    // Chunked upsert
    const chunkSize = 50;
    let successCount = 0;
    for (let i = 0; i < finalCars.length; i += chunkSize) {
      const chunk = finalCars.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('cars_list')
        .upsert(chunk, { onConflict: 'name' });

      if (error) {
        console.error(`Chunk error at ${i}:`, error);
      } else {
        successCount += chunk.length;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${successCount} car models migrated successfully`,
      totalFound: finalCars.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
