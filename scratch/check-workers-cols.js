const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  const { data, error } = await supabase.from('workers').select('*').limit(1);
  if (error) {
    console.error('Error fetching workers:', error);
    return;
  }
  console.log('Columns in workers table:', Object.keys(data[0] || {}));
}

checkTable();
