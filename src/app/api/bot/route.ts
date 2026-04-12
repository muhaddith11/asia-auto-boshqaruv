import { NextRequest, NextResponse } from 'next/server';
import { Telegraf, session } from 'telegraf';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(token || '');

bot.use(session());

bot.start(async (ctx: any) => {
  await ctx.reply(`Salom! Asia Auto Service xodimlar botiga xush kelibsiz.`, {
    reply_markup: {
      keyboard: [[{ text: "📱 Ro'yxatdan o'tish (Tel raqamni yuborish)", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

bot.on('contact', async (ctx: any) => {
  const phone = ctx.message.contact.phone_number.replace('+', '');
  
  const { data: worker, error } = await supabase
    .from('workers')
    .select('*')
    .or(`tel.eq.${phone},tel.eq.+${phone}`)
    .single();

  if (error || !worker) {
    return ctx.reply("Kechirasiz, sizning telefon raqamingiz xodimlar ro'yxatida topilmadi. Iltimos, rahbaringizga murojaat qiling.");
  }

  const webAppUrl = `https://asiaautoservice.com/bot-ui?phone=${phone}`;

  await ctx.reply(`Xush kelibsiz, ${worker.ism}! Pastdagi tugmani bosib yangi buyurtma kiritishingiz mumkin.`, {
    reply_markup: {
      inline_keyboard: [[{ 
        text: "🆕 Buyurtma To'ldirish", 
        web_app: { url: webAppUrl } 
      }]]
    }
  });
});

bot.hears("🆕 Yangi buyurtma", async (ctx: any) => {
  await ctx.reply("Buning uchun 'Buyurtma To'ldirish' tugmasidan foydalaning (Web shakli).");
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Do not await handleUpdate so we return 200 OK immediately.
    // This prevents Telegram throwing 'Connection timed out'.
    bot.handleUpdate(body).catch(err => console.error('Bot processing error:', err));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Bot Error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
