const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

async function syncCase() {
  console.log('🔄 Boshladim: Xizmatlar va modellar nomlarini sinxronlash...');
  
  // 1. Get all correct model names
  const { data: cars } = await supabase.from('cars_list').select('brand, name');
  if (!cars) return;

  console.log(`🔍 ${cars.length} ta model topildi. Tekshiraman...`);

  for (const car of cars) {
    // Update all services for this brand/model where name matches ignoring case
    // We update them to the exact case used in cars_list
    const { count } = await supabase.from('services_list')
      .update({ car_model: car.name })
      .eq('brand', car.brand)
      .ilike('car_model', car.name);
    
    if (count > 0) {
       console.log(`✅ [${car.brand}] ${car.name}: ${count} ta xizmat to'g'irlandi.`);
    }
  }

  console.log('🏁 SINXRONIZATSIYA YAKUNLANDI!');
}

syncCase();
