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

async function setChatMenuButton(chatId: string, url: string) {
  await sendTg('setChatMenuButton', {
    chat_id: chatId,
    menu_button: {
      type: 'web_app',
      text: '🆕 Buyurtma',
      web_app: { url }
    }
  });
}

async function resetMenuButton(chatId: string) {
  await sendTg('setChatMenuButton', {
    chat_id: chatId,
    menu_button: { type: 'default' }
  });
}

async function handleUpdate(update: any) {
  try {
    if (!update.message) return;
    const { chat, text, contact } = update.message;
    const chatId = chat.id.toString();

    // 1. Check if the worker is ALREADY recognized by Telegram ID
    const { data: workerById, error: idError } = await supabase
      .from('workers')
      .select('*')
      .eq('telegram', chatId)
      .maybeSingle();

    if (idError) console.error('Supabase ID Search Error:', idError);

    // Helper: Build persistent keyboard
    const getPersistentKeyboard = (worker: any) => {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://187.124.128.65:3000';
      const webAppUrl = `${baseUrl}/bot-ui?phone=${worker.tel?.replace(/\D/g, '')}`;
      return {
        keyboard: [[{ text: "🆕 Buyurtma To'ldirish", web_app: { url: webAppUrl } }]],
        resize_keyboard: true,
        persistent: true
      };
    };

    const enableButtons = async (worker: any) => {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://187.124.128.65:3000';
      const webAppUrl = `${baseUrl}/bot-ui?phone=${worker.tel?.replace(/\D/g, '')}`;
      await setChatMenuButton(chatId, webAppUrl);
    };

    // --- CASE A: Already recognized worker ---
    if (workerById) {
      await enableButtons(workerById);
      
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://187.124.128.65:3000';
    const webAppUrl = `${baseUrl}/bot-ui?phone=${workerById.tel?.replace(/\D/g, '')}`;

    if (text === '/start') {
        const messageText = `✅ Xush kelibsiz, ${workerById.ism}!\nSiz tizimda tanilgansiz.`;
        
        // If HTTPS, use button, otherwise send link
        if (webAppUrl.startsWith('https')) {
          await sendTg('sendMessage', {
            chat_id: chatId,
            text: `${messageText}\nPastdagi ko'k 'Menu' tugmasidan foydalanishingiz mumkin.`,
            reply_markup: getPersistentKeyboard(workerById)
          });
        } else {
          await sendTg('sendMessage', {
            chat_id: chatId,
            text: `${messageText}\n\n⚠️ Sizda hozircha HTTP (IP) ishlatilmoqda. Buyurtma berish uchun quyidagi havolani bosing:\n${webAppUrl}`
          });
        }
      } else {
        if (webAppUrl.startsWith('https')) {
          await sendTg('sendMessage', {
            chat_id: chatId,
            text: "🆕 Yangi buyurtma kiritish uchun pastdagi tugmani bosing.",
            reply_markup: getPersistentKeyboard(workerById)
          });
        } else {
          await sendTg('sendMessage', {
            chat_id: chatId,
            text: `🆕 Yangi buyurtma kiritish uchun havolani bosing:\n${webAppUrl}`
          });
        }
      }
      return;
    }

    // --- CASE B: Registration flow (Contact shared) ---
    if (contact) {
      const rawPhone = contact.phone_number;
      const normalizedPhone = rawPhone.replace(/\D/g, '');
      
      const { data: allWorkers, error: dbError } = await supabase
        .from('workers')
        .select('*');

      if (dbError) {
        console.error('Database query error:', dbError);
        return;
      }

      const searchTarget = normalizedPhone.slice(-9);
      const worker = allWorkers?.find((w: any) => {
        if (!w.tel) return false;
        const dbNormalized = String(w.tel).replace(/\D/g, '');
        return dbNormalized.endsWith(searchTarget) || dbNormalized === normalizedPhone;
      });

      if (!worker) {
        await resetMenuButton(chatId);
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: `Brat, uzr, sizi raqamingiz tizimda topilmadi. ❌\n\nIltimos, rahbaringizga ayting, sizni saytda 'Xodimlar' bo'limiga qo'shib qo'ysin. Shundan so'ng botni ishlatishingiz mumkin.`,
          reply_markup: { remove_keyboard: true }
        });
      } else {
        // SAVE Telegram ID
        await supabase
          .from('workers')
          .update({ telegram: chatId })
          .eq('id', worker.id);

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://187.124.128.65:3000';
        const webAppUrl = `${baseUrl}/bot-ui?phone=${worker.tel?.replace(/\D/g, '')}`;

        if (webAppUrl.startsWith('https')) {
          await enableButtons(worker);
          await sendTg('sendMessage', {
            chat_id: chatId,
            text: `✅ Rahmat, ${worker.ism}!\nEndi sizni tanib oldim. Qayta raqam yozish shart emas. Pastdagi tugmalar orqali ishni boshlashingiz mumkin.`,
            reply_markup: getPersistentKeyboard(worker)
          });
        } else {
           await sendTg('sendMessage', {
            chat_id: chatId,
            text: `✅ Rahmat, ${worker.ism}!\n\nBuyurtma berish uchun quyidagi havolani bosing:\n${webAppUrl}`
          });
        }
      }
      return;
    }

    // --- CASE C: Stranger or /start ---
    if (text === '/start') {
      await resetMenuButton(chatId);
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: "Salom! Asia Auto Service xodimlar botiga (Polling Mode) xush kelibsiz. ✨\n\nIltimos, ishni boshlash uchun raqamingizni tasdiqlang:",
        reply_markup: {
          keyboard: [[{ text: "📱 Raqamni tasdiqlash", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }

  } catch (err) {
    console.error('Error handling update:', err);
  }
}

let lastUpdateId = 0;

let isPollingStarted = false;

export function getPollingStatus() {
  return {
    isStarted: isPollingStarted,
    lastUpdateId
  };
}

export async function startBotPolling() {
  if (isPollingStarted) return;
  
  if (!token) {
    console.error('❌ BOT_ERROR: TELEGRAM_BOT_TOKEN topilmadi! .env.local yoki Dokploy sozlamalarini tekshiring.');
    return;
  }

  isPollingStarted = true;
  console.log('🤖 Bot Poller ishga tushmoqda (Polling Mode)...');
  
  if (!supabase) {
    console.warn('⚠️ BOT_WARNING: Supabase bog\'lanishi yo\'q. Bot xodimlarni taniy olmaydi.');
  }

  try {
    // Delete webhook first to enable polling
    const delRes = await sendTg('deleteWebhook', { drop_pending_updates: true });
    if (delRes.ok) {
      console.log('✅ Webhook o\'chirildi, Polling rejimiga o\'childi.');
    }
  } catch (e) {
    console.error('❌ Failed to delete webhook:', e);
  }

  while (true) {
    try {
      if (lastUpdateId === 0) console.log('🔍 Checking for initial updates...');
      
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
      
      if (!res.ok) {
        console.error('❌ Telegram fetch failed:', res.status, res.statusText);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      const data: any = await res.json();

      if (data.ok && data.result && data.result.length > 0) {
        console.log(`📥 Received ${data.result.length} updates`);
        for (const update of data.result) {
          await handleUpdate(update);
          lastUpdateId = update.update_id;
        }
      } else if (!data.ok) {
        console.error('❌ Telegram API error in loop:', data);
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (err) {
      console.error('❌ Polling loop error:', err);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// Only auto-start if not being imported as a module in a way that handles it differently
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME) {
  // This is a fallback but instrumentation.ts is preferred
   startBotPolling();
}
