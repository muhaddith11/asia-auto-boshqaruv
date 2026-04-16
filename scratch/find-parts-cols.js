const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking columns for 'parts' table...");
  const { data, error } = await supabase.from('parts').select('*').limit(1);
  if (error) {
    console.error("Error selecting from parts:", error);
  } else {
    console.log("Parts Keys:", data[0] ? Object.keys(data[0]) : "Table is empty");
  }

  // Try to find columns by guessing and checking if select works
  const possible = ['id', 'nom', 'name', 'narx', 'price', 'brand', 'mashina', 'car_model', 'sebestoimost', 'cost', 'bir', 'unit', 'kat', 'category', 'balance', 'stock', 'soni', 'created_at', 'createdat'];
  
  const found = [];
  for (const col of possible) {
    const { error: colErr } = await supabase.from('parts').select(col).limit(1);
    if (!colErr) {
      found.push(col);
    }
  }
  console.log("Found valid columns in 'parts':", found);
}

check();
