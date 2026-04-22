const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixKassa() {
  console.log('Migrating last known balance to database...');
  
  // Set to 1,890,000 Naqd, 0 Karta
  const { data, error } = await supabase.from('kassa_state').upsert({
    id: 1, 
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
