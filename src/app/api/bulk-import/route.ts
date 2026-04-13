import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

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

export async function GET() {
  const log: string[] = [];

  try {
    // 1. Get 'Boshqalar' category ID
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Boshqalar')
      .single();

    if (catError || !category) {
      return NextResponse.json({ ok: false, error: 'Category not found', catError });
    }

    const categoryId = category.id;
    log.push(`Category ID: ${categoryId}`);

    for (const modelName of carModels) {
      // 2. Insert car (if not exists)
      let { data: car } = await supabase
        .from('cars')
        .select('id')
        .eq('name', modelName)
        .eq('category_id', categoryId)
        .maybeSingle();

      if (!car) {
        const { data: newCar, error: carInsertError } = await supabase
          .from('cars')
          .insert({ name: modelName, category_id: categoryId })
          .select()
          .single();
        
        if (carInsertError) {
          log.push(`Error car ${modelName}: ${carInsertError.message}`);
          continue;
        }
        car = newCar;
      }

      // 3. Insert services
      if (car) {
        const servicesToInsert = standardServices.map(s => ({
          car_id: car!.id,
          name: s.name,
          price: s.price
        }));

        const { error: sError } = await supabase
          .from('services')
          .insert(servicesToInsert);

        if (sError) {
          log.push(`Error services for ${modelName}: ${sError.message}`);
        } else {
          log.push(`Success: ${modelName}`);
        }
      }
    }

    return NextResponse.json({ ok: true, log });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
