const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const otherModels = [
  { m: 'Jac J7', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } },
  { m: 'Jac M4', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } },
  { m: 'Deepal S7', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 250000, prog: 800000 } },
  { m: 'Foton', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } },
  { m: 'Skoda Kodiaq', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 250000, prog: 800000 } },
  { m: 'Im Motors L7', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } },
  { m: 'Nissan Altima', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } },
  { m: 'Range Rover Velar', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 250000, prog: 800000 } },
  { m: 'Wuling Baojun', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } },
  { m: 'Honji HS7', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } },
  { m: 'Jaguar', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 250000, prog: 800000 } },
  { m: 'Porsche Taycan', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 250000, prog: 800000 } },
  { m: 'Dong Feng 008', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 250000, prog: 800000 } },
  { m: 'Shineray T30', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 250000, prog: 800000 } },
  { m: 'iCar 03', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 250000, prog: 800000 } },
  { m: 'Denza N9', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 250000, prog: 800000 } },
  { m: 'Ling co 900', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } },
  { m: 'Mazda 6', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } },
  { m: 'Dong Feng Aeolus', p: { diag: 50000, sys: 500000, drosil: 80000, injector: 300000, nasos: 250000, prog: 400000 } }
];

async function updateOther() {
    console.log('📦 UPDATING "BOSHQA" BRAND CATEGORY...');
    
    // Clear and Replace logic for "Boshqa" brand
    await supabase.from('services_list').delete().eq('brand', 'Boshqa');
    await supabase.from('cars_list').delete().eq('brand', 'Boshqa');

    const services = [];
    const cars = [];

    otherModels.forEach(model => {
        cars.push({ brand: 'Boshqa', name: model.m });
        const p = model.p;
        const list = [
            { n: '🔍 Diagnostika', pr: p.diag || 100000 },
            { n: '⛽ Benzin sistemasini ko\'rish', pr: p.sys || 700000 },
            { n: '🚫 Tabloda datchik o\'chirish', pr: 100000 },
            { n: '🕯️ Svechalarni almashtirish', pr: 100000 },
            { n: '🌀 Drosil tozalash', pr: p.drosil || 100000 },
            { n: '💉 Injector tozalash', pr: p.injector || 600000 },
            { n: '🛣️ Probeg tekshirish', pr: 100000 },
            { n: '💻 Programma yozish', pr: p.prog || 800000 },
            { n: '🚀 Stage urish', pr: 600000 },
            { n: '⛽ Gaz regulirovka', pr: 50000 },
            { n: '⛽ Benzin nasos ko\'rish', pr: p.nasos || 300000 },
            { n: '🧵 Simlarni to\'g' + "irlash" , pr: 200000 },
            { n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', pr: 150000 },
            { n: '📱 Prilojeniye (Ilovalar) o\'rnatish', pr: 100000 }
        ];

        list.forEach(s => {
            services.push({
                brand: 'Boshqa',
                car_model: model.m,
                name: s.n,
                price: s.pr,
                stavka: 0
            });
        });
    });

    console.log(`📝 Inserting ${cars.length} general vehicles...`);
    await supabase.from('cars_list').insert(cars);

    console.log(`🛠️ Inserting ${services.length} general services...`);
    for (let i = 0; i < services.length; i += 200) {
        await supabase.from('services_list').insert(services.slice(i, i + 200));
    }
    console.log('🏁 "BOSHQA" BRAND UPDATED SUCCESSFULLY!');
}

updateOther();
