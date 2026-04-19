const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const data = {
  'HAVAL': [
    { m: 'M6', t: 'H', p: { diag: 50000, injector: 400000 } },
    { m: 'H6', t: 'H', p: { diag: 50000, injector: 400000 } },
    { m: 'JOLION', t: 'H', p: { diag: 50000, injector: 400000 } },
    { m: 'DARGO', t: 'H', p: { diag: 50000, injector: 400000 } }
  ],
  'Jetour': [
    { m: 'X 70', t: 'H', p: { diag: 50000, injector: 400000 } },
    { m: 'X90', t: 'H', p: { diag: 50000, injector: 400000 } },
    { m: 'X95', t: 'H', p: { diag: 50000, injector: 400000 } },
    { m: 'DASHING', t: 'H', p: { diag: 50000, injector: 400000 } }
  ],
  'Bestune': [
    { m: 'T 33', t: 'H', p: { diag: 50000, sys: 500000, injector: 400000 } },
    { m: 'T 55', t: 'H', p: { diag: 50000, sys: 600000, injector: 400000 } },
    { m: 'T 77', t: 'H', p: { diag: 50000, sys: 500000, injector: 400000 } },
    { m: 'T 99', t: 'H', p: { diag: 50000, injector: 400000 } },
    { m: 'B 70', t: 'H', p: { diag: 50000, injector: 400000 } }
  ],
  'Leapmotors': [
    { m: 'C 01', t: 'EV' }, { m: 'C 10', t: 'EV' }, { m: 'C 11', t: 'EV' }, { m: 'C 16', t: 'EV' }
  ],
  'Lada': [
    { m: 'Vesta', t: 'H', p: { diag: 50000, sys: 300000, injector: 400000, nasos: 100000, prog: 500000 } },
    { m: 'X ray', t: 'H', p: { diag: 50000, sys: 300000, injector: 400000, nasos: 100000, prog: 500000 } },
    { m: 'Gazel', t: 'H', p: { diag: 50000, sys: 300000, injector: 400000, nasos: 100000, prog: 500000 } },
    { m: 'Granta', t: 'H', p: { diag: 50000, sys: 300000, injector: 400000, nasos: 100000, prog: 500000 } }
  ],
  'Volkswagen': [
    { m: 'ID 3', t: 'EV' }, { m: 'ID 4', t: 'EV' }, { m: 'ID 6', t: 'EV' },
    { m: 'CADDY', t: 'H', p: { diag: 50000, sys: 300000, injector: 400000, nasos: 100000, prog: 400000 } }
  ]
};

const ev_template = [
  { n: '🔍 Diagnostika', pr: 100000 },
  { n: '🔋 Batareya holatini tekshirish', pr: 200000 },
  { n: '🧵 Simlarni to\'g' + "irlash (Izolatsiya)" , pr: 500000 },
  { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', pr: 1200000 },
  { n: '📱 Ilovalar (App) o\'rnatish', pr: 200000 }, // Leapmotors says 200k for apps
  { n: '🛣️ Probeg tekshirish', pr: 100000 },
  { n: '🛞 Batareya yechish', pr: 12000000 },
  { n: '🔌 Zaryadlash portini remonti', pr: 600000 },
  { n: '🚫 Tabloda datchik o\'chirish', pr: 100000 },
  { n: '🌀 Konditsioner remont', pr: 600000 },
  { n: '⚡ Invertor holatini tekshirish', pr: 100000 }
];

// Base template for ICE/Hybrid
const ice_template = (p) => [
  { n: '🔍 Diagnostika', pr: p?.diag || 100000 },
  { n: '⛽ Benzin sistemasini ko\'rish', pr: p?.sys || 700000 },
  { n: '🚫 Tabloda datchik o\'chirish', pr: 100000 },
  { n: '🕯️ Svechalarni almashtirish', pr: 100000 },
  { n: '🌀 Drosil tozalash', pr: 100000 },
  { n: '💉 Injector tozalash', pr: p?.injector || 600000 },
  { n: '🛣️ Probeg tekshirish', pr: 100000 },
  { n: '💻 Programma yozish', pr: p?.prog || 800000 },
  { n: '🚀 Stage urish', pr: 600000 },
  { n: '⛽ Gaz regulirovka', pr: 100000 },
  { n: '⛽ Benzin nasos ko\'rish', pr: p?.nasos || 300000 },
  { n: '🧵 Simlarni to\'g' + "irlash" , pr: 200000 },
  { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', pr: 1200000 },
  { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', pr: 300000 }
];

async function updateV6() {
    console.log('🔄 STARTING BATCH UPDATE V6...');
    const bList = Object.keys(data);
    
    // Clear and Replace logic
    await supabase.from('services_list').delete().in('brand', bList);
    await supabase.from('cars_list').delete().in('brand', bList);

    const services = [];
    const cars = [];

    for (const b of bList) {
        for (const model of data[b]) {
            cars.push({ brand: b, name: model.m });
            let list = [];
            if (model.t === 'EV') {
                // Adjust apps price for Leapmotors vs others if needed, but here Leap says 200k
                list = ev_template.map(item => {
                    let price = item.pr;
                    if (b === 'Volkswagen' && item.n === '📱 Ilovalar (App) o\'rnatish') price = 100000;
                    return { ...item, pr: price };
                });
            } else {
                list = ice_template(model.p);
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

    console.log(`📝 Re-inserting ${cars.length} vehicles...`);
    await supabase.from('cars_list').insert(cars);

    console.log(`🛠️ Re-inserting ${services.length} services...`);
    for (let i = 0; i < services.length; i += 200) {
        await supabase.from('services_list').insert(services.slice(i, i + 200));
    }
    console.log('🏁 BATCH UPDATE V6 COMPLETE!');
}

updateV6();
