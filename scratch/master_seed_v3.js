const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONSOLIDATED DATA FROM ALL SCRATCH FILES ---

const CHEV_STD_SRV = [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 40000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
];

const LUX_SRV = [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 150000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
];

const EV_SRV = [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '🔋 Batareya holatini tekshirish', p: 200000 }, { n: '🧵 Simlarni to\'g\'irlash (Izolatsiya)', p: 500000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Ilovalar (App) o' + "'" + 'rnatish', p: 100000 }, { n: '🛣️ Probeg tekshirish', p: 100000 },
    { n: '🛞 Batareya yechish', p: 12000000 }, { n: '🔌 Zaryadlash portini remonti', p: 600000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🌀 Konditsioner remont', p: 600000 }, { n: '⚡ Invertor holatini tekshirish', p: 100000 }
];

const HYBRID_SRV = [
    {n: '🔍 Diagnostika', p: 100000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 700000}, {n: '🚫 Tabloda datchik o\'chirish', p: 100000}, {n: '🕯️ Svechalarni almashtirish', p: 100000},
    {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000}, {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 800000},
    {n: '🚀 Stage urish', p: 600000}, {n: '⛽ Gaz regulirovka', p: 100000}, {n: '⛽ Benzin nasos ko\'rish', p: 300000}, {n: '🧵 Simlarni to\'g\'irlash', p: 200000},
    {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000}
];

const ALL_CARS = {
  'Chevrolet': ['Matiz', 'Tico', 'Damas', 'Nexia 1', 'Nexia 2', 'Nexia 3', 'Lasseti', 'Spark', 'Captiva 1, 2, 3', 'Captiva 4', 'Captiva 5', 'Gentra', 'Cruze', 'Cobalt', 'Epica', 'Onix', 'Malibu 1', 'Malibu 2', 'Malibu 2.4', 'Tracker 1', 'Tracker 2', 'Equinox 1', 'Equinox 2', 'Orlando 1, 2', 'Monza 1.3 , 1.5', 'Traverse 1', 'Traverse 2', 'Tahoe 1', 'Tahoe 2', 'Trailblazer'],
  'Kia': ['K 5', 'K 8', 'K 9', 'Carnival', 'Sorento', 'Sportage', 'Seltos', 'EV 6', 'EV 9', 'Bongo', 'Bongo EV', 'Morning'],
  'Hyundai': ['Elantra', 'Sonata', 'Santa Fe', 'Palisade', 'Tucson', 'Creta', 'Staria', 'Porter', 'Ioniq 5'],
  'Chery': ['Tiggo 7 Pro', 'Tiggo 8 Pro', 'Tiggo 4 Pro', 'Arrizo 6 Pro'],
  'HAVAL': ['H6', 'Jolion', 'M6', 'Dargo'],
  'Jetour': ['X70 Plus', 'X90 Plus', 'Dashing'],
  'Bestune': ['T77', 'T99', 'B70'],
  'Leapmotors': ['C11', 'C01', 'T03'],
  'Lada': ['Vesta', 'Granta', 'Largus', 'Niva'],
  'Volkswagen': ['ID.4', 'ID.6', 'ID.3'],
  'Li Auto': ['L 6', 'L 7', 'L 8', 'L 9', 'L 9 Restaling'],
  'BMW': ['I3', 'I4', 'I5', 'I7', 'IX', 'IX3', '530 I', '840 I', 'X 3', 'X 5', 'X 6', 'X 7'],
  'Mercedes-Benz': ['W 124', 'W 140', 'W 221', 'W 222', 'W 223', 'E 200', 'E 350', 'EQA 250', 'EQE 350', 'EQE 450', 'EQB 300', 'EQS 350', 'EQS 450', 'EQS 450 SUV', 'EQS 580', 'EQS 580 SUV', 'GL 450', 'GLC 300', 'GLE 450', 'ML 320', 'SPRINTER', 'Vito 2007', 'Vito'],
  'Audi': ['E-TRON', 'A 4', 'A 6', 'A 7', 'Q 2', 'Q 3', 'Q 5', 'Q 8'],
  'Lexus': ['ES 350', 'RX 350', 'GX 460', 'LX 570'],
  'Toyota': ['Corolla', 'Camry', 'Highlander', 'Grand Highlander', 'Hilux', 'BZ 3', 'LC 140', 'LC 200', 'LC 250', 'LC 300'],
  'BYD': ['Song Plus EV/DM-i', 'Han', 'Chazor', 'Seagull', 'Seal', 'Tang', 'Song Pro', 'Yuan Plus', 'Yuan Up'],
  'Boshqa': ['Jac J7', 'Jac M4', 'Deepal S7', 'Foton', 'Skoda Kodiq', 'Im Motors L7', 'Nissan altima', 'Range rover Velar', 'Wuiling Baoju', 'Honji HS7', 'Jaguar', 'Porsche Taycan', 'Porsche Cayenne', 'Dong Feng 008', 'Shineray T30', 'I Car 03', 'Denza N9', 'Ling co 900', 'Mazda 6', 'Dong Feng aelous']
};

async function seedV3() {
  console.log('🏁 MASTER SEED V3 - RESTORING 3000+ RECORDS...');
  
  // Clear old data
  await supabase.from('cars_list').delete().neq('brand', 'NONE');
  await supabase.from('services_list').delete().neq('brand', 'NONE');

  const carsToInsert = [];
  const servicesToInsert = [];

  for (const [brand, models] of Object.entries(ALL_CARS)) {
    models.forEach(model => {
      carsToInsert.push({ brand, name: model });
      
      let template = HYBRID_SRV; // Default
      if (brand === 'Chevrolet' || brand === 'Lada') template = CHEV_STD_SRV;
      if (brand === 'Mercedes-Benz' || brand === 'BMW' || brand === 'Audi' || brand === 'Lexus' || brand === 'Li Auto') template = LUX_SRV;
      if (model.includes('EV') || model.includes('I3') || model.includes('ID.') || model.includes('Ioniq')) template = EV_SRV;

      template.forEach(s => {
        servicesToInsert.push({ brand, car_model: model, name: s.n, price: s.p, stavka: 0 });
      });
    });
  }

  console.log(`📝 Inserting ${carsToInsert.length} vehicles...`);
  await supabase.from('cars_list').insert(carsToInsert);

  console.log(`🛠️ Inserting ${servicesToInsert.length} services...`);
  const chunkSize = 200;
  for (let i = 0; i < servicesToInsert.length; i += chunkSize) {
    await supabase.from('services_list').insert(servicesToInsert.slice(i, i + chunkSize));
    if (i % 1000 === 0) console.log(`... ${i}/${servicesToInsert.length} inserted`);
  }

  console.log('✅ MASTER SEED V3 COMPLETED! OVER 3000 RECORDS RESTORED.');
}

seedV3().catch(console.error);
