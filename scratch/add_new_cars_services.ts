import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read env variables manually
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

const carModels = [
  "Jac J7", "Jac M4", "Deepal S7", "Foton", "Skoda Kodiq", "Im Motors L7", 
  "Nissan Altima", "Range Rover Velar", "Wuling Baojun", "Hongqi HS7", 
  "Jaguar", "Porsche Taycan", "Dong Feng 008", "Shineray T30", "I Car 03", 
  "Denza N9", "Lynk & Co 900", "Mazda 6", "Dong Feng Aeolus"
];

const standardServices = [
  { name: "🔍 Diagnostika", price: 100000 },
  { name: "⛽ Benzin sistemasini ko'rish", price: 700000 },
  { name: "🚫 Tabloda datchik o'chirish", price: 100000 },
  { name: "🕯️ Svechalarni almashtirish", price: 100000 },
  { name: "🌀 Drosil tozalash", price: 100000 },
  { name: "💉 Injector tozalash", price: 600000 },
  { name: "🛣️ Probeg tekshirish", price: 100000 },
  { name: "💻 Programma yozish", price: 800000 },
  { name: "🚀 Stage urish", price: 600000 },
  { name: "⛽ Gaz regulirovka", price: 100000 },
  { name: "⛽ Benzin nasos ko'rish", price: 150000 },
  { name: "🧵 Simlarni to'g'irlash", price: 200000 },
  { name: "🇷🇺 Russifikatsiya (Rus tilida qilish)", price: 1200000 },
  { name: "📱 Prilojeniye (Ilovalar) o'rnatish", price: 300000 }
];

async function addCarsAndServices() {
  console.log("Adding cars and services...");

  // 1. Get 'Boshqalar' category ID
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Boshqalar')
    .single();

  if (catError || !category) {
    console.error("Error finding 'Boshqalar' category:", catError);
    return;
  }

  const categoryId = category.id;
  console.log(`Category 'Boshqalar' ID: ${categoryId}`);

  for (const modelName of carModels) {
    // 2. Check if car already exists
    let { data: car, error: carSelectError } = await supabase
      .from('cars')
      .select('id')
      .eq('name', modelName)
      .eq('category_id', categoryId)
      .maybeSingle();

    if (!car) {
      // 3. Insert car
      const { data: newCar, error: carInsertError } = await supabase
        .from('cars')
        .insert({ name: modelName, category_id: categoryId })
        .select()
        .single();
      
      if (carInsertError || !newCar) {
        console.error(`Error inserting car ${modelName}:`, carInsertError);
        continue;
      }
      car = newCar;
      console.log(`Car added: ${modelName} (ID: ${car.id})`);
    } else {
      console.log(`Car already exists: ${modelName} (ID: ${car.id})`);
    }

    // 4. Insert services for this car
    for (const service of standardServices) {
      const { error: serviceError } = await supabase
        .from('services')
        .insert({
          car_id: car.id,
          name: service.name,
          price: service.price
        });
      
      if (serviceError) {
        console.error(`Error inserting service ${service.name} for ${modelName}:`, serviceError);
      }
    }
    console.log(`Services added for ${modelName}.`);
  }

  console.log("Batch insertion completed!");
}

addCarsAndServices();
