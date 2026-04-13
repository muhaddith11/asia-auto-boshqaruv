import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const token = process.env.TELEGRAM_BOT_TOKEN;

async function sendTg(method: string, payload: any) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch(e) {
    console.error('Telegram API error:', e);
  }
}

async function setMenuButton(chatId: string, url: string) {
  await sendTg('setChatMenuButton', {
    chat_id: chatId,
    menu_button: {
      type: 'web_app',
      text: '🆕 Buyurtma',
      web_app: { url }
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.message) return NextResponse.json({ ok: true });

    const chatId = body.message.chat.id.toString();
    const text = body.message.text;
    
    // Detect host for dynamic URLs
    const host = req.headers.get('host') || 'asiaautoservice.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // 1. Check if the worker is ALREADY recognized
    const { data: workerById, error: idError } = await supabase
      .from('workers')
      .select('*')
      .eq('telegram', chatId)
      .maybeSingle();

    if (idError) console.error('Supabase ID Search Error:', idError);

    // Helper functions
    const getPersistentKeyboard = (worker: any) => {
      const webAppUrl = `${baseUrl}/bot-ui?phone=${worker.tel?.replace('+', '')}`;
      return {
        keyboard: [[{ 
          text: "🆕 Buyurtma To'ldirish", 
          web_app: { url: webAppUrl } 
        }]],
        resize_keyboard: true,
        persistent: true
      };
    };

    const resetButtons = async () => {
      await sendTg('setChatMenuButton', {
        chat_id: chatId,
        menu_button: { type: 'default' }
      });
    };

    const enableButtons = async (worker: any) => {
      const webAppUrl = `${baseUrl}/bot-ui?phone=${worker.tel?.replace('+', '')}`;
      await setChatMenuButton(chatId, webAppUrl);
    };

    async function setChatMenuButton(cid: string, url: string) {
      await sendTg('setChatMenuButton', {
        chat_id: cid,
        menu_button: {
          type: 'web_app',
          text: '🆕 Buyurtma',
          web_app: { url }
        }
      });
    }

    // --- CASE A: Already recognized worker ---
    if (workerById) {
      // NEVER ask for number, just show the goods
      await enableButtons(workerById);
      
      if (text === '/start') {
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: `Xush kelibsiz, ${workerById.ism}! Siz tizimda tanilgansiz. Pastdagi yoki Menyu tugmasini bosib ishni boshlashingiz mumkin.`,
          reply_markup: getPersistentKeyboard(workerById)
        });
      } else {
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: "Buyurtma kiritish uchun pastdagi tugmani bosing. Qayta raqam kiritish shart emas.",
          reply_markup: getPersistentKeyboard(workerById)
        });
      }
      return NextResponse.json({ ok: true });
    }

    // --- CASE B: Registration flow (Contact shared) ---
    if (body.message.contact) {
      const phone = body.message.contact.phone_number.replace('+', '');
      const { data: worker, error: dbError } = await supabase
        .from('workers')
        .select('*')
        .or(`tel.eq.${phone},tel.eq.+${phone}`)
        .maybeSingle();

      if (dbError) console.error('DB Error:', dbError);

      if (!worker) {
        // RAD ETISH (Begona)
        await resetButtons(); // Ensure no buttons for strangers
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: "Brat, uzr, sizi raqamingiz tizimda topilmadi. ❌\n\nIltimos, rahbaringizga ayting, sizni saytda 'Xodimlar' bo'limiga qo'shib qo'ysin. Shundan so'ng botni ishlatishingiz mumkin.",
          reply_markup: { remove_keyboard: true }
        });
      } else {
        // TIB VA TASDIQLASH (O'zimizniki)
        const { error: updateError } = await supabase
          .from('workers')
          .update({ telegram: chatId })
          .eq('id', worker.id);

        if (updateError) console.error('Update worker telegram ID error:', updateError);

        await enableButtons(worker);
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: `Rahmat, ${worker.ism}! ✅ Endi sizni tanib oldim. Qayta raqam yozish shart emas. Pastdagi tugmalar orqali ishni boshlashingiz mumkin.`,
          reply_markup: getPersistentKeyboard(worker)
        });
      }
      return NextResponse.json({ ok: true });
    }

    // --- CASE C: New user or /start ---
    if (text === '/start') {
      await resetButtons(); // Ensure fresh start
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: "Salom! Asia Auto Service xodimlar botiga xush kelibsiz. ✨\n\nIltimos, ishni boshlash uchun telefon raqamingizni yuboring:",
        reply_markup: {
          keyboard: [[{ text: "📱 Raqamni tasdiqlash", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } else {
      // Prompt unauthorized user to start
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: "Iltimos, avval raqamingizni yuboring yoki /start buyrug'ini bosing.",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Bot POST Error:', err);
    return NextResponse.json({ ok: true });
  }
}

