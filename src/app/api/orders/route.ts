import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { Telegraf } from 'telegraf';

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

export async function GET() {
  const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const mapped = (data ?? []).map(mapRowToApp);
  return NextResponse.json(mapped);
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
      'services', 'zaps', 'zarplata', 'pribil', 'print_status'
    ];
    
    const dbBody: any = {};
    whitelist.forEach(key => {
      if (dbBodyRaw[key] !== undefined) dbBody[key] = dbBodyRaw[key];
    });

    const { data, error } = await supabase.from('orders').insert([dbBody]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    const created = (data && data[0]) ?? null;

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
