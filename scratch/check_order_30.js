const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking Order #30...');
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', 30)
    .single();

  if (error) {
    console.error('Error fetching order #30:', error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

check();
