const fs = require('fs');

async function checkSchema() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
    });

    console.log("Checking workers table schema and permissions...");

    // Try to see if we can at least get the column names or an error from PostgREST
    const url = `${env.SUPABASE_URL}/rest/v1/workers?select=*&limit=1`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
            }
        });

        const text = await response.text();
        console.log("Raw Response:", text);
        
        if (!response.ok) {
            console.error(`Baza xatosi (${response.status}):`, text);
        } else {
            console.log("Baza javob berdi. RLS SELECT uchun ochiq bo'lishi mumkin.");
        }

    } catch (err) {
        console.error("Ulanishda xato:", err.message);
    }
}

checkSchema();
