const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- DATA FROM update_chevrolet.js ---
const chevroletData = [
  { model: 'matiz' }, { model: 'tico' }, { model: 'damas' },
  { model: 'nexia 1' }, { model: 'nexia 2' }, { model: 'nexia 3' },
  { model: 'lasseti' }, { model: 'spark' }, { model: 'captiva 1, 2, 3,' },
  { model: 'captiva 4' }, { model: 'captiva 5' }, { model: 'gentra' },
  { model: 'cruze' }, { model: 'cobalt' }, { model: 'epica' },
  { model: 'onix' }, { model: 'malibu 1' }, { model: 'malibu 2 /primer' },
  { model: 'malibu 2.4' }, { model: 'tracker 1' }, { model: 'tracker 2' },
  { model: 'equinox 1' }, { model: 'equinox 2' }, { model: 'orlando 1, 2' },
  { model: 'monza 1.3 , 1.5' }, { model: 'traverse 1' }, { model: 'traverse 2' },
  { model: 'tahoe 1' }, { model: 'tahoe 2' }, { model: 'Trailblazer' }
];

const chevServices = [
    {n: '🔍 Diagnostika', p: 50000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000},
    {n: '🕯️ Svechalarni almashtirish', p: 40000}, {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000},
    {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000}, {n: '🚀 Stage urish', p: 600000},
    {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
];

// --- DATA FROM update_batch_final.js ---
const batchData = {
  'Li auto': [
    { model: 'LI 6', type: 'Li_Standard' }, { model: 'LI 7', type: 'Li_Standard' },
    { model: 'LI 8', type: 'Li_Standard' }, { model: 'LI 9', type: 'Li_Standard' },
    { model: 'LI 9 Restaling', type: 'Li_Standard' }
  ],
  'BMW': [
    { model: 'I3', type: 'EV' }, { model: 'I4', type: 'EV' }, { model: 'I5', type: 'EV' },
    { model: 'I7', type: 'EV' }, { model: 'IX', type: 'EV' }, { model: 'IX3', type: 'EV' },
    { model: '530 I', type: 'BMW_Premium_Petrol' }, { model: '840 I', type: 'BMW_Lux_Petrol' },
    { model: 'X 3', type: 'BMW_Premium_Petrol' }, { model: 'X 5', type: 'BMW_Premium_Petrol' },
    { model: 'X 6', type: 'BMW_Premium_Petrol' }, { model: 'X 7', type: 'BMW_Premium_Petrol' }
  ],
  'Mercedes-Benz': [
    { model: 'W 124', type: 'Mers_Old' }, { model: 'W 140', type: 'Mers_Old' }, { model: 'W 221', type: 'Mers_Old' },
    { model: 'W 222', type: 'Mers_Premium' }, { model: 'W 223', type: 'Mers_Premium' },
    { model: 'E 200', type: 'Mers_Lux_Petrol' }, { model: 'E 350', type: 'Mers_Premium' },
    { model: 'EQA 250', type: 'EV' }, { model: 'EQE 350', type: 'EV' }, { model: 'EQE 450', type: 'EV' },
    { model: 'EQB 300', type: 'EV' }, { model: 'EQS 350', type: 'EV' }, { model: 'EQS 450', type: 'EV' },
    { model: 'EQS 450 SUV', type: 'EV' }, { model: 'EQS 580', type: 'EV' }, { model: 'EQS 580 SUV', type: 'EV' },
    { model: 'GL 450', type: 'Mers_Premium' }, { model: 'GLC 300', type: 'Mers_Premium' },
    { model: 'GLE 450', type: 'Mers_Premium' }, { model: 'ML 320', type: 'Mers_Old' },
    { model: 'SPRINTER', type: 'Mers_Old' }, { model: 'Vito 2007', type: 'Mers_Old' }, { model: 'Vito', type: 'Mers_Old' }
  ],
  'Audi': [
    { model: 'E-TRON', type: 'EV' }, { model: 'A 4', type: 'Audi_Premium' }, { model: 'A 6', type: 'Audi_Premium' },
    { model: 'A 7', type: 'Audi_Premium' }, { model: 'Q 2', type: 'Audi_Premium' }, { model: 'Q 3', type: 'Audi_Premium' },
    { model: 'Q 5', type: 'Audi_Premium' }, { model: 'Q 8', type: 'Audi_Premium' }
  ],
  'Lexus': [
    { model: 'ES 350', type: 'Lexus_ES' }, { model: 'RX 350', type: 'Lexus_Lux' },
    { model: 'GX 460', type: 'Lexus_Lux' }, { model: 'LX 570', type: 'Lexus_Lux' }
  ],
  'Toyota': [
    { model: 'Corolla', type: 'Toyota_Standard' }, { model: 'Camry', type: 'Toyota_Standard' },
    { model: 'Highlander', type: 'Toyota_Premium' }, { model: 'Grand Highlander', type: 'Toyota_Premium' },
    { model: 'Hilux', type: 'Toyota_Premium' }, { model: 'BZ 3', type: 'EV' },
    { model: 'LC 140', type: 'Toyota_Premium' }, { model: 'LC 200', type: 'Toyota_Premium' },
    { model: 'LC 250', type: 'Toyota_Premium' }, { model: 'LC 300', type: 'Toyota_Premium' }
  ],
  'Boshqa': [
    { model: 'Jac J7', type: 'Toyota_Standard' }, { model: 'Jac M4', type: 'Toyota_Premium' },
    { model: 'Deepal S7', type: 'EV' }, { model: 'Foton', type: 'Toyota_Premium' },
    { model: 'Skoda Kodiq', type: 'Toyota_Premium' }, { model: 'Im Motors L7', type: 'EV' },
    { model: 'Nissan altima', type: 'Toyota_Standard' }, { model: 'Range rover Velar', type: 'Mers_Premium' },
    { model: 'Wuiling Baoju', type: 'EV' }, { model: 'Honji HS7', type: 'Mers_Premium' },
    { model: 'Jaguar', type: 'Mers_Lux_Petrol' }, { model: 'Porsche Taycan', type: 'EV' },
    { model: 'Dong Feng 008', type: 'EV' }, { model: 'Shineray T30', type: 'Toyota_Standard' },
    { model: 'I Car 03', type: 'EV' }, { model: 'Denza N9', type: 'EV' },
    { model: 'Ling co 900', type: 'EV' }, { model: 'Mazda 6', type: 'Toyota_Standard' },
    { model: 'Dong Feng aelous', type: 'Toyota_Premium' }
  ],
  'BYD': [
    { model: 'Song Plus EV/DM-i', type: 'EV' }, { model: 'Han', type: 'EV' },
    { model: 'Chazor', type: 'EV' }, { model: 'Seagull', type: 'EV' },
    { model: 'Seal', type: 'EV' }, { model: 'Tang', type: 'EV' }
  ]
};

const serviceTemplates = {
  'Li_Standard': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 150000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'EV': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '🔋 Batareya holatini tekshirish', p: 200000 }, { n: '🧵 Simlarni to\'g\'irlash (Izolatsiya)', p: 500000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Ilovalar (App) o' + "'" + 'rnatish', p: 100000 }, { n: '🛣️ Probeg tekshirish', p: 100000 },
    { n: '🛞 Batareya yechish', p: 12000000 }, { n: '🔌 Zaryadlash portini remonti', p: 600000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🌀 Konditsioner remont', p: 600000 }, { n: '⚡ Invertor holatini tekshirish', p: 100000 }
  ],
  'BMW_Premium_Petrol': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 150000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'BMW_Lux_Petrol': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 1000000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 500000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'Mers_Old': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 500000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 50000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 80000 }, { n: '💉 Injector tozalash', p: 300000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 400000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 50000 }, { n: '⛽ Benzin nasos ko\'rish', p: 250000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000 }
  ],
  'Mers_Premium': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 150000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'Mers_Lux_Petrol': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 1000000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 500000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000 }
  ],
  'Audi_Premium': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 1000000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 500000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000 }, { n: '📱 Prilojeniye (Ilovalar) o' + "'" + 'rnatish', p: 600000 }
  ],
  'Lexus_ES': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 500000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000 }
  ],
  'Lexus_Lux': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 1000000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 500000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 600000 }
  ],
  'Toyota_Standard': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 500000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 50000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 80000 }, { n: '💉 Injector tozalash', p: 300000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 400000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 50000 }, { n: '⛽ Benzin nasos ko\'rish', p: 250000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 100000 }
  ],
  'Toyota_Premium': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 1000000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 500000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 150000 }, { n: '📱 Prilojeniye (Ilovalar) o' + "'" + 'rnatish', p: 600000 }
  ]
};

async function seedV2() {
  console.log('🚀 CLEANING ALL CARS AND SERVICES...');
  await supabase.from('cars_list').delete().neq('brand', 'IMPOSSIBLE_VALUE');
  await supabase.from('services_list').delete().neq('brand', 'IMPOSSIBLE_VALUE');

  console.log('🚕 SEEDING CHEVROLET...');
  const chevCars = chevroletData.map(d => ({ brand: 'Chevrolet', name: d.model }));
  await supabase.from('cars_list').insert(chevCars);
  
  const chevServicesFull = [];
  chevroletData.forEach(d => {
    chevServices.forEach(s => {
      chevServicesFull.push({ brand: 'Chevrolet', car_model: d.model, name: s.n, price: s.p, stavka: 0 });
    });
  });

  const chunkSize = 100;
  for (let i = 0; i < chevServicesFull.length; i += chunkSize) {
    await supabase.from('services_list').insert(chevServicesFull.slice(i, i + chunkSize));
  }

  console.log('🌏 SEEDING OTHER BRANDS...');
  const batchBrands = Object.keys(batchData);
  for (const brand of batchBrands) {
    const models = batchData[brand];
    await supabase.from('cars_list').insert(models.map(m => ({ brand, name: m.model })));

    const servicesBatch = [];
    models.forEach(m => {
      const template = serviceTemplates[m.type];
      if (template) {
        template.forEach(s => {
          servicesBatch.push({ brand, car_model: m.model, name: s.n, price: s.p, stavka: 0 });
        });
      }
    });

    for (let i = 0; i < servicesBatch.length; i += chunkSize) {
      await supabase.from('services_list').insert(servicesBatch.slice(i, i + chunkSize));
    }
  }

  console.log('✅ MASTER SEED V2 COMPLETED!');
}

seedV2().catch(console.error);
