import { Telegraf } from 'telegraf';

const tgToken = process.env.TELEGRAM_BOT_TOKEN;
// Guruh va mavzu ID lari (maxfiy emas) — default qiymat sifatida yozildi.
// Kerak bo'lsa env orqali bekor qilish mumkin (env ustun turadi).
const tgGroupId = process.env.TELEGRAM_GROUP_ID || '-1002849413077';
const tgThreadId = process.env.TELEGRAM_GROUP_THREAD_ID || '1737';
const tgBot = tgToken ? new Telegraf(tgToken) : null;

const fmtSum = (n: any) => Number(n || 0).toLocaleString('ru-RU');

// jsonb ustun massiv yoki string ko'rinishda kelishi mumkin — har ikkisini qo'llab-quvvatlaymiz
function asArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

// Buyurtma tayyor bo'lganda guruhga chiroyli, mijozga atalgan xabar
export async function notifyOrderReady(order: any) {
  if (!tgBot || !tgGroupId || !order) return;
  try {
    const mashina = order.mashina || 'Avtomobil';
    const raqam = order.raqam ? String(order.raqam).toUpperCase() : '—';

    const services = asArray(order.services);
    const parts = asArray(order.zaps);

    const lines: string[] = [
      `🔔 Hurmatli mijoz!`,
      `🚗 Sizning «${mashina}» mashinangiz tayyor ✅`,
      `🔢 Davlat raqami: ${raqam}`,
    ];

    if (services.length) {
      lines.push('', '🛠 Xizmatlar:');
      services.forEach((s: any) => {
        const nom = s.nom || s.name || 'Xizmat';
        const narx = s.narx ?? s.price ?? 0;
        lines.push(`   • ${nom} — ${fmtSum(narx)} so'm`);
      });
    }

    if (parts.length) {
      lines.push('', '🔧 Ehtiyot qismlar:');
      parts.forEach((p: any) => {
        const nom = p.nom || p.name || 'Ehtiyot qism';
        const qty = Number(p.qty ?? p.quantity ?? 1);
        const narx = Number(p.narx ?? p.price ?? 0);
        lines.push(`   • ${nom} ×${qty} — ${fmtSum(narx * qty)} so'm`);
      });
    }

    const jami = order.final ?? order.total ?? 0;
    lines.push('', `💰 Jami: ${fmtSum(jami)} so'm`, '', `🙏 Tashrifingiz uchun rahmat! — AsiaAutoService`);

    // Mavzu (topic) ID berilgan bo'lsa — shu mavzuga yuboramiz
    const extra = tgThreadId ? { message_thread_id: Number(tgThreadId) } : undefined;
    await tgBot.telegram.sendMessage(tgGroupId, lines.join('\n'), extra);
  } catch (err) {
    console.error('Telegram guruhga xabar yuborishda xatolik:', err);
    throw err;
  }
}
