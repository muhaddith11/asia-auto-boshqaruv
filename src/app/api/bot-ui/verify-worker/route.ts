import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// Brauzerda (Telegram'siz) xodimni telefon raqami orqali tanish uchun.
// Submit route bilan bir xil moslashtirish mantig'i — oxirgi 9 raqam.
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const cleanInputPhone = String(phone || '').replace(/\D/g, '');

    if (cleanInputPhone.length < 7) {
      return NextResponse.json(
        { ok: false, error: "Telefon raqamini to'liq kiriting." },
        { status: 400 }
      );
    }

    const searchTarget = cleanInputPhone.slice(-9); // oxirgi 9 raqam

    const { data: allWorkers, error } = await supabase
      .from('workers')
      .select('id, ism, tel, telegram');

    if (error) {
      console.error('verify-worker DB xatosi:', error);
      return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
    }

    const worker = allWorkers?.find((w: any) => {
      if (!w.tel) return false;
      const dbNormalized = String(w.tel).replace(/\D/g, '');
      return dbNormalized.endsWith(searchTarget) || dbNormalized === cleanInputPhone;
    });

    if (!worker) {
      return NextResponse.json(
        {
          ok: false,
          error: "Bu raqam xodimlar ro'yxatida topilmadi. Rahbaringizga murojaat qiling.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      worker: {
        id: worker.id,
        ism: worker.ism,
        tel: worker.tel,
        telegram: worker.telegram || '',
      },
    });
  } catch (err) {
    console.error('verify-worker xatosi:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
