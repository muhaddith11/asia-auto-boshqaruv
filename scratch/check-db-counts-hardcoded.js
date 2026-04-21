const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const tables = ['cars', 'services', 'cars_list', 'services_list', 'workers', 'orders', 'categories'];
  for(const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`Table '${table}':`, count !== null ? `${count} rows` : `Error: ${error.message}`);
    } catch (e) {
      console.log(`Table '${table}': Failed to fetch`);
    }
  }
}

check();
