const fs = require('fs');

async function testApi() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
    });

    console.log("Testing POST to /api/workers local simulation...");

    try {
        // Test fetching first
        const getRes = await fetch(`${env.SUPABASE_URL}/rest/v1/workers?select=*`, {
            headers: { 'apikey': env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}` }
        });
        console.log("GET /workers status:", getRes.status);
        if (!getRes.ok) console.log("GET error:", await getRes.text());
        else console.log("Current workers count:", (await getRes.json()).length);

        // Test inserting a dummy
        const dummy = { ism: 'Test Xodim', tel: '998991234567', mutax: 'Test', foiz: 50 };
        const postRes = await fetch(`${env.SUPABASE_URL}/rest/v1/workers`, {
            method: 'POST',
            headers: { 
                'apikey': env.SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(dummy)
        });
        console.log("POST /workers status:", postRes.status);
        if (!postRes.ok) console.log("POST error:", await postRes.text());
        else console.log("Successfully inserted test worker!");

    } catch (err) {
        console.error("Test failed:", err.message);
    }
}

testApi();
