import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { logAudit } from '@/lib/audit';
import { Telegraf } from 'telegraf';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const tgToken = process.env.TELEGRAM_BOT_TOKEN;
const tgGroupId = process.env.TELEGRAM_GROUP_ID; // guruh chat ID (-100...) yoki @username
const tgThreadId = process.env.TELEGRAM_GROUP_THREAD_ID; // ixtiyoriy: guruh ichidagi mavzu (topic) ID
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
async function notifyOrderReady(order: any) {
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
  }
}

function mapRowToApp(row: any) {
  if (!row) return row;
  const r = { ...row } as any;
  const date = r.created_at || r.createdat;
  if (date !== undefined) {
    r.createdAt = date;
  }
  // Calculate chegirma from total and final
  r.chegirma = (r.total || 0) - (r.final || 0);
  return r;
}

function mapAppToDB(body: any) {
  const b = { ...body } as any;

  // Safe mapping for status/holat
  if (b.holat !== undefined) {
    b.status = b.holat;
  }

  // These fields are only for frontend calculation/display or handled by DB defaults.
  const fieldsToRemove = [
    'createdAt', 'created_at', 'createdat',
    'chegirmaFoiz', 'subTotal', 'finalTotal'
  ];

  fieldsToRemove.forEach(f => {
    if (f in b) delete b[f];
  });

  return b;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleUpdate(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return handleUpdate(request, context);
}

async function handleUpdate(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const body = await request.json();

    // Map application fields to database schema
    const dbBody: any = {};

    // Whitelist: Faqat bazada borligi aniq bo'lgan ustunlar
    const whitelist = [
      'ism', 'tel', 'mashina', 'raqam', 'vin', 'yil', 'km', 'muammo',
      'srv', 'zap', 'total', 'final', 'holat', 'sana',
      'services', 'zaps', 'zarplata', 'pribil', 'print_status', 'paid'
    ];

    whitelist.forEach(key => {
      if (body[key] !== undefined) {
        dbBody[key] = body[key];
      }
    });



    if (Object.keys(dbBody).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    // "Tayyor" xabarini faqat birinchi marta 'tulanmagan' ga o'tganda yuborish uchun
    // avvalgi holatni bilib olamiz (takror xabar oldini olish).
    let prevHolat: string | undefined;
    if (dbBody.holat === 'tulanmagan') {
      const { data: cur } = await supabase.from('orders').select('holat').eq('id', id).single();
      prevHolat = cur?.holat;
    }

    const { data, error, status: sbStatus } = await supabase.from('orders').update(dbBody).eq('id', id).select();
    
    if (error) {
      console.error("❌ Supabase Update Error:", error);
      return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
    }
    

    if (!data || data.length === 0) {
      console.error("⚠️ No data returned from update. Possible RLS issue or wrong ID:", id);
      return NextResponse.json({ error: "No data returned from update" }, { status: 404 });
    }

    // To'lov holatiga o'tgan bo'lsa alohida belgilaymiz
    const isPayment = dbBody.holat === 'tulangan' || dbBody.paid !== undefined;
    await logAudit({
      req: request,
      action: isPayment ? 'payment' : 'update',
      entity: 'order',
      entityId: id,
      details: { changes: dbBody },
    });

    // Buyurtma yangi 'tulanmagan' (tayyor) holatiga o'tdi → guruhga xabar
    if (dbBody.holat === 'tulanmagan' && prevHolat !== 'tulanmagan') {
      await notifyOrderReady(data[0]);
    }

    return NextResponse.json(mapRowToApp(data[0]));

  } catch (err: any) {
    console.error("Update Handler Error:", err);
    return NextResponse.json({ error: 'Invalid request: ' + err.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const { data, error } = await supabase.from('orders').delete().eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const deleted = (data && data[0]) ?? null;
    await logAudit({
      req: request,
      action: 'delete',
      entity: 'order',
      entityId: id,
      details: deleted ? { ism: deleted.ism, mashina: deleted.mashina, final: deleted.final } : undefined,
    });
    return NextResponse.json({ success: true, deleted: mapRowToApp(deleted) });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
