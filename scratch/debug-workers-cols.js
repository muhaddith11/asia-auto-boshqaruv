const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Fetching columns for "workers" table...');
  const { data, error } = await supabase.from('workers').select('*').limit(1);
  if (error) {
    console.log('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in workers table:', Object.keys(data[0]));
  } else {
    console.log('No data in workers table.');
  }
}

check();
