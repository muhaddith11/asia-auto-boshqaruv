const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

async function audit() {
  const { data } = await supabase.from('services_list').select('car_model, name').or('brand.eq.BMW,brand.eq.Mercedes-Benz,brand.eq.Audi');
  
  if (!data) {
    console.log('Ma\'lumot topilmadi.');
    return;
  }

  const counts = {};
  data.forEach(s => {
    counts[s.car_model] = (counts[s.car_model] || 0) + 1;
  });

  console.log('--- MODELLAR BO\'YICHA XIZMATLAR SONI ---');
  Object.keys(counts).forEach(m => {
    console.log(`${m}: ${counts[m]} ta`);
  });
}

audit();
