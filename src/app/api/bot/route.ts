import { NextRequest, NextResponse } from 'next/server';
import { Telegraf, Scenes, session } from 'telegraf';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// Initialize Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.ADMIN_TELEGRAM_ID;
const bot = new Telegraf(token || '');

// Define the Wizard Scene
const orderWizard = new Scenes.WizardScene(
  'ORDER_WIZARD',
  // Step 1: Start
  async (ctx: any) => {
    await ctx.reply("Yangi buyurtma yaratishni boshlaymiz. Mijozning mashina modeli qanday?");
    return ctx.wizard.next();
  },
  // Step 2: Mashina
  async (ctx: any) => {
    ctx.wizard.state.mashina = ctx.message.text;
    await ctx.reply("Mashinaning davlat raqami (masalan: 01A777AA):");
    return ctx.wizard.next();
  },
  // Step 3: Raqam
  async (ctx: any) => {
    ctx.wizard.state.raqam = ctx.message.text.toUpperCase();
    await ctx.reply("Mashina probegi (KM):");
    return ctx.wizard.next();
  },
  // Step 4: Probeg
  async (ctx: any) => {
    ctx.wizard.state.km = ctx.message.text;
    await ctx.reply("Qilingan xizmatlarni va ularning narxini yozing:\n(Namuna: 'Moy almashtirish - 200000')");
    return ctx.wizard.next();
  },
  // Step 5: Xizmatlar
  async (ctx: any) => {
    ctx.wizard.state.muammo = ctx.message.text;
    await ctx.reply("Ishlatilgan zapchastlarni va narxini yozing:\n(Bo'lmasa 'Yo'q' deb yozing)");
    return ctx.wizard.next();
  },
  // Step 6: Zapchastlar
  async (ctx: any) => {
    ctx.wizard.state.zapchastlar = ctx.message.text;
    await ctx.reply("Mijozning ismi (Bo'sh qoldirish uchun xohlagan harf bosing yoki ismini yozing):");
    return ctx.wizard.next();
  },
  // Step 7: Final Summary
  async (ctx: any) => {
    ctx.wizard.state.ism = ctx.message.text;
    const { mashina, raqam, km, muammo, zapchastlar, ism, workerId, workerName } = ctx.wizard.state;

    const summary = `
📦 **BUYURTMA TAYYOR**

👤 **Usta:** ${workerName}
🚗 **Mashina:** ${mashina}
🔢 **Raqam:** ${raqam}
📏 **Probeg:** ${km} km
👤 **Mijoz:** ${ism}

🛠 **Xizmatlar:**
${muammo}

⚙️ **Zapchastlar:**
${zapchastlar}

Ushbu ma'lumotlarni bazaga saqlaymizmi?
    `;

    await ctx.replyWithMarkdown(summary, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Saqlash va Adminga yuborish", callback_data: "save_order" }],
          [{ text: "❌ Bekor qilish", callback_data: "cancel_order" }]
        ]
      }
    });
    return ctx.wizard.next();
  }
);

const stage = new Scenes.Stage([orderWizard] as any);
bot.use(session());
bot.use(stage.middleware() as any);

// --- Handlers ---

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
  
  // Verify worker in DB
  const { data: worker, error } = await supabase
    .from('workers')
    .select('*')
    .or(`tel.eq.${phone},tel.eq.+${phone}`)
    .single();

  if (error || !worker) {
    return ctx.reply("Kechirasiz, sizning telefon raqamingiz xodimlar ro'yxatida topilmadi. Iltimos, rahbaringizga murojaat qiling.");
  }

  // Create or retrieve session (Simplified)
  ctx.session.workerId = worker.id;
  ctx.session.workerName = worker.ism;

  await ctx.reply(`Xush kelibsiz, ${worker.ism}!`, {
    reply_markup: {
      keyboard: [[{ text: "🆕 Yangi buyurtma" }]],
      resize_keyboard: true
    }
  });
});

bot.hears("🆕 Yangi buyurtma", async (ctx: any) => {
  if (!ctx.session.workerId) return ctx.reply("Iltimos, avval ro'yxatdan o'ting.");
  return ctx.scene.enter('ORDER_WIZARD', { workerId: ctx.session.workerId, workerName: ctx.session.workerName });
});

bot.action('save_order', async (ctx: any) => {
  const state = ctx.scene.session.state;
  if (!state.workerId) return ctx.answerCbQuery("Xatolik: Sessiya muddati tugagan.");

  const now = new Date();
  const orderData = {
    ism: state.ism || 'Kunlik Mijoz',
    mashina: state.mashina,
    raqam: state.raqam,
    km: state.km,
    muammo: `Xizmatlar: ${state.muammo}\nZapchastlar: ${state.zapchastlar}`,
    sana: now.toISOString().split('T')[0],
    holat: 'tulanmagan',
    createdAt: now.toISOString(),
    services: [], // Simplified for now since free text
    zaps: [],
    srv: 0,
    zap: 0,
    total: 0,
    final: 0,
    zarplata: 0,
    pribil: 0,
    worker_id: state.workerId // Track who created it
  };

  const { data, error } = await supabase.from('orders').insert([orderData]).select();

  if (error) {
    console.error("Bot Save Error:", error);
    return ctx.reply("Xatolik yuz berdi: Bazaga saqlab bo'lmadi.");
  }

  await ctx.answerCbQuery("Buyurtma saqlandi!");
  await ctx.editMessageText(`✅ **Buyurtma muvaffaqiyatli saqlandi!** Admin xabardor qilindi.`);

  // Notify Admin
  if (adminId) {
    const adminMsg = `
🔔 **YANGI BUYURTMA (BOTDAN)**

📍 **ID:** #${data[0].id}
👤 **Usta:** ${state.workerName}
🚗 **Mashina:** ${state.mashina}
🔢 **Raqam:** ${state.raqam}
📏 **Probeg:** ${state.km}
🛠 **Xizmatlar:** ${state.muammo}
⚙️ **Zapchastlar:** ${state.zapchastlar}

Ushbu buyurtma saytda 'To'lanmagan' holatida turibdi.
    `;
    await bot.telegram.sendMessage(adminId, adminMsg);
  }

  return ctx.scene.leave();
});

bot.action('cancel_order', async (ctx: any) => {
  await ctx.answerCbQuery("Bekor qilindi");
  await ctx.editMessageText("❌ Buyurtma bekor qilindi.");
  return ctx.scene.leave();
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Bot Error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
