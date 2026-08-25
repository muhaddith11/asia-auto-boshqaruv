import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { identifyWorker } from '@/lib/botWorker';

export const dynamic = 'force-dynamic';

// Xodim ishni boshlaydi/tugatadi — tezlik bali aynan shu vaqtga qarab beriladi.
// Bitta buyurtmada bir necha sessiya bo'lishi mumkin (tushlik, zapchast, ertaga davom).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action, workerPhone, mechanicChatId } = body as {
      orderId?: number;
      action?: 'start' | 'stop';
      workerPhone?: string;
      mechanicChatId?: string;
    };

    const worker = await identifyWorker(workerPhone, mechanicChatId);
    if (!worker) {
      return NextResponse.json({ ok: false, error: 'Xodim topilmadi.' }, { status: 403 });
    }
    if (!orderId || (action !== 'start' && action !== 'stop')) {
      return NextResponse.json({ ok: false, error: "Ma'lumot to'liq emas." }, { status: 400 });
    }

    const { data: order, error: getErr } = await supabase
      .from('orders')
      .select('id, bosqich, qabul_xodim_id')
      .eq('id', orderId)
      .maybeSingle();
    if (getErr || !order) {
      return NextResponse.json({ ok: false, error: 'Mashina topilmadi.' }, { status: 404 });
    }
    if (order.bosqich === 'topshirildi' || order.bosqich === 'bekor_qilindi') {
      return NextResponse.json({ ok: false, error: 'Bu ish allaqachon yopilgan.' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();

    if (action === 'start') {
      // Ochiq sessiya bormi? (unique indeks ham himoyalaydi, lekin xatoni
      // xodimga tushunarli qilib qaytaramiz)
      const { data: open } = await supabase
        .from('work_sessions')
        .select('id')
        .eq('order_id', orderId)
        .eq('worker_id', worker.id)
        .is('ended_at', null)
        .maybeSingle();
      if (open) {
        return NextResponse.json({ ok: true, alreadyOpen: true, sessionId: open.id });
      }

      const { data: created, error: insErr } = await supabase
        .from('work_sessions')
        .insert([{ order_id: orderId, worker_id: worker.id, started_at: nowIso }])
        .select('id')
        .single();
      if (insErr) {
        console.error('work-session start error:', insErr);
        return NextResponse.json({ ok: false, error: 'Boshlashda xatolik.' }, { status: 500 });
      }

      // Ish boshlangani — mashina "ta'mirlanmoqda" bosqichiga o'tadi.
      if (order.bosqich === 'qabul_qilindi') {
        await supabase.from('orders').update({ bosqich: 'tamirlanmoqda' }).eq('id', orderId);
      }

      return NextResponse.json({ ok: true, sessionId: created?.id, startedAt: nowIso });
    }

    // stop
    const { data: open, error: findErr } = await supabase
      .from('work_sessions')
      .select('id, started_at')
      .eq('order_id', orderId)
      .eq('worker_id', worker.id)
      .is('ended_at', null)
      .maybeSingle();
    if (findErr) {
      console.error('work-session find error:', findErr);
      return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
    }
    if (!open) {
      return NextResponse.json({ ok: false, error: 'Ochiq ish sessiyasi yo\'q.' }, { status: 400 });
    }

    const { error: updErr } = await supabase
      .from('work_sessions')
      .update({ ended_at: nowIso })
      .eq('id', open.id);
    if (updErr) {
      console.error('work-session stop error:', updErr);
      return NextResponse.json({ ok: false, error: 'Tugatishda xatolik.' }, { status: 500 });
    }

    const minutes = Math.round((Date.now() - new Date(open.started_at).getTime()) / 60000);
    return NextResponse.json({ ok: true, minutes });
  } catch (err) {
    console.error('work-session API error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
