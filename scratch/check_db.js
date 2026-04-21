const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking recent orders...');
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('id', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Fields in the first row:', Object.keys(data[0]));
    console.log('Sample data (Order #' + data[0].id + '):');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('No orders found.');
  }
}

check();
