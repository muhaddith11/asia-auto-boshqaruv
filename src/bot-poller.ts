import supabase from '@/lib/supabaseClient';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is missing!');
  // Don't exit process here because it runs inside instrumentation hook
}

async function sendTg(method: string, payload: any) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!result.ok) {
      console.error(`Telegram API error (${method}):`, result);
    }
    return result;
  } catch (e) {
    console.error(`Telegram fetch error (${method}):`, e);
    return { ok: false, error: String(e) };
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
      const rawPhone = contact.phone_number;
      // Normalize: remove all non-digits
      const normalizedPhone = rawPhone.replace(/\D/g, '');
      
      console.log(`Checking worker for phone: ${normalizedPhone} (raw: ${rawPhone})`);
      
      // DEBUG: CHECK TOTAL WORKERS COUNT
      const { count: totalWorkers } = await supabase.from('workers').select('*', { count: 'exact', head: true });

      const { data: worker, error: dbError } = await supabase
        .from('workers')
        .select('*')
        .or(`tel.eq.${normalizedPhone},tel.eq.+${normalizedPhone},tel.ilike.%${normalizedPhone.slice(-9)}`)
        .limit(1)
        .maybeSingle();

      if (dbError) {
        console.error('Database query error:', dbError);
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: `Texnik xatolik: Ma'lumotlar bazasiga ulanib bo'lmadi.\nXato: ${dbError.message}`
        });
        return;
      }

      if (!worker) {
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: `🕵️‍♂️ Diagnostika:\n• Raqam aniqlandi: ${normalizedPhone}\n• Bazadagi jami xodimlar soni: ${totalWorkers || 0}\n\nKechirasiz, bu raqam xodimlar ro'yxatida topilmadi. Agar bazada xodimlar bo'lsa-yu, bu yerda 0 chiqsa - Supabase RLS sozlamalarini tekshiring.`
        });
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asiaautoservice.com';
        // Use normalized phone for the WebApp URL
        const webAppUrl = `${baseUrl}/bot-ui?phone=${normalizedPhone}`;
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: `✅ Xush kelibsiz, ${worker.ism}!\nAsia Auto Service tizimiga kirdingiz.`,
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

let isPollingStarted = false;

export async function startBotPolling() {
  if (isPollingStarted) return;
  isPollingStarted = true;

  console.log('Bot Poller starting from Instrumentation...');
  
  try {
    // Delete webhook first to enable polling
    await sendTg('deleteWebhook', { drop_pending_updates: true });
    console.log('Webhook deleted, polling enabled.');
  } catch (e) {
    console.error('Failed to delete webhook:', e);
  }

  while (true) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
      const data: any = await res.json();

      if (data.ok && data.result && data.result.length > 0) {
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

// Only auto-start if not being imported as a module in a way that handles it differently
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME) {
  // This is a fallback but instrumentation.ts is preferred
   startBotPolling();
}
