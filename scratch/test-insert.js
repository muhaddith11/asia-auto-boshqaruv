const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Attempting minimal insert into orders...');
  const { data, error } = await supabase.from('orders').insert([{
    ism: 'Test Minimal'
  }]).select('*');

  if (error) {
    console.log('Insert Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Insert Success! Columns in response:', Object.keys(data[0]));
  }
}

check();
