import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { identifyWorker } from '@/lib/botWorker';

export const dynamic = 'force-dynamic';

interface RasxodItemIn {
  nom: string;
  summa: number | string;
}

// Xodim mashinaga qilgan rasxodini (masalan zapchast sotib olish) kiritadi.
//
// Nima bo'ladi (foydalanuvchi bilan tasdiqlangan model):
//   1) Har bir rasxod buyurtmaning `zaps` ro'yxatiga qo'shiladi (kat='Rasxod',
//      rasxod:true). Shu tufayli u buyurtma tafsilotida, chekda ("Ehtiyot
//      qismlar") va zap/total/final summalarida ko'rinadi.
//   2) Summa DARROV kassadan (naqd) ayiriladi + `operations`ga CHIQIM yoziladi
//      (dashboard'dagi qo'lda "Buyurtma bo'yicha to'lov" bilan bir xil).
//   3) Mijoz to'laganda (holat='tulangan') pul final ichida kassaga qaytadi.
//
// Sxema o'zgarmaydi — rasxod mavjud `zaps` jsonb ichida saqlanadi.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, items, workerPhone, mechanicChatId } = body as {
      orderId: number;
      items: RasxodItemIn[];
      workerPhone?: string;
      mechanicChatId?: string;
    };

    const worker = await identifyWorker(workerPhone, mechanicChatId);
    if (!worker) {
      return NextResponse.json({ ok: false, error: 'Xodim topilmadi.' }, { status: 403 });
    }
    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Ma'lumot to'liq emas." }, { status: 400 });
    }

    // Rasxod qatorlarini tozalash/tekshirish
    const clean = (Array.isArray(items) ? items : [])
      .map((it) => ({ nom: String(it?.nom || '').trim(), summa: Math.round(Number(it?.summa) || 0) }))
      .filter((it) => it.nom && it.summa > 0);
    if (clean.length === 0) {
      return NextResponse.json({ ok: false, error: 'Rasxod nomi va summasini kiriting.' }, { status: 400 });
    }
    const total = clean.reduce((s, it) => s + it.summa, 0);

    // Buyurtmani olib egaligini (o'zi qabul qilgan yoki boshliq) va holatini tekshiramiz
    const { data: order, error: getErr } = await supabase
      .from('orders')
      .select('id, qabul_xodim_id, bosqich, holat, zaps, zap, total, final, status_log')
      .eq('id', orderId)
      .maybeSingle();
    if (getErr || !order) {
      return NextResponse.json({ ok: false, error: 'Mashina topilmadi.' }, { status: 404 });
    }
    if (order.qabul_xodim_id !== worker.id && !worker.is_boss) {
      return NextResponse.json({ ok: false, error: 'Bu mashina sizniki emas.' }, { status: 403 });
    }
    if (order.holat === 'tulangan') {
      return NextResponse.json(
        { ok: false, error: "Buyurtma to'langan — rasxod qo'shib bo'lmaydi." },
        { status: 400 }
      );
    }
    if (order.bosqich === 'topshirildi' || order.bosqich === 'bekor_qilindi') {
      return NextResponse.json({ ok: false, error: 'Mashina faol emas.' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();

    // Rasxodni buyurtmaning zaps ro'yxatiga qo'shamiz. narx=sebestoimost bo'lgani
    // uchun buyurtma foydasiga (pribil) ta'sir qilmaydi — bu dashboard'dagi
    // "Buyurtma bo'yicha to'lov" bilan aynan bir xil hisob.
    const existingZaps = Array.isArray(order.zaps) ? order.zaps : [];
    const newZaps = clean.map((it, i) => ({
      id: -(Date.now() + i),
      nom: it.nom,
      narx: it.summa,
      sebestoimost: it.summa,
      qty: 1,
      bir: 'dona',
      kat: 'Rasxod',
      rasxod: true,
      xodim_id: worker.id,
      xodim_nomi: worker.ism,
      vaqt: nowIso,
    }));

    const log = Array.isArray(order.status_log) ? order.status_log : [];
    log.push({
      bosqich: order.bosqich,
      vaqt: nowIso,
      xodim_id: worker.id,
      izoh: `Rasxod: ${clean
        .map((c) => `${c.nom} — ${c.summa.toLocaleString('ru-RU')}`)
        .join('; ')} (jami ${total.toLocaleString('ru-RU')} so'm)`,
    });

    // ── 1) Buyurtmani yangilash ─────────────────────────────────────────────
    // Avval pul NIMA UCHUN ketgani (rasxod qatori) yozib qo'yiladi, keyin kassa
    // ayiriladi — shunda kassa kamayib, izsiz qolmaydi.
    const nextZap = Number(order.zap || 0) + total;
    const nextTotal = Number(order.total || 0) + total;
    const nextFinal = Number(order.final || 0) + total;
    const { error: updErr } = await supabase
      .from('orders')
      .update({
        zaps: [...existingZaps, ...newZaps],
        zap: nextZap,
        total: nextTotal,
        final: nextFinal,
        status_log: log,
      })
      .eq('id', orderId);
    if (updErr) {
      console.error('rasxod order update error:', updErr);
      return NextResponse.json({ ok: false, error: 'Saqlashda xatolik.' }, { status: 500 });
    }

    // ── 2) Kassadan (naqd) ayirish ──────────────────────────────────────────
    // Absolyut qiymat bilan yoziladi — /api/orders/[id]/payment bilan bir xil semantika.
    const { data: kassa } = await supabase.from('kassa').select('naqd, karta').eq('id', 1).maybeSingle();
    const naqd = Number(kassa?.naqd || 0) - total;
    const karta = Number(kassa?.karta || 0);
    const { error: kassaErr } = await supabase
      .from('kassa')
      .upsert({ id: 1, naqd, karta, updated_at: nowIso });
    if (kassaErr) {
      console.error('rasxod kassa update error:', kassaErr);
      return NextResponse.json(
        { ok: false, error: 'Kassa yangilanmadi: ' + kassaErr.message },
        { status: 500 }
      );
    }

    // ── 3) Har bir rasxod uchun CHIQIM operatsiyasi ─────────────────────────
    // Buyurtma bilan bog'lanish comment orqali ("Buyurtma #id") — operations
    // jadvalida order_id ustuni yo'q (dailyReport shu shaklda o'qiydi).
    const opRows = clean.map((it) => ({
      date: nowIso.split('T')[0],
      type: 'expense',
      method: 'naqd',
      amount: it.summa,
      category: "Buyurtma bo'yicha to'lov",
      comment: `Rasxod: ${it.nom} (Buyurtma #${orderId})`,
      source: worker.ism || 'bot',
    }));
    const { error: opErr } = await supabase.from('operations').insert(opRows);
    if (opErr) {
      // Kassa va buyurtma yangilandi; faqat jurnal yozuvi tushmadi (kam holat).
      // Asosiy ish bajarilgani uchun xatoni yutamiz, lekin log qoldiramiz.
      console.error('rasxod operations insert error:', opErr);
    }

    return NextResponse.json({
      ok: true,
      total,
      zap: nextZap,
      final: nextFinal,
      kassa: { naqd, karta },
    });
  } catch (err) {
    console.error('rasxod API error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
