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

    const WORKER_COLUMNS = 'id, ism, tel, mutax, foiz, status, role, "shareType", "parentId", created_at';
    let worker = null;

    if (workerPhone) {
        const cleanInputPhone = workerPhone.replace(/\D/g, '');
        const searchTarget = cleanInputPhone.slice(-9); // last 9 digits
        const { data: allWorkers } = await supabase.from('workers').select(WORKER_COLUMNS);
        worker = allWorkers?.find((w: any) => {
            if (!w.tel) return false;
            const dbNormalized = String(w.tel).replace(/\D/g, '');
            return dbNormalized.endsWith(searchTarget) || dbNormalized === cleanInputPhone;
        });
    }

    if (!worker && mechanicChatId) {
        const { data: workerByTg } = await supabase
            .from('workers')
            .select(WORKER_COLUMNS)
            .eq('telegram', mechanicChatId.toString())
            .maybeSingle();
        worker = workerByTg;
    }

    if (!worker) {
        console.warn(`Tizimda yo'q xodim urinishi: Phone=${workerPhone}, TgID=${mechanicChatId}`);
        return NextResponse.json({ 
            ok: false, 
            error: 'Siz tizimda xodim sifatida topilmadingiz. Iltimos, raqamingizni botda tasdiqlang yoki rahbaringizga murojaat qiling.' 
        }, { status: 403 });
    }

    const worker_id = worker.id;
    const workerName = worker.ism;

    const servicesTotal = services?.reduce((sum: number, s: any) => sum + Number(s.price), 0) || 0;
    const partsTotal = parts?.reduce((sum: number, p: any) => sum + (Number(p.price) * p.quantity), 0) || 0;
    
    // Convert Bot UI format to Dashboard format (nom, narx, qty)
    const orderServices = (services || []).map((s: any) => ({
      nom: s.name,
      narx: Number(s.price),
      workerId: worker.id,
      zarplata: Number(s.price) * (worker.foiz || 0) / 100
    }));

    // Saqlanmagan (isCustom) xizmatlarni bazaga qo'shish
    const customServices = (services || []).filter((s: any) => s.isCustom);
    if (customServices.length > 0) {
      for (const cs of customServices) {
        try {
          await supabase.from('services_list').insert({
            name: cs.name,
            price: Number(cs.price),
            brand: brand || 'UMUMIY',
            car_model: model || '',
            stavka: 0
          });
        } catch (err) {
          console.error("Custom xizmatni saqlashda xatolik:", err);
        }
      }
    }

    const orderParts = (parts || []).map((p: any) => ({
      nom: p.name,
      narx: Number(p.price),
      qty: Number(p.quantity || 1)
    }));

    const servicesStr = services?.map((s: any) => `${s.name} - ${s.price}`).join(', ') || 'Xizmatlar yo\'q';
    const partsStr = parts?.map((p: any) => `${p.name} (${p.quantity}x) - ${p.price}`).join(', ') || 'Zapchastlar yo\'q';

    const zarplataTotal = orderServices.reduce((sum: number, s: any) => sum + (s.zarplata || 0), 0);
    
    const now = new Date();
    const orderData = {
      ism: 'Kunlik Mijoz',
      tel: workerPhone || 'Bot Order',
      mashina: `${brand} ${model}`,
      raqam: plateNumber || '',
      km: probeg || '',
      muammo: `Xizmatlar: ${servicesStr}\nZapchastlar: ${partsStr}`,
      sana: now.toISOString().split('T')[0],
      created_at: now.toISOString(),
      holat: 'tulanmagan',
      services: orderServices,
      zaps: orderParts,
      srv: servicesTotal,
      zap: partsTotal,
      total: servicesTotal + partsTotal,
      final: servicesTotal + partsTotal,
      zarplata: zarplataTotal,
      pribil: (servicesTotal + partsTotal) - zarplataTotal,
      vin: '',
      yil: '',
      print_status: 'pending'
    };

    const { data: insertedData, error } = await supabase.from('orders').insert([orderData]).select();

    if (error) {
      console.error("Supabase Save Error:", error);
      return NextResponse.json({ ok: false, error: "Bazaga saqlashda xatolik: " + error.message }, { status: 500 });
    }

    if (!insertedData || insertedData.length === 0) {
      return NextResponse.json({ ok: false, error: "Ma'lumot saqlanmadi (no data returned)" }, { status: 500 });
    }

    // Formatted Receipt Message
    const sanasi = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
    const srvList = services?.length > 0 
      ? services.map((s: any, i: number) => `${i + 1}. ${s.name} - ${Number(s.price).toLocaleString()} UZS`).join('\n')
      : "Xizmat kiritilmagan";
      
    const zapList = parts?.length > 0 
      ? `\n⚙️ ZAPCHASTLAR:\n${parts.map((p: any, i: number) => `${i + 1}. ${p.name} (${p.quantity} dp) - ${(Number(p.price) * p.quantity).toLocaleString()} UZS`).join('\n')}\n🔹 Zapchastlar jami: ${partsTotal.toLocaleString()} UZS\n`
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
🔹 Xizmatlar jami: ${servicesTotal.toLocaleString()} UZS
${zapList}
---------------------------
💰 UMUMIY SUMMA: ${(servicesTotal + partsTotal).toLocaleString()} UZS

(Ushbu chek id: #${insertedData?.[0]?.id || 'yangi'})`;

    const adminMsg = baseReceipt;
    const mechanicMsg = baseReceipt + `\n\n(Ushbu chek 24 soatdan so'ng avtomatik tozalanadi)`;

    // Send to Admin
    if (adminId) {
      try { await bot.telegram.sendMessage(adminId, adminMsg); } 
      catch (e) { console.warn("Admin tg xabar ketmadi:", e); }
    }
    
    // Send to Mechanic and log for auto-deletion
    if (mechanicChatId && mechanicChatId.toString() !== adminId) {
      try { 
        const sentMsg = await bot.telegram.sendMessage(mechanicChatId, mechanicMsg); 
        
        // Log to DB for guaranteed 24h deletion
        const deleteAt = new Date();
        deleteAt.setHours(deleteAt.getHours() + 24);

        await supabase.from('bot_messages_to_delete').insert({
          chat_id: Number(mechanicChatId),
          message_id: sentMsg.message_id,
          delete_at: deleteAt.toISOString()
        });

      } catch (e) { console.warn("Mexanik tg xabar ketmadi:", e); }
    }

    return NextResponse.json({ ok: true, id: insertedData[0].id });
  } catch (err) {
    console.error('Submit API Error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
