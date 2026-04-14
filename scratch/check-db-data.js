const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { count: carsCount, error: e1 } = await supabase.from('cars_list').select('*', { count: 'exact', head: true });
  const { count: srvCount, error: e2 } = await supabase.from('services_list').select('*', { count: 'exact', head: true });
  const { count: workersCount, error: e3 } = await supabase.from('workers').select('*', { count: 'exact', head: true });

  console.log('Cars:', carsCount, e1?.message || '');
  console.log('Services:', srvCount, e2?.message || '');
  console.log('Workers:', workersCount, e3?.message || '');

  const { data: sampleCars } = await supabase.from('cars_list').select('*').limit(3);
  console.log('Sample Cars:', sampleCars);
}

check();
