const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fwktbleovtkxxpsccqqr.supabase.co', 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL');

const chevData = [
  { m: 'Matiz', p: { diag: 50000, sys: 120000, injector: 70000, nasos: 50000 } },
  { m: 'Tico', p: { diag: 50000, sys: 120000, injector: 70000, nasos: 50000 } },
  { m: 'Damas', p: { diag: 50000, sys: 100000, injector: 70000, nasos: 70000 } },
  { m: 'Nexia 1', p: { diag: 50000, sys: 120000, injector: 70000, nasos: 50000 } },
  { m: 'Nexia 2', p: { diag: 50000, sys: 120000, injector: 70000, nasos: 50000 } },
  { m: 'Nexia 3', p: { diag: 50000, sys: 150000, injector: 70000, nasos: 50000, svecha: 50000 } },
  { m: 'Lasseti', p: { diag: 50000, sys: 120000, injector: 70000, nasos: 50000, svecha: 50000 } },
  { m: 'Spark', p: { diag: 50000, sys: 150000, injector: 100000, nasos: 50000, svecha: 50000 } },
  { m: 'Captiva 1-2-3', p: { diag: 50000, sys: 500000, injector: 400000, nasos: 100000, probeg: 200000, prog: 30000, drosil: 100000, svecha: 100000 } },
  { m: 'Captiva 4', p: { diag: 50000, sys: 300000, injector: 400000, nasos: 100000, prog: 400000, drosil: 100000, svecha: 100000 } },
  { m: 'Captiva 5', p: { diag: 50000, sys: 400000, datchik: 100000, injector: 200000, nasos: 80000, prog: 800000, extra: true } },
  { m: 'Gentra', p: { diag: 50000, sys: 120000, injector: 70000, nasos: 50000 } },
  { m: 'Cruze', p: { diag: 50000, sys: 120000, svecha: 50000, nasos: 70000, extra: true } },
  { m: 'Cobalt', p: { diag: 50000, sys: 400000, injector: 80000, nasos: 200000 } },
  { m: 'Epica', p: { diag: 50000, sys: 500000, svecha: 200000, drosil: 100000, injector: 250000, probeg: 50000, nasos: 80000, prog: 300000 } },
  { m: 'Onix', p: { diag: 50000, sys: 400000, drosil: 80000, nasos: 250000 } },
  { m: 'Malibu 1', p: { diag: 50000, sys: 250000, drosil: 80000, injector: 150000, nasos: 80000, extra: true } },
  { m: 'Malibu 2', p: { diag: 50000, sys: 900000, svecha: 100000, drosil: 80000, injector: 600000, nasos: 250000, prog: 600000, stage: 800000, extra: true } },
  { m: 'Malibu 2.4', p: { diag: 50000, sys: 500000, svecha: 100000, drosil: 80000, injector: 300000, nasos: 250000, sim: 200000, prog: 400000, extra: true } },
  { m: 'Tracker 1', p: { diag: 50000, sys: 500000, drosil: 70000, injector: 100000, nasos: 300000, prog: 400000, extra: true } },
  { m: 'Tracker 2', p: { diag: 50000, sys: 500000, drosil: 70000, injector: 100000, nasos: 300000, prog: 400000, extra: true } },
  { m: 'Equinox 1', p: { diag: 50000, sys: 1000000, svecha: 100000, drosil: 100000, injector: 600000, nasos: 400000, prog: 600000, app: 600000, extra: true } },
  { m: 'Equinox 2', p: { diag: 50000, sys: 1000000, svecha: 100000, drosil: 100000, injector: 600000, nasos: 400000, prog: 600000, app: 600000, extra: true } },
  { m: 'Orlando', p: { diag: 50000, sys: 500000, drosil: 70000, injector: 100000, probeg: 50000, nasos: 300000, extra: true } },
  { m: 'Monza', p: { diag: 50000, sys: 400000, drosil: 80000, injector: 800000, nasos: 250000, prog: 500000, app: 400000, extra: true } },
  { m: 'Traverse 1', p: { diag: 50000, sys: 1000000, svecha: 100000, drosil: 100000, injector: 600000, gaz: 100000, nasos: 500000, sim: 200000, prog: 800000, app: 600000, extra: true } },
  { m: 'Traverse 2', p: { diag: 50000, sys: 1000000, svecha: 100000, drosil: 100000, injector: 600000, gaz: 100000, nasos: 500000, sim: 200000, prog: 800000, app: 600000, extra: true } },
  { m: 'Tahoe 1', p: { diag: 50000, sys: 1000000, svecha: 100000, drosil: 100000, injector: 600000, gaz: 100000, nasos: 500000, sim: 200000, prog: 800000, app: 600000, extra: true } },
  { m: 'Tahoe 2', p: { diag: 50000, sys: 1000000, svecha: 100000, drosil: 100000, injector: 600000, gaz: 100000, nasos: 500000, sim: 200000, prog: 800000, app: 600000, extra: true } },
  { m: 'Trailblazer', p: { diag: 50000, sys: 1000000, svecha: 100000, drosil: 100000, injector: 600000, nasos: 400000, prog: 600000, app: 600000, extra: true } }
];

async function updateChefData() {
    console.log('🚙 UPDATING CHEVROLET SPECIFIC PRICES...');
    
    // We update by inserting. Our API will properly case and merge.
    const servicesToInsert = [];

    chevData.forEach(car => {
        const m = car.m;
        const p = car.p;

        const list = [
            {n: '🔍 Diagnostika', pr: p.diag || 50000},
            {n: '⛽ Benzin sistemasini ko\'rish', pr: p.sys || 120000},
            {n: '🚫 Tabloda datchik o\'chirish', pr: p.datchik || 50000},
            {n: '🕯️ Svechalarni almashtirish', pr: p.svecha || 40000},
            {n: '🌀 Drosil tozalash', pr: p.drosil || 50000},
            {n: '💉 Injector tozalash', pr: p.injector || 70000},
            {n: '🛣️ Probeg tekshirish', pr: p.probeg || 100000},
            {n: '💻 Programma yozish', pr: p.prog || 200000},
            {n: '🚀 Stage urish', pr: p.stage || 600000},
            {n: '⛽ Gaz regulirovka', pr: p.gaz || 50000},
            {n: '⛽ Benzin nasos ko\'rish', pr: p.nasos || 50000},
            {n: '🧵 Simlarni to\'g' + "irlash" , pr: p.sim || 100000}
        ];

        if (p.extra) {
            list.push({n: '🇷🇺 Russifikatsiya (Rus tilida qilish)', pr: 150000});
            list.push({n: '📱 Prilojeniye (Ilovalar) o\'rnatish', pr: p.app || 100000});
        }

        list.forEach(s => {
            servicesToInsert.push({
                brand: 'Chevrolet',
                car_model: m,
                name: s.n,
                price: s.pr,
                stavka: 0
            });
        });
    });

    // Delete existing Chevrolet services to avoid merge chaos
    console.log('🗑️ Clearing old Chevrolet entries...');
    await supabase.from('services_list').delete().eq('brand', 'Chevrolet');
    await supabase.from('cars_list').delete().eq('brand', 'Chevrolet');
    
    const carsToInsert = chevData.map(c => ({ brand: 'Chevrolet', name: c.m }));
    await supabase.from('cars_list').insert(carsToInsert);

    console.log(`📝 Inserting ${servicesToInsert.length} exact Chevrolet services...`);
    for (let i = 0; i < servicesToInsert.length; i += 100) {
        await supabase.from('services_list').insert(servicesToInsert.slice(i, i + 100));
    }

    console.log('✅ CHEVROLET UPDATED SUCCESSFULLY!');
}

updateChefData();
