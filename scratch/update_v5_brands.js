const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const data = {
  'BYD': [
    { m: 'Song Plus', t: 'EV' },
    { m: 'Song Plus Gibrid', t: 'Hybrid' },
    { m: 'Champion Gibrid', t: 'Hybrid' },
    { m: 'Chazor', t: 'Hybrid' },
    { m: 'Seal', t: 'Hybrid' },
    { m: 'Xan Gibrid', t: 'Hybrid' },
    { m: 'Song Pro', t: 'Hybrid' },
    { m: 'Seagull', t: 'EV' },
    { m: 'Tang', t: 'Hybrid' },
    { m: 'Yuan', t: 'EV' },
    { m: 'Yuan Up', t: 'EV' },
    { m: 'Yuan Up Gibrid', t: 'Hybrid', p: { sys: 1000000, datchik: 200000, nasos: 500000, app: 1200000 } }
  ],
  'Kia': [
    { m: 'Carnival', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'Bongo', t: 'Hybrid', p: { sys: 500000, nasos: 150000 } },
    { m: 'Bongo EV', t: 'EV' },
    { m: 'EV 3', t: 'EV' },
    { m: 'EV 5', t: 'EV' },
    { m: 'EV 6', t: 'EV' },
    { m: 'EV 9', t: 'EV' },
    { m: 'K 3', t: 'Hybrid', p: { sys: 500000, nasos: 150000 } },
    { m: 'K 5', t: 'Hybrid', p: { sys: 500000, nasos: 150000 } },
    { m: 'K 8', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'K 8 Restaylin', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'K 9', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'Morning', t: 'Hybrid', p: { sys: 400000, nasos: 150000 } },
    { m: 'Seltos', t: 'Hybrid', p: { sys: 500000, nasos: 150000 } },
    { m: 'Sorento', t: 'Hybrid', p: { sys: 600000, nasos: 150000 } },
    { m: 'Sportage', t: 'Hybrid', p: { sys: 600000, nasos: 150000 } }
  ],
  'Hyundai': [
    { m: 'Elantra', t: 'Hybrid', p: { sys: 600000, nasos: 150000 } },
    { m: 'Creta', t: 'Hybrid', p: { sys: 500000, nasos: 150000 } },
    { m: 'Ioniq 5', t: 'EV' },
    { m: 'Ioniq 6', t: 'EV' },
    { m: 'Ioniq 9', t: 'EV' },
    { m: 'Palisade', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'Porter', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'Santa fe', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'Sonata', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'Sonata 2008', t: 'Hybrid', p: { diag: 50000, sys: 150000, svecha: 50000, drosil: 50000, injector: 100000, nasos: 50000, prog: 200000 } },
    { m: 'Staria', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'Starex', t: 'Hybrid', p: { nasos: 150000 } },
    { m: 'Tranjet', t: 'Hybrid', p: { sys: 400000, nasos: 150000 } }
  ],
  'Chery': [
    { m: 'Arizo 6 Pro', t: 'Hybrid', p: { diag: 50000, injector: 400000 } },
    { m: 'Arizo 7 Pro', t: 'Hybrid', p: { diag: 50000, injector: 400000 } },
    { m: 'Tiggo 2', t: 'Hybrid', p: { diag: 50000, injector: 400000 } },
    { m: 'Tiggo 6 Pro', t: 'Hybrid', p: { diag: 50000, injector: 400000 } },
    { m: 'Tiggo 7 Pro', t: 'Hybrid', p: { diag: 50000, injector: 400000 } },
    { m: 'Tiggo 8 Pro', t: 'Hybrid', p: { diag: 50000, injector: 400000 } }
  ]
};

const ev_template = [
  { n: '🔍 Diagnostika', pr: 100000 },
  { n: '🔋 Batareya holatini tekshirish', pr: 200000 },
  { n: '🧵 Simlarni to\'g' + "irlash (Izolatsiya)" , pr: 500000 },
  { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', pr: 1200000 },
  { n: '📱 Ilovalar (App) o\'rnatish', pr: 100000 },
  { n: '🛣️ Probeg tekshirish', pr: 100000 },
  { n: '🛞 Batareya yechish', pr: 12000000 },
  { n: '🔌 Zaryadlash portini remonti', pr: 600000 },
  { n: '🚫 Tabloda datchik o\'chirish', pr: 100000 },
  { n: '🌀 Konditsioner remont', pr: 600000 },
  { n: '⚡ Invertor holatini tekshirish', pr: 100000 }
];

const hybrid_template = (p) => [
  { n: '🔍 Diagnostika', pr: p?.diag || 100000 },
  { n: '⛽ Benzin sistemasini ko\'rish', pr: p?.sys || 700000 },
  { n: '🚫 Tabloda datchik o\'chirish', pr: p?.datchik || 100000 },
  { n: '🕯️ Svechalarni almashtirish', pr: p?.svecha || 100000 },
  { n: '🌀 Drosil tozalash', pr: p?.drosil || 100000 },
  { n: '💉 Injector tozalash', pr: p?.injector || 600000 },
  { n: '🛣️ Probeg tekshirish', pr: 100000 },
  { n: '💻 Programma yozish', pr: p?.prog || 800000 },
  { n: '🚀 Stage urish', pr: 600000 },
  { n: '⛽ Gaz regulirovka', pr: 100000 },
  { n: '⛽ Benzin nasos ko\'rish', pr: p?.nasos || 300000 },
  { n: '🧵 Simlarni to\'g' + "irlash" , pr: 200000 },
  { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', pr: 1200000 },
  { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', pr: p?.app || 300000 }
];

async function updateAll() {
    console.log('🔄 STARTING FINAL UPDATE FOR 4 BRANDS...');
    
    // Clear old data for these brands
    const bList = Object.keys(data);
    await supabase.from('services_list').delete().in('brand', bList);
    await supabase.from('cars_list').delete().in('brand', bList);

    const services = [];
    const cars = [];

    for (const b of bList) {
        for (const model of data[b]) {
            cars.push({ brand: b, name: model.m });
            let list = [];
            if (model.t === 'EV') {
                list = ev_template.map(item => ({ ...item, pr: model.p?.[item.n] || item.pr }));
            } else {
                list = hybrid_template(model.p);
            }

            list.forEach(s => {
                services.push({
                    brand: b,
                    car_model: model.m,
                    name: s.n,
                    price: s.pr,
                    stavka: 0
                });
            });
        }
    }

    console.log(`📝 Inserting ${cars.length} cars...`);
    await supabase.from('cars_list').insert(cars);

    console.log(`🛠️ Inserting ${services.length} services...`);
    for (let i = 0; i < services.length; i += 200) {
        await supabase.from('services_list').insert(services.slice(i, i + 200));
    }

    console.log('🏁 ALL 4 BRANDS UPDATED SUCCESSFULLY!');
}

updateAll();
