const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Fetching columns for "orders" table...');
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns in orders table:', Object.keys(data[0]));
  } else {
    console.log('No data in orders table to check columns.');
    // Try to fetch another table just in case
    const { data: cols, error: err } = await supabase.rpc('get_table_columns', { table_name: 'orders' });
    if (err) console.error('RPC failed:', err);
    else console.log('RPC Columns:', cols);
  }
}

checkTable();
