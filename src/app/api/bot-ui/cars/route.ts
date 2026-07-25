import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { identifyWorker } from '@/lib/botWorker';

export const dynamic = 'force-dynamic';

const CAR_FIELDS =
  'id, mashina, raqam, tel, bosqich, qabul_xodim_id, qabul_xodim_nomi, qabul_vaqti, zapchast_nomi, zapchast_vaqti, tayyor_vaqti, topshirilgan_vaqti, created_at';

// Xodim uchun — o'zining tugallanmagan mashinalari.
// Boshliq uchun — qo'shimcha: barcha xodimlarning barcha (faol) mashinalari.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const tg = searchParams.get('tg');

    const worker = await identifyWorker(phone, tg);
    if (!worker) {
      return NextResponse.json(
        { ok: false, error: 'Siz tizimda xodim sifatida topilmadingiz.' },
        { status: 403 }
      );
    }

    // Xodimning o'z tugallanmagan mashinalari (topshirilmagan)
    const { data: myCars, error: myErr } = await supabase
      .from('orders')
      .select(CAR_FIELDS)
      .eq('qabul_xodim_id', worker.id)
      .not('bosqich', 'is', null)
      .neq('bosqich', 'topshirildi')
      .neq('bosqich', 'bekor_qilindi')
      .order('qabul_vaqti', { ascending: false });

    if (myErr) {
      console.error('cars myErr:', myErr);
      return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
    }

    let allCars = null;
    if (worker.is_boss) {
      // Boshliq — faqat ustaxonadagi (faol) mashinalar. Topshirilgan VA bekor
      // qilingan mashinalar ustaxonada yo'q (ketgan) → ro'yxatda ko'rinmaydi.
      const { data: all, error: allErr } = await supabase
        .from('orders')
        .select(CAR_FIELDS)
        .not('bosqich', 'is', null)
        .neq('bosqich', 'topshirildi')
        .neq('bosqich', 'bekor_qilindi')
        .order('qabul_vaqti', { ascending: false })
        .limit(200);
      if (allErr) {
        console.error('cars allErr:', allErr);
      } else {
        allCars = all;
      }
    }

    return NextResponse.json({
      ok: true,
      worker: { id: worker.id, ism: worker.ism, is_boss: !!worker.is_boss },
      myCars: myCars || [],
      allCars,
    });
  } catch (err) {
    console.error('cars API error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
