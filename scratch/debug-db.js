const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function test() {
  console.log('Checking cars_list table...');
  const { data: cars, error: carsError } = await supabase.from('cars_list').select('*').limit(5);
  if (carsError) console.error('Cars Error:', carsError);
  else console.log('Cars count (limit 5):', cars.length, cars);

  console.log('Checking services_list table...');
  const { data: services, error: servicesError } = await supabase.from('services_list').select('*').limit(5);
  if (servicesError) console.error('Services Error:', servicesError);
  else console.log('Services count (limit 5):', services.length, services);
}

test();
