const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Manually parser for .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

async function checkWorkers() {
    console.log("Checking Supabase connection...");
    const { data: workers, error } = await supabase
        .from('workers')
        .select('*');

    if (error) {
        console.error("Supabase Error:", error);
        return;
    }

    console.log(`Successfully fetched ${workers.length} workers.`);
    if (workers.length > 0) {
        console.log("First worker keys:", Object.keys(workers[0]));
        console.log("Sample workers:", workers.map(w => ({ id: w.id, name: w.ism, phone: w.tel })).slice(0, 5));
    } else {
        console.log("No workers found. This is a BUG or RLS issue.");
    }
}

checkWorkers();
