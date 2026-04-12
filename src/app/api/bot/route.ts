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
    
    // Background execution to prevent Telegram timeout
    (async () => {
      try {
        if (body.message) {
          const chatId = body.message.chat.id;
          const text = body.message.text;
          
          // Detect host for dynamic URLs
          const host = req.headers.get('host') || 'asiaautoservice.com';
          const protocol = host.includes('localhost') ? 'http' : 'https';
          const baseUrl = `${protocol}://${host}`;

          if (text === '/start') {
            await sendTg('sendMessage', {
              chat_id: chatId,
              text: "Salom! Asia Auto Service xodimlar botiga xush kelibsiz.",
              reply_markup: {
                keyboard: [[{ text: "📱 Ro'yxatdan o'tish (Tel raqamni yuborish)", request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true
              }
            });
          } 
          else if (body.message.contact) {
            const phone = body.message.contact.phone_number.replace('+', '');
            const { data: worker, error: dbError } = await supabase
              .from('workers')
              .select('*')
              .or(`tel.eq.${phone},tel.eq.+${phone}`)
              .single();

            if (dbError) {
              console.error('Database error in bot:', dbError);
            }

            if (!worker) {
              await sendTg('sendMessage', {
                chat_id: chatId,
                text: "Kechirasiz, sizning telefon raqamingiz xodimlar ro'yxatida topilmadi. Iltimos, rahbaringizga murojaat qiling."
              });
            } else {
              const webAppUrl = `${baseUrl}/bot-ui?phone=${phone}`;
              await sendTg('sendMessage', {
                chat_id: chatId,
                text: `Xush kelibsiz, ${worker.ism}! Pastdagi tugmani bosib yangi buyurtma kiritishingiz mumkin.`,
                reply_markup: {
                  inline_keyboard: [[{ 
                    text: "🆕 Buyurtma To'ldirish", 
                    web_app: { url: webAppUrl } 
                  }]]
                }
              });
            }
          } 
          else if (text === '🆕 Yangi buyurtma') {
            await sendTg('sendMessage', {
              chat_id: chatId,
              text: "Buning uchun 'Buyurtma To'ldirish' (Web App) tugmasidan foydalaning."
            });
          }
        }
      } catch (innerError) {
        console.error('Processing error details:', innerError);
      }
    })();
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Bot Error:', err);
    return NextResponse.json({ ok: true }); // Still return 200 to Telegram to stop retries
  }
}

