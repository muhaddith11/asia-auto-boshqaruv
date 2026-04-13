const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('ERROR: Environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
  const { data, error } = await supabase.from('workers').select('telegram').limit(1);
  if (error) {
    if (error.message.includes('column "telegram" does not exist')) {
      console.log('RESULT: MISSING_COLUMN');
    } else {
      console.log('RESULT: ERROR: ' + error.message);
    }
  } else {
    console.log('RESULT: SUCCESS');
  }
}

checkColumn();
