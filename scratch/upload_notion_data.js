const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://fwktbleovtkxxpsccqqr.supabase.co';
const supabaseKey = 'sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const dataPath = path.join(__dirname, 'parsed_notion_data.json');
    const allData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // We don't wipe first, we'll just upsert which overrides duplicates and adds new ones.
    console.log('Preparing unique cars and services...');

    let carsMap = new Map();
    let servicesMap = new Map();

    for (const brand in allData) {
        if (brand.toLowerCase() === 'xizmat') continue;

        for (const model in allData[brand]) {
            const b = brand.trim();
            let m = model.trim();
            if (m.startsWith('**') && m.endsWith('**')) m = m.slice(2, -2).trim();
            if (!m) continue;

            const carKey = `${b}_${m}`;
            if (!carsMap.has(carKey)) {
                carsMap.set(carKey, { brand: b, name: m });
            }

            for (const s of allData[brand][model].services) {
                const sKey = `${s.name}_${b}_${m}`;
                if (!servicesMap.has(sKey)) {
                    servicesMap.set(sKey, {
                        name: s.name,
                        price: s.price,
                        brand: b,
                        car_model: m,
                        stavka: 0
                    });
                }
            }
        }
    }

    const carsToInsert = Array.from(carsMap.values());
    const servicesToInsert = Array.from(servicesMap.values());

    console.log(`Upserting ${carsToInsert.length} unique cars...`);
    const chunkSize = 200;
    for (let i = 0; i < carsToInsert.length; i += chunkSize) {
        const chunk = carsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('cars_list').upsert(chunk, { onConflict: 'brand,name' });
        if (error) console.error('Error upserting cars:', error.message);
    }

    console.log(`Upserting ${servicesToInsert.length} unique services...`);
    for (let i = 0; i < servicesToInsert.length; i += chunkSize) {
        const chunk = servicesToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('services_list').upsert(chunk, { onConflict: 'name,brand,car_model' });
        if (error) console.error('Error upserting services:', error.message);
        else process.stdout.write('.');
    }

    console.log('\nDone! Restoration via UPSERT from Notion complete.');
}

run().catch(console.error);
