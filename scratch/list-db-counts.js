const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking Supabase connection...');
  
  // Try to list tables (hacky way using query)
  const { data: tables, error } = await supabase.rpc('get_tables'); // If they have such RPC
  
  if (error) {
     console.log('RPC failed, trying individual select 1 from known tables...');
     const known = ['cars', 'services', 'cars_list', 'services_list', 'workers', 'orders', 'categories'];
     for(const table of known) {
        const { count, error: e } = await supabase.from(table).select('*', { count: 'exact', head: true });
        console.log(`Table '${table}':`, count !== null ? `${count} rows` : `Error: ${e.message}`);
     }
  } else {
     console.log('Tables:', tables);
  }
}

check();
