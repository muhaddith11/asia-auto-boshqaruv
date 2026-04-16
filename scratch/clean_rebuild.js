const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const fullCatalog = {
  'Chevrolet': [
    { m: 'Matiz', type: 'CHEV_STD', p: 50000 }, { m: 'Tico', type: 'CHEV_STD', p: 50000 }, { m: 'Damas', type: 'CHEV_STD', p: 50000 },
    { m: 'Nexia 1', type: 'CHEV_STD', p: 50000 }, { m: 'Nexia 2', type: 'CHEV_STD', p: 50000 }, { m: 'Nexia 3', type: 'CHEV_STD', p: 50000 },
    { m: 'Captiva 1-2-3', type: 'CHEV_STD', p: 100000 }, { m: 'Captiva 4', type: 'CHEV_STD', p: 100000 }, { m: 'Captiva 5', type: 'CHEV_STD', p: 100000 },
    { m: 'Gentra', type: 'CHEV_STD', p: 50000 }, { m: 'Spark', type: 'CHEV_STD', p: 50000 }, { m: 'Cruze', type: 'CHEV_STD', p: 100000 },
    { m: 'Cobalt', type: 'CHEV_STD', p: 50000 }, { m: 'Epica', type: 'CHEV_STD', p: 100000 }, { m: 'Onix', type: 'CHEV_STD', p: 100000 },
    { m: 'Malibu 1', type: 'CHEV_STD', p: 100000 }, { m: 'Malibu 2', type: 'CHEV_STD', p: 100000 }, { m: 'Malibu 2.4', type: 'CHEV_STD', p: 100000 },
    { m: 'Tracker 1', type: 'CHEV_STD', p: 100000 }, { m: 'Tracker 2', type: 'CHEV_STD', p: 100000 }, { m: 'Equinox 1', type: 'CHEV_STD', p: 100000 },
    { m: 'Equinox 2', type: 'CHEV_STD', p: 100000 }, { m: 'Orlando', type: 'CHEV_STD', p: 100000 }, { m: 'Monza', type: 'CHEV_STD', p: 100000 },
    { m: 'Traverse 1', type: 'CHEV_STD', p: 100000 }, { m: 'Traverse 2', type: 'CHEV_STD', p: 100000 }, { m: 'Tahoe 1', type: 'CHEV_STD', p: 150000 },
    { m: 'Tahoe 2', type: 'CHEV_STD', p: 150000 }, { m: 'Trailblazer', type: 'CHEV_STD', p: 100000 }
  ],
  'BYD': [
    { m: 'Song Plus EV', type: 'EV' }, { m: 'Song Plus Gibrid', type: 'Hybrid' }, { m: 'Champion Gibrid', type: 'Hybrid' },
    { m: 'Chazor', type: 'Hybrid' }, { m: 'Seal', type: 'Hybrid' }, { m: 'Han Gibrid', type: 'Hybrid' },
    { m: 'Song Pro', type: 'Hybrid' }, { m: 'Seagull', type: 'EV' }, { m: 'Tang', type: 'Hybrid' },
    { m: 'Yuan Plus', type: 'EV' }, { m: 'Yuan Up EV', type: 'EV' }, { m: 'Yuan Up Gibrid', type: 'Hybrid' }
  ],
  'Kia': [
    { m: 'Carnival', type: 'Hybrid' }, { m: 'Bongo', type: 'Hybrid' }, { m: 'Bongo EV', type: 'EV' },
    { m: 'EV 3', type: 'EV' }, { m: 'EV 5', type: 'EV' }, { m: 'EV 6', type: 'EV' }, { m: 'EV 9', type: 'EV' },
    { m: 'K 3', type: 'Hybrid' }, { m: 'K 5', type: 'Hybrid' }, { m: 'K 8', type: 'Hybrid' }, { m: 'K 9', type: 'Hybrid' },
    { m: 'Morning', type: 'Hybrid' }, { m: 'Seltos', type: 'Hybrid' }, { m: 'Sorento', type: 'Hybrid' }, { m: 'Sportage', type: 'Hybrid' }
  ],
  'Hyundai': [
    { m: 'Elantra', type: 'Hybrid' }, { m: 'Creta', type: 'Hybrid' }, { m: 'Ioniq 5', type: 'EV' }, { m: 'Ioniq 6', type: 'EV' },
    { m: 'Palisade', type: 'Hybrid' }, { m: 'Porter', type: 'Hybrid' }, { m: 'Santa Fe', type: 'Hybrid' }, { m: 'Sonata', type: 'Hybrid' },
    { m: 'Staria', type: 'Hybrid' }
  ],
  'Li Auto': [
    { m: 'L 6', type: 'LI_Hybrid' }, { m: 'L 7', type: 'LI_Hybrid' }, { m: 'L 8', type: 'LI_Hybrid' }, { m: 'L 9', type: 'LI_Hybrid' }, { m: 'MEGA', type: 'EV' }
  ],
  'BMW': [
    { m: 'I 3', type: 'EV' }, { m: 'I 4', type: 'EV' }, { m: 'I 5', type: 'EV' }, { m: 'I 7', type: 'EV' }, { m: 'IX', type: 'EV' }, { m: 'IX 3', type: 'EV' },
    { m: '530 I', type: 'Hybrid' }, { m: 'X 5', type: 'Hybrid' }, { m: 'X 7', type: 'Hybrid' }
  ],
  'Mercedes-Benz': [
    { m: 'S Class W 222', type: 'Mers_Lux' }, { m: 'S Class W 223', type: 'Mers_Lux' }, { m: 'E Class', type: 'Mers_Lux' },
    { m: 'EQS', type: 'EV' }, { m: 'EQE', type: 'EV' }, { m: 'G Class', type: 'Mers_Lux' }
  ],
  'Toyota': [
    { m: 'Camry', type: 'Hybrid' }, { m: 'Land Cruiser 300', type: 'Hybrid' }, { m: 'Prado', type: 'Hybrid' }, { m: 'Corolla', type: 'Hybrid' }
  ]
};

const templates = {
  'CHEV_STD': (diag) => [
      {n: '🔍 Diagnostika', p: diag}, {n: '⛽ Benzin sistemasini ko\'rish', p: 120000}, {n: '🚫 Tabloda datchik o\'chirish', p: 50000}, {n: '🕯️ Svechalarni almashtirish', p: 40000},
      {n: '🌀 Drosil tozalash', p: 50000}, {n: '💉 Injector tozalash', p: 70000}, {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 200000},
      {n: '🚀 Stage urish', p: 600000}, {n: '⛽ Gaz regulirovka', p: 50000}, {n: '⛽ Benzin nasos ko\'rish', p: 50000}, {n: '🧵 Simlarni to\'g\'irlash', p: 100000}
  ],
  'Hybrid': [
      {n: '🔍 Diagnostika', p: 100000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 700000}, {n: '🚫 Tabloda datchik o\'chirish', p: 100000}, {n: '🕯️ Svechalarni almashtirish', p: 100000},
      {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000}, {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 800000},
      {n: '🚀 Stage urish', p: 600000}, {n: '⛽ Gaz regulirovka', p: 100000}, {n: '⛽ Benzin nasos ko\'rish', p: 300000}, {n: '🧵 Simlarni to\'g\'irlash', p: 200000},
      {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000}
  ],
  'EV': [
    {n: '🔍 Diagnostika', p: 100000}, { n: '🔋 Batareya holatini tekshirish', p: 200000 }, { n: '🧵 Simlarni to\'g\'irlash (Izolatsiya)', p: 500000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Ilovalar (App) o\'rnatish', p: 100000 }, { n: '🛣️ Probeg tekshirish', p: 100000 },
    { n: '🛞 Batareya yechish', p: 12000000 }, { n: '🔌 Zaryadlash portini remonti', p: 600000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🌀 Konditsioner remont', p: 600000 }, { n: '⚡ Invertor holatini tekshirish', p: 100000 }
  ],
  'LI_Hybrid': [
      {n: '🔍 Diagnostika', p: 100000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 700000}, {n: '🚫 Tabloda datchik o\'chirish', p: 100000}, {n: '🕯️ Svechalarni almashtirish', p: 100000},
      {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000}, {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 800000},
      {n: '🚀 Stage urish', p: 600000}, {n: '⛽ Gaz regulirovka', p: 100000}, {n: '⛽ Benzin nasos ko\'rish', p: 150000}, {n: '🧵 Simlarni to\'g\'irlash', p: 200000},
      {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000}
  ],
  'Mers_Lux': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 150000 }, { n: '🧵 Simlarni to\'g' + "irlash" , p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ]
};

async function wipeAndRebuild() {
    console.log('🧹 AGGRESSIVE WIPE STARTED...');
    
    // Deleting with .neq('id', 'null') is sometimes not enough, 
    // let's use a more direct approach by deleting all rows specifically.
    // In Supabase client, .delete().match({}) often deletes all rows if RLS allows.
    const { error: d1 } = await supabase.from('cars_list').delete().neq('brand', 'IMPOSSIBLE_VALUE');
    const { error: d2 } = await supabase.from('services_list').delete().neq('brand', 'IMPOSSIBLE_VALUE');

    if (d1 || d2) console.error('Wipe error:', d1, d2);

    const brands = Object.keys(fullCatalog);
    const carsToInsert = [];
    const servicesToInsert = [];

    for (const brand of brands) {
        const models = fullCatalog[brand];
        for (const mObj of models) {
            const mName = mObj.m.trim();
            carsToInsert.push({ brand, name: mName });

            let sList = [];
            if (mObj.type === 'CHEV_STD') {
                sList = templates.CHEV_STD(mObj.p);
            } else {
                sList = templates[mObj.type] || templates['Hybrid'];
            }

            sList.forEach(s => {
                servicesToInsert.push({
                    brand,
                    car_model: mName,
                    name: s.n,
                    price: s.p,
                    stavka: 0
                });
            });
        }
    }

    console.log(`📝 Re-inserting ${carsToInsert.length} clean cars...`);
    await supabase.from('cars_list').insert(carsToInsert);

    console.log(`🛠️ Re-inserting ${servicesToInsert.length} clean services...`);
    for (let i = 0; i < servicesToInsert.length; i += 200) {
        await supabase.from('services_list').insert(servicesToInsert.slice(i, i + 200));
    }

    console.log('🏁 CLEAN REBUILD FINISHED!');
}

wipeAndRebuild();
