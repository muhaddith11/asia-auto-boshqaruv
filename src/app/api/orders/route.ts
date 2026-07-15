import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { Telegraf } from 'telegraf';
import { logAudit } from '@/lib/audit';

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.ADMIN_TELEGRAM_ID;
const bot = token ? new Telegraf(token) : null;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mapRowToApp(row: any) {
  if (!row) return row;
  const r = { ...row } as any;
  const date = r.created_at || r.createdat;
  if (date !== undefined) {
    r.createdAt = date;
  }
  // Calculate chegirma from total and final since the DB column is missing
  r.chegirma = (r.total || 0) - (r.final || 0);
  return r;
}

function mapAppToDB(body: any) {
  const b = { ...body } as any;

  // Safe mapping for status/holat
  if (b.holat !== undefined) {
    b.status = b.holat;
  }

  const fieldsToRemove = [
    'createdAt', 'created_at', 'createdat',
    'chegirmaFoiz', 'subTotal', 'finalTotal'
  ];

  fieldsToRemove.forEach(f => {
    if (f in b) delete b[f];
  });

  return b;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const from = sp.get('from');
  const to = sp.get('to');
  const pageParam = sp.get('page');
  const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '50', 10)));

  let query = supabase.from('orders').select('*', { count: 'exact' }).order('id', { ascending: false });
  if (from) query = query.gte('sana', from);
  if (to) query = query.lte('sana', to);

  // page berilsa — serverside pagination (yangi rejim, { data, total, ... })
  if (pageParam) {
    const page = Math.max(1, parseInt(pageParam, 10));
    const fromIdx = (page - 1) * limit;
    const { data, error, count } = await query.range(fromIdx, fromIdx + limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      data: (data ?? []).map(mapRowToApp),
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    });
  }

  // page berilmasa — eski xulq: massiv qaytaramiz (store bilan mos)
  //
  // ⚠️ MUHIM: Supabase bitta so'rovda ko'pi bilan 1000 qator qaytaradi.
  // Ilgari bu yerda .range() yo'q edi va buyurtmalar id DESC bo'yicha
  // saralangani uchun faqat eng yangi 1000 tasi kelardi — eski buyurtmalar
  // tushib qolib, xodimlarning "ishlab topgan" puli va mijoz/moliya
  // hisobotlari xato hisoblanardi (har yangi buyurtmada eskisi oynadan
  // chiqib, qoldiq kamayib borardi).
  // Shuning uchun barcha qatorlarni 1000 talik bo'laklarda yuklaymiz.
  const PAGE_SIZE = 1000;
  const all: any[] = [];
  for (let page = 0; page < 100; page++) {
    let chunkQuery = supabase.from('orders').select('*').order('id', { ascending: false });
    if (from) chunkQuery = chunkQuery.gte('sana', from);
    if (to) chunkQuery = chunkQuery.lte('sana', to);

    const { data, error } = await chunkQuery.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return NextResponse.json(all.map(mapRowToApp));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Map application fields to database schema
    const dbBodyRaw = mapAppToDB(body);

    // Whitelist
    const whitelist = [
      'ism', 'tel', 'mashina', 'raqam', 'vin', 'yil', 'km', 'muammo',
      'srv', 'zap', 'total', 'final', 'holat', 'sana',
      'services', 'zaps', 'zarplata', 'pribil', 'print_status', 'paid'
    ];

    const dbBody: any = {};
    whitelist.forEach(key => {
      if (dbBodyRaw[key] !== undefined) {
        dbBody[key] = dbBodyRaw[key];
      }
    });

    const { data, error } = await supabase.from('orders').insert([dbBody]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const created = (data && data[0]) ?? null;

    // Audit log
    if (created) {
      await logAudit({
        req: request,
        action: 'create',
        entity: 'order',
        entityId: created.id,
        details: { ism: created.ism, mashina: created.mashina, total: created.total, final: created.final },
      });
    }

    // Send Telegram Notification to Admin
    if (created && bot && adminId) {
      try {
        const sanasi = new Date(created.created_at || created.sana).toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
        const message = `🔔 YANGI BUYURTMA (Dashboard)
        
👤 Mijoz: ${created.ism || '-'}
📞 Tel: ${created.tel || '-'}
🚗 Avto: ${created.mashina || '-'}
🔢 Raqam: ${created.raqam || '-'}
🛠 Xizmatlar: ${created.srv?.toLocaleString() || 0} UZS
⚙️ Zapchastlar: ${created.zap?.toLocaleString() || 0} UZS
---------------------------
💰 JAMI: ${created.total?.toLocaleString() || 0} UZS
🕒 Sana: ${sanasi}

(ID: #${created.id})`;

        await bot.telegram.sendMessage(adminId, message);
      } catch (tgErr) {
        console.error('Telegram notification failed:', tgErr);
      }
    }

    return NextResponse.json(mapRowToApp(created), { status: 201 });
  } catch (err) {
    console.error('Order POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
