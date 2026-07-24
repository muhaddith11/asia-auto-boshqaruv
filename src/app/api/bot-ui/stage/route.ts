import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { identifyWorker } from '@/lib/botWorker';

export const dynamic = 'force-dynamic';

type Action = 'zapchast_kerak' | 'zapchast_keldi' | 'tayyor';

// Mashina bosqichini o'zgartirish. Xizmat/narx kiritish TOPSHIRISH'da (submit) bo'ladi.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action, zapchastNomi, workerPhone, mechanicChatId } = body as {
      orderId: number;
      action: Action;
      zapchastNomi?: string;
      workerPhone?: string;
      mechanicChatId?: string;
    };

    const worker = await identifyWorker(workerPhone, mechanicChatId);
    if (!worker) {
      return NextResponse.json({ ok: false, error: 'Xodim topilmadi.' }, { status: 403 });
    }
    if (!orderId || !action) {
      return NextResponse.json({ ok: false, error: "Ma'lumot to'liq emas." }, { status: 400 });
    }

    // Buyurtmani olib, egaligini tekshiramiz (o'zi qabul qilgan yoki boshliq)
    const { data: order, error: getErr } = await supabase
      .from('orders')
      .select('id, qabul_xodim_id, bosqich, status_log')
      .eq('id', orderId)
      .maybeSingle();

    if (getErr || !order) {
      return NextResponse.json({ ok: false, error: 'Mashina topilmadi.' }, { status: 404 });
    }
    if (order.qabul_xodim_id !== worker.id && !worker.is_boss) {
      return NextResponse.json({ ok: false, error: 'Bu mashina sizniki emas.' }, { status: 403 });
    }

    const nowIso = new Date().toISOString();
    const log = Array.isArray(order.status_log) ? order.status_log : [];
    const update: Record<string, unknown> = {};

    if (action === 'zapchast_kerak') {
      if (!zapchastNomi || !zapchastNomi.trim()) {
        return NextResponse.json({ ok: false, error: 'Zapchast nomini yozing.' }, { status: 400 });
      }
      update.bosqich = 'zapchast_kutilmoqda';
      update.zapchast_nomi = zapchastNomi.trim();
      update.zapchast_vaqti = nowIso;
      log.push({ bosqich: 'zapchast_kutilmoqda', vaqt: nowIso, xodim_id: worker.id, izoh: zapchastNomi.trim() });
    } else if (action === 'zapchast_keldi') {
      update.bosqich = 'tamirlanmoqda';
      log.push({ bosqich: 'tamirlanmoqda', vaqt: nowIso, xodim_id: worker.id, izoh: 'Zapchast keldi' });
    } else if (action === 'tayyor') {
      update.bosqich = 'tayyor';
      update.tayyor_vaqti = nowIso;
      log.push({ bosqich: 'tayyor', vaqt: nowIso, xodim_id: worker.id });
    } else {
      return NextResponse.json({ ok: false, error: "Noma'lum amal." }, { status: 400 });
    }

    update.status_log = log;

    const { error: updErr } = await supabase.from('orders').update(update).eq('id', orderId);
    if (updErr) {
      console.error('stage update error:', updErr);
      return NextResponse.json({ ok: false, error: 'Yangilashda xatolik.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, bosqich: update.bosqich });
  } catch (err) {
    console.error('stage API error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
