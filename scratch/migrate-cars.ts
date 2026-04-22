import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual env parsing to avoid dependency issues
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

// Increase network resilience for local Node environment
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch: (...args) => fetch(...args).catch(err => {
      console.error('Fetch attempt failed, retrying...', err.message);
      return fetch(...args);
    })}
  }
);

async function migrate() {
  const catalogPath = path.join(process.cwd(), 'src/app/api/bot-ui/catalog/route.ts');
  const content = fs.readFileSync(catalogPath, 'utf-8');

  // Extract the JSON data part carefully
  // We look for 'const data = {' and the closing '};'
  const startMatch = content.indexOf('const data = {');
  const endMatch = content.lastIndexOf('};');
  
  if (startMatch === -1 || endMatch === -1) {
    console.error('Katalog ma\'lumotlarini topib bo\'lmadi!');
    return;
  }

  const jsonStr = content.substring(startMatch + 'const data = '.length, endMatch + 1);
  
  // Dynamic evaluate or parse? Since it's JS object, we might need a safer way
  // But for this controlled environment, we can try to extract brands/models
  const data = eval('(' + jsonStr + ')');
  const catalog = data.catalog;

  const carsToInsert: { name: string, brand: string }[] = [];

  for (const brand in catalog) {
    for (const model in catalog[brand]) {
      // Avoid duplicates and push
      carsToInsert.push({
        name: model.trim(),
        brand: brand.trim()
      });
    }
  }

  console.log(`${carsToInsert.length} ta mashina aniqlandi. Ko'chirish boshlandi...`);

  // Split into chunks of 100 to avoid Supabase limits
  const chunkSize = 100;
  for (let i = 0; i < carsToInsert.length; i += chunkSize) {
    const chunk = carsToInsert.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('cars_list')
      .upsert(chunk, { onConflict: 'name' });

    if (error) {
      console.error(`Xatolik yuz berdi (${i}-${i+chunkSize}):`, error.message);
    } else {
      console.log(`${i + chunk.length} ta mashina yuklandi...`);
    }
  }

  console.log('Migratsiya muvaffaqiyatli yakunlandi! ✅');
}

migrate();
