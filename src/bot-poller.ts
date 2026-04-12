import { createClient } from '@supabase/supabase-js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendTg(method: string, payload: any) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    console.error('Telegram API error:', e);
  }
}

async function handleUpdate(update: any) {
  try {
    if (!update.message) return;
    const { chat, text, contact } = update.message;
    const chatId = chat.id;

    if (text === '/start') {
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: "Salom! Asia Auto Service xodimlar botiga (Polling Mode) xush kelibsiz.",
        reply_markup: {
          keyboard: [[{ text: "📱 Ro'yxatdan o'tish (Tel raqamni yuborish)", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } 
    else if (contact) {
      const phone = contact.phone_number.replace('+', '');
      const { data: worker } = await supabase
        .from('workers')
        .select('*')
        .or(`tel.eq.${phone},tel.eq.+${phone}`)
        .single();

      if (!worker) {
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: "Kechirasiz, sizning telefon raqamingiz xodimlar ro'yxatida topilmadi."
        });
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiaautoservice.com';
        const webAppUrl = `${baseUrl}/bot-ui?phone=${phone}`;
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: `Xush kelibsiz, ${worker.ism}!`,
          reply_markup: {
            inline_keyboard: [[{ text: "🆕 Buyurtma To'ldirish", web_app: { url: webAppUrl } }]]
          }
        });
      }
    }
  } catch (err) {
    console.error('Error handling update:', err);
  }
}

let lastUpdateId = 0;

async function poll() {
  console.log('Bot Poller started...');
  
  // Delete webhook first to enable polling
  await sendTg('deleteWebhook', { drop_pending_updates: true });
  console.log('Webhook deleted, polling enabled.');

  while (true) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
      const data: any = await res.json();

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          await handleUpdate(update);
          lastUpdateId = update.update_id;
        }
      }
    } catch (err) {
      console.error('Polling error:', err);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

poll();
