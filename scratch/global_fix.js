const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

function toProperCase(str) {
  if (!str) return 'Boshqa';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

async function globalFix() {
  console.log('🚀 GLOBAL DATABASE REPAIR STARTED...');

  // 1. Get all cars
  const { data: cars, error: carErr } = await supabase.from('cars_list').select('*');
  if (carErr || !cars) {
    console.error('❌ Error fetching cars:', carErr);
    return;
  }

  console.log(`🔍 ${cars.length} ta model tekshirilmoqda...`);

  for (const car of cars) {
    const fixedBrand = toProperCase(car.brand);
    let fixedName = toProperCase(car.name);
    
    // Special naming for LI 7 etc.
    if (fixedName.toUpperCase().startsWith('LI ')) {
        fixedName = fixedName.toUpperCase();
    }

    // Update cars_list row
    await supabase.from('cars_list').update({ 
        brand: fixedBrand, 
        name: fixedName 
    }).eq('id', car.id);

    // Update ALL services matching this brand/model (case-insensitive)
    const { count } = await supabase.from('services_list')
      .update({ 
          brand: fixedBrand, 
          car_model: fixedName 
      })
      .eq('brand', car.brand) // old brand (might be same if already proper)
      .ilike('car_model', car.name);
    
    if (count && count > 0) {
      console.log(`✅ [${fixedBrand}] ${fixedName}: ${count} ta xizmat to'g'irlandi.`);
    }
  }

  console.log('🏁 GLOBAL REPAIR FINISHED!');
}

globalFix();
