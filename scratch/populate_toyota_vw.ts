import supabase from '../src/lib/supabaseClient';

async function run() {
  const toyotaModels = ['Corolla', 'Camry', 'Highlander', 'Grand Highlander', 'Hilux', 'BZ 3', 'LC 140', 'LC 200', 'LC 250', 'LC 300'];
  const vwModels = ['ID 3', 'ID 4', 'ID 6'];

  console.log('--- Step 1: Upserting Car Models ---');
  // Add Toyota models to cars_list
  for (const model of toyotaModels) {
    const { error } = await supabase.from('cars_list').upsert({ name: model, brand: 'Toyota' }, { onConflict: 'name' });
    if (error) console.error(`Error upserting ${model}:`, error.message);
  }
  console.log('Toyota models ensured.');

  const standardServices = [
    { name: '🔍 Diagnostika', prices: { 'Corolla': 50000, 'Camry': 50000, 'Highlander': 100000, 'Grand Highlander': 100000, 'Hilux': 50000, 'LC 140': 50000, 'LC 200': 100000, 'LC 250': 100000, 'LC 300': 100000 } },
    { name: '⛽ Benzin sistemasini ko\'rish', prices: { 'Corolla': 500000, 'Camry': 500000, 'Highlander': 1000000, 'Grand Highlander': 1000000, 'Hilux': 1000000, 'LC 140': 1000000, 'LC 200': 1000000, 'LC 250': 1000000, 'LC 300': 1000000 } },
    { name: '🚫 Tabloda datchik o\'chirish', prices: { 'Corolla': 50000, 'Camry': 50000, 'Highlander': 100000, 'Grand Highlander': 100000, 'Hilux': 100000, 'LC 140': 100000, 'LC 200': 100000, 'LC 250': 100000, 'LC 300': 100000 } },
    { name: '🕯️ Svechalarni almashtirish', prices: { 'Corolla': 100000, 'Camry': 100000, 'Highlander': 100000, 'Grand Highlander': 100000, 'Hilux': 100000, 'LC 140': 100000, 'LC 200': 100000, 'LC 250': 100000, 'LC 300': 100000 } },
    { name: '🌀 Drosil tozalash', prices: { 'Corolla': 80000, 'Camry': 80000, 'Highlander': 100000, 'Grand Highlander': 100000, 'Hilux': 100000, 'LC 140': 100000, 'LC 200': 100000, 'LC 250': 100000, 'LC 300': 100000 } },
    { name: '💉 Injector tozalash', prices: { 'Corolla': 300000, 'Camry': 300000, 'Highlander': 600000, 'Grand Highlander': 600000, 'Hilux': 600000, 'LC 140': 600000, 'LC 200': 600000, 'LC 250': 600000, 'LC 300': 600000 } },
    { name: '🛣️ Probeg tekshirish', prices: { 'Corolla': 100000, 'Camry': 100000, 'Highlander': 100000, 'Grand Highlander': 100000, 'Hilux': 100000, 'LC 140': 100000, 'LC 200': 100000, 'LC 250': 100000, 'LC 300': 100000 } },
    { name: '💻 Programma yozish', prices: { 'Corolla': 400000, 'Camry': 400000, 'Highlander': 800000, 'Grand Highlander': 800000, 'Hilux': 800000, 'LC 140': 800000, 'LC 200': 800000, 'LC 250': 800000, 'LC 300': 800000 } },
    { name: '🚀 Stage urish', prices: { 'Corolla': 600000, 'Camry': 600000, 'Highlander': 600000, 'Grand Highlander': 600000, 'Hilux': 600000, 'LC 140': 600000, 'LC 200': 600000, 'LC 250': 600000, 'LC 300': 600000 } },
    { name: '⛽ Gaz regulirovka', prices: { 'Corolla': 50000, 'Camry': 50000, 'Highlander': 100000, 'Grand Highlander': 100000, 'Hilux': 100000, 'LC 140': 100000, 'LC 200': 100000, 'LC 250': 100000, 'LC 300': 100000 } },
    { name: '⛽ Benzin nasos ko\'rish', prices: { 'Corolla': 250000, 'Camry': 250000, 'Highlander': 500000, 'Grand Highlander': 500000, 'Hilux': 500000, 'LC 140': 500000, 'LC 200': 500000, 'LC 250': 500000, 'LC 300': 500000 } },
    { name: '🧵 Simlarni to\'g\'irlash', prices: { 'Corolla': 200000, 'Camry': 200000, 'Highlander': 200000, 'Grand Highlander': 200000, 'Hilux': 200000, 'LC 140': 200000, 'LC 200': 200000, 'LC 250': 200000, 'LC 300': 200000 } },
    { name: '🇷🇺 Russifikatsiya (Rus tilida qilish)', prices: { 'Corolla': 150000, 'Camry': 150000, 'Highlander': 150000, 'Grand Highlander': 150000, 'Hilux': 150000, 'LC 140': 150000, 'LC 200': 150000, 'LC 250': 150000, 'LC 300': 150000 } },
    { name: '📱 Prilojeniye (Ilovalar) o\'rnatish', prices: { 'Corolla': 100000, 'Camry': 100000, 'Highlander': 600000, 'Grand Highlander': 600000, 'Hilux': 600000, 'LC 140': 600000, 'LC 200': 600000, 'LC 250': 600000, 'LC 300': 600000 } }
  ];

  const evServices = [
    { name: '🔍 Diagnostika', price: 100000 },
    { name: '🔋 Batareya holatini tekshirish', price: 200000 },
    { name: '🧵 Simlarni to\'g\'irlash (Izolatsiya)', price: 500000 },
    { name: '🇷🇺 Russifikatsiya (Rus tilida qilish)', price: 1200000 },
    { name: '📱 Ilovalar (App) o\'rnatish', price: 100000 },
    { name: '🛣️ Probeg tekshirish', price: 100000 },
    { name: '🛞 Batareya yechish', price: 12000000 },
    { name: '🔌 Zaryadlash portini remonti', price: 600000 },
    { name: '🚫 Tabloda datchik o\'chirish', price: 100000 },
    { name: '🌀 Konditsioner remont', price: 600000 },
    { name: '⚡ Invertor holatini tekshirish', price: 100000 }
  ];

  const allServiceEntries: any[] = [];

  // Add ICE Toyota services
  for (const s of standardServices) {
    for (const [model, price] of Object.entries(s.prices)) {
      allServiceEntries.push({ name: s.name, price: price, brand: 'Toyota', car_model: model });
    }
  }

  // Add EV Toyota/VW services
  const evModels = ['BZ 3', 'ID 3', 'ID 4', 'ID 6'];
  for (const model of evModels) {
    const brand = model.startsWith('BZ') ? 'Toyota' : 'Volkswagen';
    for (const s of evServices) {
      allServiceEntries.push({ name: s.name, price: s.price, brand: brand, car_model: model });
    }
  }

  console.log(`--- Step 2: Inserting ${allServiceEntries.length} Service Entries ---`);
  
  // Cleanup existing services for these specific models to avoid duplicates
  const targetModels = [...toyotaModels, ...vwModels];
  const { error: delError } = await supabase.from('services_list').delete().in('car_model', targetModels);
  if (delError) console.error('Error cleaning up services:', delError.message);

  const chunkSize = 50;
  for (let i = 0; i < allServiceEntries.length; i += chunkSize) {
    const chunk = allServiceEntries.slice(i, i + chunkSize);
    const { error } = await supabase.from('services_list').insert(chunk);
    if (error) {
      console.error(`Error inserting chunk ${i / chunkSize}:`, error.message);
    } else {
      console.log(`Inserted chunk ${i / chunkSize + 1}`);
    }
  }
  
  console.log('--- Finished! ---');
}

run().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
