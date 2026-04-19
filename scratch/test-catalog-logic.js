const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testApiLogic() {
  const { data: cars } = await supabase.from('cars_list').select('brand, name');
  const { data: services } = await supabase.from('services_list').select('brand, car_model, name, price');

  const brandsSet = new Set();
  cars?.forEach(c => brandsSet.add(c.brand));
  services?.forEach(s => { if(s.brand) brandsSet.add(s.brand); });
  const brands = Array.from(brandsSet).sort();

  const catalog = {};
  cars?.forEach(c => {
    if (!catalog[c.brand]) catalog[c.brand] = {};
    if (!catalog[c.brand][c.name]) catalog[c.brand][c.name] = [];
  });

  services?.forEach(s => {
    const b = s.brand || 'Boshqa';
    const m = s.car_model || 'Umumiy';
    if (!catalog[b]) catalog[b] = {};
    if (!catalog[b][m]) catalog[b][m] = [];
    catalog[b][m].push({ name: s.name, price: s.price });
  });

  console.log('Brands found:', brands.slice(0, 10));
  console.log('Catalog Keys (Brands):', Object.keys(catalog).slice(0, 10));
  if (catalog['BYD']) {
    console.log('Models for BYD:', Object.keys(catalog['BYD']));
    console.log('Sample services for BYD Song Plus:', catalog['BYD']['Song Plus']?.slice(0, 2));
  } else {
    console.log('BYD not found in catalog!');
  }
}

testApiLogic();
