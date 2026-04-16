const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const brands = {
  BMW: {
    ev: ['i3', 'i4', 'i5', 'i7', 'iX', 'iX3'],
    sedan: ['530 I'],
    suv: ['X 3', 'X 5', 'X 6', 'X 7']
  },
  'Mercedes-Benz': {
    sedan: ['W 124', 'W 140', 'W 221', 'W 222', 'W 223', 'E 200', 'E 350'],
    ev: ['EQA 250', 'EQE 350', 'EQE 450', 'EQB 300', 'EQS 350', 'EQS 450', 'EQS 450 SUV', 'EQS 580', 'EQS 580 SUV'],
    suv: ['GL 450', 'GLC 300', 'GLE 450', 'ML 320', 'SPRINTER', 'Vito 2007', 'Vito']
  },
  Audi: {
    ev: ['E-TRON'],
    sedan: ['A 4', 'A 6', 'A 7'],
    suv: ['Q 2', 'Q 3', 'Q 5', 'Q 8']
  },
  Lexus: {
    sedan: ['ES 350'],
    suv: ['RX 350', 'GX 460', 'LX 570']
  },
  Toyota: {
    sedan: ['Corolla', 'Camry'],
    suv: ['Highlander', 'Grand Highlander', 'Hilux', 'LC 140', 'LC 200', 'LC 250', 'LC 300']
  }
};

async function populate() {
  console.log('📡 Shablonlarni aniq qidirish boshlandi...');
  
  const { data: sed } = await supabase.from('services_list').select('*').ilike('car_model', '%malibu 2.4%').limit(14);
  const { data: suv } = await supabase.from('services_list').select('*').ilike('car_model', '%traverse%').limit(14);
  const { data: ev } = await supabase.from('services_list').select('*').eq('brand', 'Li auto').ilike('car_model', '%9%').limit(14);

  if (!sed?.length || !suv?.length || !ev?.length) {
    console.error(`❌ Xatolik: Sedan(${sed?.length}), SUV(${suv?.length}), EV(${ev?.length}) topilmadi.`);
    return;
  }

  const newCars = [];
  const newServices = [];

  for (const [brand, categories] of Object.entries(brands)) {
    for (const [category, models] of Object.entries(categories)) {
      const template = category === 'ev' ? ev : (category === 'sedan' ? sed : suv);
      for (const model of models) {
        newCars.push({ brand, name: model });
        template.forEach(s => {
          newServices.push({ name: s.n || s.name, price: s.p || s.price, brand, car_model: model, stavka: s.stavka || 0 });
        });
      }
    }
  }

  console.log(`🚀 ${newCars.length} mashina va ${newServices.length} xizmat kiritilmoqda...`);
  
  await supabase.from('cars_list').insert(newCars);
  
  const chunkSize = 100;
  for (let i = 0; i < newServices.length; i += chunkSize) {
    await supabase.from('services_list').insert(newServices.slice(i, i + chunkSize));
  }
  
  console.log('✅ Bajarildi!');
}

populate();
