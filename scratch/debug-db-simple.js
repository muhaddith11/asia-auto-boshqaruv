const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function test() {
  try {
    console.log('Using URL:', process.env.SUPABASE_URL);
    
    // Test cars_list
    const { data: cars, error: carsError, count: carsCount } = await supabase
      .from('cars_list')
      .select('*', { count: 'exact' });
      
    if (carsError) {
      console.error('Cars Error:', carsError);
    } else {
      console.log('Cars Count:', carsCount);
      console.log('First 2 cars:', (cars || []).slice(0, 2));
    }

    // Test services_list
    const { data: srv, error: srvError, count: srvCount } = await supabase
      .from('services_list')
      .select('*', { count: 'exact' });
      
    if (srvError) {
      console.error('Services Error:', srvError);
    } else {
      console.log('Services Count:', srvCount);
      console.log('First 2 services:', (srv || []).slice(0, 2));
    }

  } catch(e) {
    console.error('Test script crash:', e);
  }
}

test();
