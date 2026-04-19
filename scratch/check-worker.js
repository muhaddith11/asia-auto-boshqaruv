const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const phone = '998502500550';
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .or(`tel.eq.${phone},tel.eq.+${phone},tel.eq.998${phone}`);
  
  console.log('Worker found:', data);
  if (error) console.error('Error:', error);
}

check();
