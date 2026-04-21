const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const data = {
  'BYD': [
    { model: 'Song plus', type: 'EV' },
    { model: 'Song plus gibrid', type: 'Hybrid' },
    { model: 'chempion gibrid', type: 'Hybrid' },
    { model: 'Chazor', type: 'Hybrid' },
    { model: 'Seal', type: 'Hybrid' },
    { model: 'Xan gibrid', type: 'Hybrid' },
    { model: 'Song Pro', type: 'Hybrid' },
    { model: 'Seagull', type: 'EV' },
    { model: 'Tang', type: 'Hybrid' },
    { model: 'Yuan', type: 'EV' },
    { model: 'Yuan up', type: 'EV' },
    { model: 'Yuan up gibrid', type: 'Hybrid_Extra' }
  ],
  'Kia': [
    { model: 'kiaCarnival', type: 'Hybrid' },
    { model: 'Bongo', type: 'Hybrid_Kia' },
    { model: 'Bongo EV', type: 'EV' },
    { model: 'EV 3', type: 'EV' },
    { model: 'EV 5', type: 'EV' },
    { model: 'EV 6', type: 'EV' },
    { model: 'EV 9', type: 'EV' },
    { model: 'K 3', type: 'Hybrid' },
    { model: 'K 5', type: 'Hybrid' },
    { model: 'K 8', type: 'Hybrid' },
    { model: 'K 8 restaylin', type: 'Hybrid' },
    { model: 'K 9', type: 'Hybrid' },
    { model: 'Morning', type: 'Hybrid' },
    { model: 'Seltos', type: 'Hybrid' },
    { model: 'Sorento', type: 'Hybrid' },
    { model: 'Sportage', type: 'Hybrid' }
  ],
  'hyundai': [
    { model: 'Elantra', type: 'Hybrid' },
    { model: 'creta', type: 'Hybrid' },
    { model: 'Ioniq5', type: 'EV' },
    { model: 'Ioniq6', type: 'EV' },
    { model: 'Ioniq9', type: 'EV' },
    { model: 'Palisade', type: 'Hybrid' },
    { model: 'Porter', type: 'Hybrid' },
    { model: 'Santa fe', type: 'Hybrid' },
    { model: 'Sonata', type: 'Hybrid' },
    { model: 'Sonata 2008', type: 'Hybrid_Old_Sonata' },
    { model: 'Staria', type: 'Hybrid' },
    { model: 'Starex', type: 'Hybrid' },
    { model: 'Tranjet', type: 'Hybrid' }
  ],
  'chery': [
    { model: 'arizo 6 pro', type: 'Chery_Pro' },
    { model: 'arizo 7 pro', type: 'Chery_Pro' },
    { model: 'tiggo 2', type: 'Chery_Pro' },
    { model: 'tiggo 6 pro', type: 'Chery_Pro' },
    { model: 'tiggo 7 pro', type: 'Chery_Pro' },
    { model: 'tiggo 8 pro', type: 'Chery_Pro' }
  ]
};

const serviceTemplates = {
  'Hybrid': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
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
  'Hybrid_Extra': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 1000000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 200000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 500000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 1200000 }
  ],
  'Hybrid_Kia': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 500000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 150000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'Hybrid_Old_Sonata': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 150000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 50000 }, { n: '🌀 Drosil tozalash', p: 50000 }, { n: '💉 Injector tozalash', p: 100000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 200000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 50000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'Chery_Pro': [
    { n: '🔍 Diagnostika', p: 50000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 400000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 300000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ]
};

async function updateAll() {
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
      if (template) {
        template.forEach(s => {
          servicesBatch.push({
            brand,
            car_model: m.model,
            name: s.n,
            price: s.p,
            stavka: 0
          });
        });
      }
    });

    // Batch insert services
    const chunkSize = 100;
    for (let i = 0; i < servicesBatch.length; i += chunkSize) {
      await supabase.from('services_list').insert(servicesBatch.slice(i, i + chunkSize));
    }
  }

  console.log('✅ ALL BRANDS UPDATED SUCCESSFULLY!');
}

updateAll();
