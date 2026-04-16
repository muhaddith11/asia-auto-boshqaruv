const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fwktbleovtkxxpsccqqr.supabase.co',
  'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL'
);

async function extractTemplates() {
  const { data, error } = await supabase.from('services_list').select('*');
  if (error) return;

  const getS = (m) => data.filter(s => s.car_model && s.car_model.toLowerCase().includes(m.toLowerCase()));

  console.log('--- MALIBU 2.4 (SEDAN) ---');
  getS('malibu 2.4').slice(0, 15).forEach(s => console.log(`${s.name}: ${s.price}`));

  console.log('\n--- TRAVERSE (CROSSOVER) ---');
  getS('traverse').slice(0, 15).forEach(s => console.log(`${s.name}: ${s.price}`));

  console.log('\n--- LI AUTO L9 (EV) ---');
  const l9 = data.filter(s => s.brand === 'Li auto' && s.car_model.includes('9'));
  l9.slice(0, 15).forEach(s => console.log(`${s.name}: ${s.price}`));
}

extractTemplates();
