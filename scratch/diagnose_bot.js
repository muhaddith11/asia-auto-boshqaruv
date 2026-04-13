const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const token = process.env.TELEGRAM_BOT_TOKEN;

async function diagnose() {
  if (!token) {
    console.log('ERROR: TELEGRAM_BOT_TOKEN missing in .env.local');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();
    console.log('--- Webhook Info ---');
    console.log(JSON.stringify(data, null, 2));

    if (data.result && data.result.last_error_message) {
      console.log('\n❌ LAST ERROR:', data.result.last_error_message);
    } else {
      console.log('\n✅ No webhook errors reported by Telegram.');
    }
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}

diagnose();
