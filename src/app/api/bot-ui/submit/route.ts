import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { Telegraf } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.ADMIN_TELEGRAM_ID;
const bot = new Telegraf(token || '');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brand, model, probeg, plateNumber, services, parts, mechanicChatId, workerPhone } = body;

    // Optional: look up worker from phone or chatId
    // Defaulting to "Bot Orqali" if worker cannot be determined precisely
    let worker_id = null;
    let workerName = "Noma'lum Usta";

    if (workerPhone) {
        const { data: worker } = await supabase
            .from('workers')
            .select('*')
            .or(`tel.eq.${workerPhone},tel.eq.+${workerPhone}`)
            .single();
        if (worker) {
            worker_id = worker.id;
            workerName = worker.ism;
        }
    }

    const servicesStr = services?.map((s: any) => `${s.name} - ${s.price}`).join(', ') || 'Xizmatlar yo\'q';
    const partsStr = parts?.map((p: any) => `${p.name} (${p.quantity}x) - ${p.price}`).join(', ') || 'Zapchastlar yo\'q';
    const totalSrv = services?.reduce((sum: number, s: any) => sum + Number(s.price), 0) || 0;
    const totalZap = parts?.reduce((sum: number, p: any) => sum + (Number(p.price) * p.quantity), 0) || 0;
    
    const now = new Date();
    const orderData = {
      ism: 'Web App Mijoz',
      mashina: `${brand} ${model}`,
      raqam: plateNumber || '',
      km: probeg || '',
      muammo: `Xizmatlar: ${servicesStr}\nZapchastlar: ${partsStr}`,
      sana: now.toISOString().split('T')[0],
      holat: 'tulanmagan',
      createdAt: now.toISOString(),
      services: services || [],
      zaps: parts || [],
      srv: totalSrv,
      zap: totalZap,
      total: totalSrv + totalZap,
      final: totalSrv + totalZap,
      zarplata: 0,
      pribil: 0,
      worker_id: worker_id
    };

    const { data: insertedData, error } = await supabase.from('orders').insert([orderData]).select();

    if (error) {
      console.error("Supabase Save Error:", error);
      return NextResponse.json({ ok: false, error: 'Database xatosi' }, { status: 500 });
    }

    // Notify Admin via Telegram
    if (adminId && insertedData) {
      const adminMsg = `
🔔 **YANGI BUYURTMA (WEB APP)**

📍 **ID:** #${insertedData[0].id}
👤 **Usta:** ${workerName}
🚗 **Mashina:** ${brand} ${model}
🔢 **Raqam:** ${plateNumber}
📏 **Probeg:** ${probeg}
💸 **Umumiy Summa:** ${totalSrv + totalZap} so'm
🛠 **Xizmatlar:** ${servicesStr}
⚙️ **Zapchastlar:** ${partsStr}

Saytdagi panelda tekshiring!`;
      try {
        await bot.telegram.sendMessage(adminId, adminMsg, { parse_mode: 'Markdown' });
      } catch (tgError) {
         console.warn("Telegram ga xabar ketmadi:", tgError);
      }
    }

    return NextResponse.json({ ok: true, id: insertedData[0].id });
  } catch (err) {
    console.error('Submit API Error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
