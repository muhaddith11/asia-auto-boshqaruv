const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const data = {
  'HAVAL': [
    { model: 'M6', type: 'Hybrid_Haval' },
    { model: 'H6', type: 'Hybrid_Haval' },
    { model: 'JOLION', type: 'Hybrid_Haval' },
    { model: 'DARGO', type: 'Hybrid_Haval' }
  ],
  'jetour': [
    { model: 'X 70', type: 'Hybrid_Haval' },
    { model: 'X90', type: 'Hybrid_Haval' },
    { model: 'X95', type: 'Hybrid_Haval' },
    { model: 'DASHING', type: 'Hybrid_Haval' }
  ],
  'bestune': [
    { model: 'T 33', type: 'Bestune_S' },
    { model: 'T 55', type: 'Bestune_M' },
    { model: 'T 77', type: 'Bestune_S' },
    { model: 'T 99', type: 'Bestune_L' },
    { model: 'B 70', type: 'Bestune_L' }
  ],
  'leapmotors': [
    { model: 'C 01', type: 'EV' },
    { model: 'C 10', type: 'EV' },
    { model: 'C 11', type: 'EV' },
    { model: 'C 16', type: 'EV' }
  ],
  'lada': [
    { model: 'vesta', type: 'Lada' },
    { model: 'X ray', type: 'Lada' },
    { model: 'gazel', type: 'Lada' },
    { model: 'granta', type: 'Lada' }
  ],
  'volkswagen': [
    { model: 'ID 3', type: 'EV' },
    { model: 'ID 4', type: 'EV' },
    { model: 'ID 6', type: 'EV' },
    { model: 'CADDY', type: 'VW_Caddy' }
  ]
};

const serviceTemplates = {
  'Hybrid_Haval': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 400000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 300000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'Bestune_S': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 500000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 400000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 300000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'Bestune_M': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 600000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 400000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 300000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'Bestune_L': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 400000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 300000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'EV': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '🔋 Batareya holatini tekshirish', p: 200000 }, { n: '🧵 Simlarni to\'g\'irlash (Izolatsiya)', p: 500000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Ilovalar (App) o\'rnatish', p: 100000 }, { n: '🛣️ Probeg tekshirish', p: 100000 },
    { n: '🛞 Batareya yechish', p: 12000000 }, { n: '🔌 Zaryadlash portini remonti', p: 600000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🌀 Konditsioner remont', p: 600000 }, { n: '⚡ Invertor holatini tekshirish', p: 100000 }
  ],
  'Lada': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 300000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 50000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 400000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 500000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 50000 }, { n: '⛽ Benzin nasos ko\'rish', p: 100000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 100000 }
  ],
  'VW_Caddy': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 300000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 50000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 400000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 400000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 50000 }, { n: '⛽ Benzin nasos ko\'rish', p: 100000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 100000 }
  ]
};

async function updateBatch() {
  const brands = Object.keys(data);
  for (const brand of brands) {
    console.log(`🧹 Cleaning ${brand}...`);
    await supabase.from('cars_list').delete().eq('brand', brand);
    await supabase.from('services_list').delete().eq('brand', brand);

    console.log(`📝 Inserting models for ${brand}...`);
    const models = data[brand];
    await supabase.from('cars_list').insert(models.map(m => ({ brand, name: m.model })));

    const servicesBatch = [];
    models.forEach(m => {
      const template = serviceTemplates[m.type];
      template.forEach(s => {
        servicesBatch.push({ brand, car_model: m.model, name: s.n, price: s.p, stavka: 0 });
      });
    });

    for (let i = 0; i < servicesBatch.length; i += 100) {
      await supabase.from('services_list').insert(servicesBatch.slice(i, i + 100));
    }
  }
  console.log('✅ BATCH 2 COMPLETED!');
}

updateBatch();
