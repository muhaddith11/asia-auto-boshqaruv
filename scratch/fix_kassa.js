const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixKassa() {
  console.log('Force updating kassa state to the last known balance...');
  
  // Set to 1,890,000 Naqd, 0 Karta
  const { data, error } = await supabase.from('kassa_state').upsert({
    id: 1, // assuming id 1 is the main state
    naqd: 1890000,
    karta: 0,
    updated_at: new Date().toISOString()
  });

  if (error) {
    console.error('Error updating kassa:', error);
  } else {
    console.log('✅ Kassa updated successfully to 1,890,000 UZS.');
  }
}

fixKassa();
