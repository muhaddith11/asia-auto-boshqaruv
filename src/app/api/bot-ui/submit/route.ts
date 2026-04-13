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

    if (!workerPhone) {
        return NextResponse.json({ ok: false, error: 'Telefon raqami yuborilmadi' }, { status: 400 });
    }

    // Normalize input phone: remove all non-digits
    const cleanInputPhone = workerPhone.replace(/\D/g, '');
    const searchTarget = cleanInputPhone.slice(-9); // last 9 digits

    // Fetch all workers and find match manually to handle formatting differences in DB
    const { data: allWorkers } = await supabase.from('workers').select('*');
    
    const worker = allWorkers?.find((w: any) => {
        if (!w.tel) return false;
        const dbNormalized = String(w.tel).replace(/\D/g, '');
        return dbNormalized.endsWith(searchTarget) || dbNormalized === cleanInputPhone;
    });

    if (!worker) {
        console.warn(`Tizimda yo'q xodim urinishi: ${workerPhone} (Clean: ${cleanInputPhone})`);
        return NextResponse.json({ 
            ok: false, 
            error: 'Siz tizimda ro\'yxatdan o\'tmagansiz. Iltimos, adminga murojaat qiling.' 
        }, { status: 403 });
    }

    worker_id = worker.id;
    workerName = worker.ism;

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
      services: services || [],
      zaps: parts || [],
      srv: totalSrv,
      zap: totalZap,
      total: totalSrv + totalZap,
      final: totalSrv + totalZap,
      zarplata: 0,
      pribil: 0
    };

    // Before inserting, double check to remove any JS-only camelCase props if needed.
    // The previous error was strictly about 'createdAt'
    const { data: insertedData, error } = await supabase.from('orders').insert([orderData]).select();

    if (error) {
      console.error("Supabase Save Error:", error);
      return NextResponse.json({ ok: false, error: JSON.stringify(error) }, { status: 500 });
    }

    // Formatted Receipt Message
    const sanasi = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
    const srvList = services?.length > 0 
      ? services.map((s: any, i: number) => `${i + 1}. ${s.name} - ${Number(s.price).toLocaleString()} UZS`).join('\n')
      : "Xizmat kiritilmagan";
      
    const zapList = parts?.length > 0 
      ? `\n⚙️ ZAPCHASTLAR:\n${parts.map((p: any, i: number) => `${i + 1}. ${p.name} (${p.quantity} dp) - ${(Number(p.price) * p.quantity).toLocaleString()} UZS`).join('\n')}\n🔹 Zapchastlar jami: ${totalZap.toLocaleString()} UZS\n`
      : "";

    const baseReceipt = `📣 YANGI CHEK (Nusxa)

🧾 ELEKTRON CHEK

👤 Usta: ${workerName}
📞 Tel: ${workerPhone || '-'}

🚗 Avto: ${brand} ${model}
🔢 Davlat raqami: ${plateNumber || '-'}
🛣 Probeg: ${probeg ? probeg + ' km' : '-'}
🕒 Sana: ${sanasi}

🛠 XIZMATLAR:
${srvList}
🔹 Xizmatlar jami: ${totalSrv.toLocaleString()} UZS
${zapList}
---------------------------
💰 UMUMIY SUMMA: ${(totalSrv + totalZap).toLocaleString()} UZS

(Ushbu chek id: #${insertedData?.[0]?.id || 'yangi'})`;

    const adminMsg = baseReceipt;
    const mechanicMsg = baseReceipt + `\n\n(Ushbu chek 24 soatdan so'ng avtomatik tozalanadi)`;

    // Send to Admin
    if (adminId) {
      try { await bot.telegram.sendMessage(adminId, adminMsg); } 
      catch (e) { console.warn("Admin tg xabar ketmadi:", e); }
    }
    
    // Send to Mechanic with auto-delete setTimeout
    if (mechanicChatId && mechanicChatId.toString() !== adminId) {
      try { 
        const sentMsg = await bot.telegram.sendMessage(mechanicChatId, mechanicMsg); 
        // 24 hours timer to delete the message for the mechanic
        setTimeout(async () => {
          try {
            await bot.telegram.deleteMessage(mechanicChatId, sentMsg.message_id);
          } catch (delErr) {
            console.warn("Mexanikdagi xabarni o'chirishda xatolik:", delErr);
          }
        }, 24 * 60 * 60 * 1000);

      } catch (e) { console.warn("Mexanik tg xabar ketmadi:", e); }
    }

    return NextResponse.json({ ok: true, id: insertedData[0].id });
  } catch (err) {
    console.error('Submit API Error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
