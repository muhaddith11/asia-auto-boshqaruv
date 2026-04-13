const fs = require('fs');

async function debug() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
    });

    const url = `${env.SUPABASE_URL}/rest/v1/workers?select=*`;
    
    console.log("Requesting workers from:", env.SUPABASE_URL);

    try {
        const response = await fetch(url, {
            headers: {
                'apikey': env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`HTTP Error ${response.status}: ${errBody}`);
            return;
        }

        const data = await response.json();
        console.log(`Successfully found ${data.length} workers.`);
        data.forEach(w => {
            console.log(`- ID: ${w.id}, Name: ${w.ism}, Phone: ${w.tel}`);
        });

    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}

debug();
