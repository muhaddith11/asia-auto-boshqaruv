const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const data = {
  'Li Auto': [
    { m: 'LI 6', t: 'H', p: { nasos: 150000 } },
    { m: 'LI 7', t: 'H', p: { nasos: 150000 } },
    { m: 'LI 8', t: 'H', p: { nasos: 150000 } },
    { m: 'LI 9', t: 'H', p: { nasos: 150000 } },
    { m: 'LI 9 Restaling', t: 'H', p: { nasos: 150000 } }
  ],
  'BMW': [
    { m: 'I3', t: 'EV' }, { m: 'I4', t: 'EV' }, { m: 'I5', t: 'EV' }, { m: 'I7', t: 'EV' }, { m: 'IX', t: 'EV' }, { m: 'IX3', t: 'EV' },
    { m: '530 I', t: 'H', p: { nasos: 150000 } },
    { m: '840 I', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'X 3', t: 'H', p: { nasos: 150000 } },
    { m: 'X 5', t: 'H', p: { nasos: 150000 } },
    { m: 'X 6', t: 'H', p: { nasos: 150000 } },
    { m: 'X 7', t: 'H', p: { nasos: 150000 } }
  ],
  'Mercedes-Benz': [
    { m: 'W 124', t: 'H', p: { diag: 50000, sys: 500000, datchik: 50000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000, russ: 150000, app: 100000, gaz: 50000 } },
    { m: 'W 140', t: 'H', p: { diag: 50000, sys: 500000, datchik: 50000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000, russ: 150000, app: 100000, gaz: 50000 } },
    { m: 'W 221', t: 'H', p: { diag: 50000, sys: 500000, datchik: 50000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000, russ: 150000, app: 100000, gaz: 50000 } },
    { m: 'W 222', t: 'H' },
    { m: 'W 223', t: 'H' },
    { m: 'E 200', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'E 350', t: 'H' },
    { m: 'EQA 250', t: 'EV' }, { m: 'EQE 350', t: 'EV' }, { m: 'EQE 450', t: 'EV' }, { m: 'EQB 300', t: 'EV' },
    { m: 'EQS 350', t: 'EV' }, { m: 'EQS 450', t: 'EV' }, { m: 'EQS 450 SUV', t: 'EV' }, { m: 'EQS 580', t: 'EV' }, { m: 'EQS 580 SUV', t: 'EV' },
    { m: 'GL 450', t: 'H', p: { nasos: 150000 } },
    { m: 'GLC 300', t: 'H', p: { nasos: 150000 } },
    { m: 'GLE 450', t: 'H', p: { nasos: 150000 } },
    { m: 'ML 320', t: 'H', p: { diag: 50000, sys: 500000, datchik: 50000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000, russ: 150000, app: 100000, gaz: 50000 } },
    { m: 'SPRINTER', t: 'H', p: { diag: 50000, sys: 500000, datchik: 50000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000, russ: 150000, app: 100000, gaz: 50000 } },
    { m: 'Vito 2007', t: 'H', p: { diag: 50000, sys: 500000, datchik: 50000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000, russ: 150000, app: 100000, gaz: 50000 } },
    { m: 'Vito', t: 'H', p: { diag: 50000, sys: 500000, datchik: 50000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000, russ: 150000, app: 100000, gaz: 50000 } }
  ],
  'Audi': [
    { m: 'E-TRON', t: 'EV' },
    { m: 'A 4', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'A 6', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'A 7', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'Q 2', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'Q 3', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'Q 5', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'Q 8', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } }
  ],
  'Lexus': [
    { m: 'ES 350', t: 'H', p: { diag: 50000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'RX 350', t: 'H', p: { diag: 50000, sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'GX 460', t: 'H', p: { diag: 50000, sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'LX 570', t: 'H', p: { diag: 50000, sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } }
  ],
  'Toyota': [
    { m: 'Corolla', t: 'H', p: { diag: 50000, sys: 500000, datchik: 50000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000, russ: 150000, app: 100000, gaz: 50000 } },
    { m: 'Camry', t: 'H', p: { diag: 50000, sys: 500000, datchik: 50000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000, russ: 150000, app: 100000, gaz: 50000 } },
    { m: 'Highlander', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'Grand Highlander', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'Hilux', t: 'H', p: { diag: 50000, sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'BZ 3', t: 'EV' },
    { m: 'LC 140', t: 'H', p: { diag: 50000, sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'LC 200', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'LC 250', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } },
    { m: 'LC 300', t: 'H', p: { sys: 1000000, nasos: 500000, russ: 150000, app: 600000 } }
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
  { n: '🕯️ Svechalarni almashtirish', pr: 100000 },
  { n: '🌀 Drosil tozalash', pr: p?.drosil || 100000 },
  { n: '💉 Injector tozalash', pr: p?.injector || 600000 },
  { n: '🛣️ Probeg tekshirish', pr: 100000 },
  { n: '💻 Programma yozish', pr: p?.prog || 800000 },
  { n: '🚀 Stage urish', pr: 600000 },
  { n: '⛽ Gaz regulirovka', pr: p?.gaz || 100000 },
  { n: '⛽ Benzin nasos ko\'rish', pr: p?.nasos || 150000 },
  { n: '🧵 Simlarni to\'g' + "irlash" , pr: 200000 },
  { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', pr: p?.russ || 1200000 },
  { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', pr: p?.app || 300000 }
];

async function updateLux() {
    console.log('💎 STARTING LUX BATCH UPDATE V7...');
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
                list = ev_template;
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

    console.log(`📝 Inserting ${cars.length} lux vehicles...`);
    await supabase.from('cars_list').insert(cars);

    console.log(`🛠️ Inserting ${services.length} lux services...`);
    for (let i = 0; i < services.length; i += 200) {
        await supabase.from('services_list').insert(services.slice(i, i + 200));
    }
    console.log('🏁 LUX BATCH UPDATE V7 COMPLETE!');
}

updateLux();
