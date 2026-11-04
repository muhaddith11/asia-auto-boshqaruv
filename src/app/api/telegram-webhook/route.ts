import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { findWorkerByPhone } from '@/lib/botWorker';
import { safeEqual } from '@/lib/session';
import { telegramWebhookSecret } from '@/lib/telegramAuth';

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
  // Telegram har so'rovda /api/bot/set-webhook bergan kalitni yuboradi; kalitsiz so'rov soxta.
  const secret = req.headers.get('x-telegram-bot-api-secret-token') || '';
  if (!token || !safeEqual(secret, telegramWebhookSecret(token))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.message) return NextResponse.json({ ok: true });

    const chatId = body.message.chat.id.toString();
    const text = body.message.text;

    // /id buyrug'i — joriy chat (guruh) ID sini qaytaradi (TELEGRAM_GROUP_ID uchun)
    if (text && /^\/(id|groupid|chatid)(@\w+)?$/.test(text.trim())) {
      const chatType = body.message.chat.type || 'private';
      const title = body.message.chat.title || '';
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: `🆔 Chat ID: ${chatId}\n📂 Turi: ${chatType}${title ? `\n📌 Nomi: ${title}` : ''}\n\nGuruh bo'lsa, shu ID ni TELEGRAM_GROUP_ID ga qo'ying.`,
      });
      return NextResponse.json({ ok: true });
    }

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
    const webAppUrl = `${baseUrl}/bot-ui`;

    // Telegram pastki klaviatura tugmasiga imzoli initData bermaydi (xodim tanilmaydi),
    // shu sabab faqat inline va Menu tugmalari ishlatiladi. Eski klaviatura shu yerda olinadi.
    const sendOrderButton = async (message: string) => {
      await sendTg('sendMessage', { chat_id: chatId, text: message, reply_markup: { remove_keyboard: true } });
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: "🆕 Buyurtma kiritish uchun tugmani bosing:",
        reply_markup: { inline_keyboard: [[{ text: "🆕 Buyurtma To'ldirish", web_app: { url: webAppUrl } }]] },
      });
    };

    const resetButtons = async () => {
      await sendTg('setChatMenuButton', {
        chat_id: chatId,
        menu_button: { type: 'default' }
      });
    };

    const enableButtons = async () => {
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
      await enableButtons();

      if (text === '/start') {
        await sendOrderButton(`Xush kelibsiz, ${workerById.ism}! Siz tizimda tanilgansiz.`);
      } else {
        await sendOrderButton("Qayta raqam kiritish shart emas.");
      }
      return NextResponse.json({ ok: true });
    }

    // --- CASE B: Registration flow (Contact shared) ---
    if (body.message.contact) {
      // Faqat o'z raqami: birovning kontaktini yuborib xodim bo'lib kirib bo'lmaydi.
      const contact = body.message.contact;
      const fromId = body.message.from?.id;
      if (!fromId || contact.user_id !== fromId || body.message.chat.id !== fromId) {
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: "Iltimos, pastdagi tugma orqali o'zingizning raqamingizni yuboring.",
        });
        return NextResponse.json({ ok: true });
      }

      const worker = await findWorkerByPhone(contact.phone_number);

      if (!worker) {
        // RAD ETISH (Begona)
        await resetButtons();
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: "Brat, uzr, sizi raqamingiz tizimda topilmadi. ❌\n\nIltimos, rahbaringizga ayting, sizni saytda 'Xodimlar' bo'limiga qo'shib qo'ysin. Shundan so'ng botni ishlatishingiz mumkin.",
          reply_markup: { remove_keyboard: true }
        });
      } else {
        // TANISH VA TASDIQLASH
        const { error: updateError } = await supabase
          .from('workers')
          .update({ telegram: chatId })
          .eq('id', worker.id);

        if (updateError) {
          console.error('Update worker telegram ID error:', updateError);
          // Agar baza yangilanmagan bo'lsa, xodimga tushunarli xabar beramiz
          await sendTg('sendMessage', {
            chat_id: chatId,
            text: "Xatolik: Tizim sizni doimiy eslab qola olmayapti. ⚙️\nIltimos, rahbaringizga SQL buyrug'ini bajarishni ayting (telegram ustuni yo'q)."
          });
        } else {
          await enableButtons();
          await sendOrderButton(`Rahmat, ${worker.ism}! ✅ Endi sizni tanib oldim. Qayta raqam yozish shart emas.`);
        }
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

