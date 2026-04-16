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
    { m: 'Yuan', type: 'EV' }, { m: 'Yuan Up EV', type: 'EV' }, { m: 'Yuan Up Gibrid', type: 'Hybrid_High' }
  ],
  'Kia': [
    { m: 'Carnival', type: 'Hybrid' }, { m: 'Bongo', type: 'Bongo_Kia' }, { m: 'Bongo EV', type: 'EV' },
    { m: 'EV 3', type: 'EV' }, { m: 'EV 5', type: 'EV' }, { m: 'EV 6', type: 'EV' }, { m: 'EV 9', type: 'EV' },
    { m: 'K 3', type: 'Hybrid' }, { m: 'K 5', type: 'Hybrid' }, { m: 'K 8', type: 'Hybrid' }, { m: 'K 8 Restaylin', type: 'Hybrid' },
    { m: 'K 9', type: 'Hybrid' }, { m: 'Morning', type: 'Hybrid_Small' }, { m: 'Seltos', type: 'Hybrid' }, { m: 'Sorento', type: 'Hybrid' }, { m: 'Sportage', type: 'Hybrid' }
  ],
  'Hyundai': [
    { m: 'Elantra', type: 'Hybrid' }, { m: 'Creta', type: 'Hybrid' }, { m: 'Ioniq 5', type: 'EV' }, { m: 'Ioniq 6', type: 'EV' },
    { m: 'Ioniq 9', type: 'EV' }, { m: 'Palisade', type: 'Hybrid' }, { m: 'Porter', type: 'Hybrid' }, { m: 'Santa Fe', type: 'Hybrid' },
    { m: 'Sonata', type: 'Hybrid' }, { m: 'Sonata 2008', type: 'Sonata_Old' }, { m: 'Staria', type: 'Hybrid' }, { m: 'Starex', type: 'Hybrid' }, { m: 'Tranjet', type: 'Hybrid_Small' }
  ],
  'Li Auto': [
    { m: 'LI 6', type: 'LI_Premium' }, { m: 'LI 7', type: 'LI_Premium' }, { m: 'LI 8', type: 'LI_Premium' }, { m: 'LI 9', type: 'LI_Premium' }, { m: 'LI 9 Restaling', type: 'LI_Premium' }
  ],
  'BMW': [
    { m: 'I3', type: 'EV' }, { m: 'I4', type: 'EV' }, { m: 'I5', type: 'EV' }, { m: 'I7', type: 'EV' }, { m: 'IX', type: 'EV' }, { m: 'IX3', type: 'EV' },
    { m: '530 I', type: 'BMW_Premium' }, { m: '840 I', type: 'BMW_Lux' }, { m: 'X 3', type: 'BMW_Premium' }, { m: 'X 5', type: 'BMW_Premium' }, { m: 'X 6', type: 'BMW_Premium' }, { m: 'X 7', type: 'BMW_Premium' }
  ],
  'Mercedes-Benz': [
    { m: 'W 124', type: 'Mers_Old' }, { m: 'W 140', type: 'Mers_Old' }, { m: 'W 221', type: 'Mers_Old' }, { m: 'W 222', type: 'Mers_Premium' }, { m: 'W 223', type: 'Mers_Premium' },
    { m: 'E 200', type: 'Mers_Lux' }, { m: 'E 350', type: 'Mers_Premium' }, { m: 'EQA 250', type: 'EV' }, { m: 'EQE 350', type: 'EV' }, { m: 'EQS 450', type: 'EV' },
    { m: 'GL 450', type: 'Mers_Premium' }, { m: 'GLE 450', type: 'Mers_Premium' }, { m: 'ML 320', type: 'Mers_Old' }, { m: 'Sprinter', type: 'Mers_Old' }, { m: 'Vito', type: 'Mers_Old' }
  ],
  'Toyota': [
    { m: 'Corolla', type: 'Toyota_Std' }, { m: 'Camry', type: 'Toyota_Std' }, { m: 'Highlander', type: 'Toyota_Lux' }, { m: 'Hilux', type: 'Toyota_Lux' },
    { m: 'LC 200', type: 'Toyota_Lux' }, { m: 'LC 300', type: 'Toyota_Lux' }, { m: 'BZ 3', type: 'EV' }
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
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Ilovalar (App) o' + "'" + 'rnatish', p: 100000 }, { n: '🛣️ Probeg tekshirish', p: 100000 },
    { n: '🛞 Batareya yechish', p: 12000000 }, { n: '🔌 Zaryadlash portini remonti', p: 600000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🌀 Konditsioner remont', p: 600000 }, { n: '⚡ Invertor holatini tekshirish', p: 100000 }
  ],
  'LI_Premium': [
      {n: '🔍 Diagnostika', p: 100000}, {n: '⛽ Benzin sistemasini ko\'rish', p: 700000}, {n: '🚫 Tabloda datchik o\'chirish', p: 100000}, {n: '🕯️ Svechalarni almashtirish', p: 100000},
      {n: '🌀 Drosil tozalash', p: 100000}, {n: '💉 Injector tozalash', p: 600000}, {n: '🛣️ Probeg tekshirish', p: 100000}, {n: '💻 Programma yozish', p: 800000},
      {n: '🚀 Stage urish', p: 600000}, {n: '⛽ Gaz regulirovka', p: 100000}, {n: '⛽ Benzin nasos ko\'rish', p: 150000}, {n: '🧵 Simlarni to\'g\'irlash', p: 200000},
      {n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000}, {n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000}
  ],
  'Mers_Premium': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 150000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ],
  'BMW_Premium': [
    { n: '🔍 Diagnostika', p: 100000 }, { n: '⛽ Benzin sistemasini ko\'rish', p: 700000 }, { n: '🚫 Tabloda datchik o\'chirish', p: 100000 },
    { n: '🕯️ Svechalarni almashtirish', p: 100000 }, { n: '🌀 Drosil tozalash', p: 100000 }, { n: '💉 Injector tozalash', p: 600000 },
    { n: '🛣️ Probeg tekshirish', p: 100000 }, { n: '💻 Programma yozish', p: 800000 }, { n: '🚀 Stage urish', p: 600000 },
    { n: '⛽ Gaz regulirovka', p: 100000 }, { n: '⛽ Benzin nasos ko\'rish', p: 150000 }, { n: '🧵 Simlarni to\'g\'irlash', p: 200000 },
    { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', p: 1200000 }, { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', p: 300000 }
  ]
};

async function wipeAndRebuild() {
    console.log('🧹 Wiping old data...');
    await supabase.from('cars_list').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('services_list').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const brands = Object.keys(fullCatalog);
    const carsToInsert = [];
    const servicesToInsert = [];

    for (const brand of brands) {
        const models = fullCatalog[brand];
        for (const mObj of models) {
            carsToInsert.push({ brand, name: mObj.m });

            let sList = [];
            if (mObj.type === 'CHEV_STD') {
                sList = templates.CHEV_STD(mObj.p);
            } else {
                sList = templates[mObj.type] || templates['Hybrid'];
            }

            sList.forEach(s => {
                servicesToInsert.push({
                    brand,
                    car_model: mObj.m,
                    name: s.n,
                    price: s.p,
                    stavka: 0
                });
            });
        }
    }

    console.log(`📝 Inserting ${carsToInsert.length} cars...`);
    await supabase.from('cars_list').insert(carsToInsert);

    console.log(`🛠️ Inserting ${servicesToInsert.length} services...`);
    for (let i = 0; i < servicesToInsert.length; i += 200) {
        await supabase.from('services_list').insert(servicesToInsert.slice(i, i + 200));
    }

    console.log('🏁 CLEAN REBUILD COMPLETE!');
}

wipeAndRebuild();
