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

    // 1. Try to find the worker by Telegram ID (chatId)
    const { data: workerById, error: idError } = await supabase
      .from('workers')
      .select('*')
      .eq('telegram', chatId)
      .maybeSingle();

    if (idError) console.error('Supabase ID Search Error:', idError);

    // Function to get the persistent keyboard
    const getPersistentKeyboard = (worker: any) => {
      const webAppUrl = `${baseUrl}/bot-ui?phone=${worker.tel?.replace('+', '')}`;
      return {
        keyboard: [[{ 
          text: "📋 Ma'lumot kiritish", 
          web_app: { url: webAppUrl } 
        }]],
        resize_keyboard: true,
        persistent: true
      };
    };

    // 2. Logic if the worker is ALREADY recognized
    if (workerById) {
      if (text === '/start') {
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: `Xush kelibsiz, ${workerById.ism}! Siz tizimda tanildingiz. Pastdagi tugma orqali ma'lumot kiritishingiz mumkin.`,
          reply_markup: getPersistentKeyboard(workerById)
        });
      } else {
        // Just remind them or keep the keyboard active
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: "Yangi buyurtma kiritish uchun pastdagi tugmani bosing.",
          reply_markup: getPersistentKeyboard(workerById)
        });
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Logic for UNKNOWN user
    if (text === '/start') {
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: "Salom! Asia Auto Service xodimlar botiga xush kelibsiz. Iltimos, boshlash uchun raqamingizni yuboring.",
        reply_markup: {
          keyboard: [[{ text: "📱 Ro'yxatdan o'tish (Tel raqamni yuborish)", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    } 
    else if (body.message.contact) {
      const phone = body.message.contact.phone_number.replace('+', '');
      // Find worker by phone
      const { data: worker, error: dbError } = await supabase
        .from('workers')
        .select('*')
        .or(`tel.eq.${phone},tel.eq.+${phone}`)
        .maybeSingle();

      if (dbError) console.error('DB Error:', dbError);

      if (!worker) {
        await sendTg('sendMessage', {
          chat_id: chatId,
          text: "Kechirasiz, sizning telefon raqamingiz xodimlar ro'yxatida topilmadi. Iltimos, rahbaringizga murojaat qiling."
        });
      } else {
        // SAVE the Telegram ID to this worker's profile
        const { error: updateError } = await supabase
          .from('workers')
          .update({ telegram: chatId })
          .eq('id', worker.id);

        if (updateError) console.error('Update worker telegram ID error:', updateError);

        await sendTg('sendMessage', {
          chat_id: chatId,
          text: `Rahmat, ${worker.ism}! Endi sizni tanib oldim. Pastdagi tugma doimiy turadi, uni bosib xohlagan paytingizda ma'lumot kiritishingiz mumkin.`,
          reply_markup: getPersistentKeyboard(worker)
        });
      }
    } 
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Bot POST Error:', err);
    return NextResponse.json({ ok: true });
  }
}

