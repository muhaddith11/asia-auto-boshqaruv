import { NextRequest, NextResponse, after } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { Telegraf } from 'telegraf';
import { identifyWorker } from '@/lib/botWorker';
import { cleanupExpiredMessagesThrottled } from '@/lib/messageCleanup';

export const dynamic = 'force-dynamic';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
const adminId = process.env.ADMIN_TELEGRAM_ID;

// Admin narxsiz xizmatlarga narx qo'yib chekni chiqaradi: buyurtma "tayyor" bo'ladi
// va print_status='pending' bilan printerga ketadi.
export async function POST(req: NextRequest) {
  try {
    const { orderId, prices, workerPhone, mechanicChatId } = (await req.json()) as {
      orderId: number;
      prices: { index: number; narx: number }[];
      workerPhone?: string;
      mechanicChatId?: string;
    };

    const admin = await identifyWorker(workerPhone, mechanicChatId);
    if (!admin || !admin.is_admin) {
      return NextResponse.json({ ok: false, error: 'Faqat admin narx qo\'ya oladi.' }, { status: 403 });
    }
    if (!orderId || !Array.isArray(prices)) {
      return NextResponse.json({ ok: false, error: "Ma'lumot to'liq emas." }, { status: 400 });
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, mashina, raqam, km, bosqich, status_log, services, zaps, qabul_xodim_id, qabul_xodim_nomi')
      .eq('id', orderId)
      .maybeSingle();
    if (!order) return NextResponse.json({ ok: false, error: 'Mashina topilmadi.' }, { status: 404 });
    if (order.bosqich !== 'narx_kutilmoqda') {
      return NextResponse.json({ ok: false, error: 'Bu buyurtma narx kutmayapti.' }, { status: 409 });
    }

    const services: any[] = Array.isArray(order.services) ? order.services.map((s: any) => ({ ...s })) : [];
    for (const p of prices) {
      const svc = services[p.index];
      const narx = Math.round(Number(p.narx) || 0);
      if (svc && svc.narxsiz && narx > 0) {
        svc.narx = narx;
        delete svc.narxsiz;
      }
    }
    if (services.some((s) => s.narxsiz)) {
      return NextResponse.json({ ok: false, error: 'Barcha xizmatlarga narx kiriting.' }, { status: 400 });
    }

    // Xizmat ishchisining foizi — ish haqi qayta hisoblanadi (submit bilan bir xil formula).
    const { data: owner } = order.qabul_xodim_id
      ? await supabase.from('workers').select('foiz, ism, tel, telegram, is_boss').eq('id', order.qabul_xodim_id).maybeSingle()
      : { data: null };
    const foiz = Number(owner?.foiz) || 0;

    // Katalogga yangi (custom) xizmatlarni endi narx bilan yozamiz.
    const carFull = String(order.mashina || '').trim();
    for (const s of services) {
      s.zarplata = Math.round(Number(s.narx) * foiz / 100);
      if (s.isCustom && !s.id) {
        try {
          const brand = carFull.split(' ')[0] || 'UMUMIY';
          const model = carFull.slice(brand.length).trim();
          const { data: newS } = await supabase.from('services_list').insert({
            name: s.nom,
            price: Number(s.narx),
            brand: brand.toUpperCase(),
            car_model: model.toUpperCase(),
            stavka: 0,
          }).select('id').single();
          if (newS) s.id = newS.id;
        } catch (e) { console.error('Service insert error:', e); }
      }
    }

    const zaps: any[] = Array.isArray(order.zaps) ? order.zaps : [];
    const servicesTotal = services.reduce((sum, s) => sum + Number(s.narx || 0), 0);
    const zapTotal = zaps.reduce((sum, z) => sum + Number(z.narx ?? z.price ?? 0), 0);
    const zapCost = zaps.reduce((sum, z) => sum + Number(z.sebestoimost || 0), 0);
    const zarplata = services.reduce((sum, s) => sum + (s.zarplata || 0), 0);
    const total = servicesTotal + zapTotal;

    const nowIso = new Date().toISOString();
    const log = Array.isArray(order.status_log) ? order.status_log : [];
    log.push({ bosqich: 'tayyor', vaqt: nowIso, xodim_id: admin.id, izoh: 'Admin narx qo\'yib chek chiqardi' });

    const { error } = await supabase
      .from('orders')
      .update({
        services,
        srv: servicesTotal,
        zap: zapTotal,
        total,
        final: total,
        zarplata,
        pribil: total - zarplata - zapCost,
        holat: 'tulanmagan',
        bosqich: 'tayyor',
        tayyor_vaqti: nowIso,
        print_status: 'pending',
        status_log: log,
      })
      .eq('id', orderId);
    if (error) {
      console.error('price update error:', error);
      return NextResponse.json({ ok: false, error: 'Saqlashda xatolik: ' + error.message }, { status: 500 });
    }

    // Telegram cheki (submit bilan bir xil ko'rinish)
    const sanasi = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
    const srvList = services.map((s, i) => `${i + 1}. ${s.nom} - ${Number(s.narx).toLocaleString()} UZS`).join('\n') || 'Xizmat kiritilmagan';
    const zapList = zaps.length
      ? `\n⚙️ ZAPCHASTLAR:\n${zaps.map((z, i) => `${i + 1}. ${z.nom || z.name} (${Number(z.qty || 1)} dp) - ${Number(z.narx ?? z.price ?? 0).toLocaleString()} UZS`).join('\n')}\n🔹 Zapchastlar jami: ${zapTotal.toLocaleString()} UZS\n`
      : '';
    const receipt = `📣 YANGI CHEK (Nusxa)

🧾 ELEKTRON CHEK

👤 Usta: ${owner?.ism || order.qabul_xodim_nomi || '-'}
📞 Tel: ${owner?.tel || '-'}

🚗 Avto: ${order.mashina}
🔢 Davlat raqami: ${order.raqam || '-'}
🛣 Probeg: ${order.km ? order.km + ' km' : '-'}
🕒 Sana: ${sanasi}

🛠 XIZMATLAR:
${srvList}
🔹 Xizmatlar jami: ${servicesTotal.toLocaleString()} UZS
${zapList}
---------------------------
💰 UMUMIY SUMMA: ${total.toLocaleString()} UZS

(Ushbu chek id: #${orderId})`;

    if (adminId) {
      try { await bot.telegram.sendMessage(adminId, receipt); } catch (e) { console.warn('Admin tg xabar ketmadi:', e); }
    }
    if (owner?.telegram && String(owner.telegram) !== String(adminId)) {
      try {
        const sent = await bot.telegram.sendMessage(owner.telegram, owner.is_boss ? receipt : receipt + `\n\n(Ushbu chek 24 soatdan so'ng avtomatik tozalanadi)`);
        if (!owner.is_boss) {
          const deleteAt = new Date();
          deleteAt.setHours(deleteAt.getHours() + 24);
          await supabase.from('bot_messages_to_delete').insert({
            chat_id: Number(owner.telegram),
            message_id: sent.message_id,
            delete_at: deleteAt.toISOString(),
          });
        }
      } catch (e) { console.warn('Usta tg xabar ketmadi:', e); }
    }
    after(() => cleanupExpiredMessagesThrottled());

    return NextResponse.json({ ok: true, id: orderId });
  } catch (err) {
    console.error('price API error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
