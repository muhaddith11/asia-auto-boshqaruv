const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

async function check() {
  const { count: carCount } = await supabase.from('cars_list').select('*', { count: 'exact', head: true });
  const { count: svcCount } = await supabase.from('services_list').select('*', { count: 'exact', head: true });
  
  const { data: liAuto } = await supabase.from('cars_list').select('*').eq('brand', 'Li auto');
  const { data: chev } = await supabase.from('services_list').select('*').eq('brand', 'Chevrolet').eq('car_model', 'Matiz');

  console.log(`🚗 Cars count: ${carCount}`);
  console.log(`🛠️ Services count: ${svcCount}`);
  console.log(`🔍 Li Auto models found:`, liAuto?.map(m => m.name));
  console.log(`🔍 Matiz services count:`, chev?.length);
}

check();
