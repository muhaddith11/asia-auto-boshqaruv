import { NextRequest, NextResponse, after } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { identifyWorker } from '@/lib/botWorker';
import { cleanupExpiredMessagesThrottled } from '@/lib/messageCleanup';

export const dynamic = 'force-dynamic';

const CAR_FIELDS =
  'id, ism, mashina, raqam, tel, bosqich, holat, bolim, qabul_xodim_id, qabul_xodim_nomi, qabul_vaqti, zapchast_nomi, zapchast_vaqti, tayyor_vaqti, topshirilgan_vaqti, created_at, zaps, oil_recommendation, services, zap';

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

    // Xodim ilovani ochganda muddati o'tgan chek xabarlari tozalanadi (serverless'da setInterval ishonchsiz)
    after(() => cleanupExpiredMessagesThrottled());

    // Xodimning o'z tugallanmagan mashinalari.
    // "Tayyor" (chek chiqarilgan) mashinalar bu ro'yxatda KO'RINMAYDI — chek
    // chiqqandan so'ng buyurtma ADMIN javobgarligiga o'tadi (topshirish/to'lov
    // admin panelida bo'ladi), shuning uchun xodim ham, boshliq ham ko'rmaydi.
    const { data: myCars, error: myErr } = await supabase
      .from('orders')
      .select(CAR_FIELDS)
      .eq('qabul_xodim_id', worker.id)
      .not('bosqich', 'is', null)
      .neq('bosqich', 'tayyor')
      .neq('bosqich', 'narx_kutilmoqda')
      .neq('bosqich', 'topshirildi')
      .neq('bosqich', 'bekor_qilindi')
      .order('qabul_vaqti', { ascending: false });

    if (myErr) {
      console.error('cars myErr:', myErr);
      return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
    }

    let allCars = null;
    if (worker.is_boss) {
      // Boshliq — faqat ish jarayonidagi (faol) mashinalar. "Tayyor" (chek
      // chiqarilgan) mashinalar boshliqqa ham KO'RINMAYDI — ular admin
      // javobgarligiga o'tadi. Topshirilgan VA bekor qilingan mashinalar ham
      // ro'yxatda yo'q (ketgan/yakunlangan).
      const { data: all, error: allErr } = await supabase
        .from('orders')
        .select(CAR_FIELDS)
        .not('bosqich', 'is', null)
        .neq('bosqich', 'tayyor')
        .neq('bosqich', 'narx_kutilmoqda')
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

    // Admin — "tayyor" (chek chiqarilgan, hali topshirilmagan) buyurtmalarga
    // javobgar. Faqat adminga barcha tayyor mashinalar ko'rsatiladi (bo'limdan
    // qat'i nazar), u mijozga topshiradi. Xodim/boshliq bu ro'yxatni ko'rmaydi.
    let readyCars = null;
    if (worker.is_admin) {
      const { data: ready, error: readyErr } = await supabase
        .from('orders')
        .select(CAR_FIELDS)
        .eq('bosqich', 'tayyor')
        .order('tayyor_vaqti', { ascending: false })
        .limit(200);
      if (readyErr) {
        console.error('cars readyErr:', readyErr);
      } else {
        readyCars = ready;
      }
    }

    // Admin — narx kutayotgan buyurtmalar (xodim narxsiz xizmat kiritgan).
    let pricingCars = null;
    if (worker.is_admin) {
      const { data: pricing, error: pErr } = await supabase
        .from('orders')
        .select(CAR_FIELDS)
        .eq('bosqich', 'narx_kutilmoqda')
        .order('qabul_vaqti', { ascending: false })
        .limit(200);
      if (pErr) console.error('cars pricingErr:', pErr);
      else pricingCars = pricing;
    }

    // Ish sessiyalari — kartada "hozir ishlayapman" holati va jami vaqtni ko'rsatish uchun.
    const carIds = [...new Set([...(myCars || []), ...(allCars || []), ...(readyCars || []), ...(pricingCars || [])].map((c: { id: number }) => c.id))];
    const sessionsByOrder = new Map<number, { totalMinutes: number; openSince: string | null }>();
    if (carIds.length > 0) {
      const { data: sessions } = await supabase
        .from('work_sessions')
        .select('order_id, worker_id, started_at, ended_at')
        .in('order_id', carIds);

      for (const s of sessions || []) {
        const cur = sessionsByOrder.get(s.order_id) || { totalMinutes: 0, openSince: null };
        const start = new Date(s.started_at).getTime();
        if (s.ended_at) {
          cur.totalMinutes += Math.max(0, (new Date(s.ended_at).getTime() - start) / 60000);
        } else if (Number(s.worker_id) === Number(worker.id)) {
          // Faqat SHU xodimning ochiq sessiyasi tugmani "Tugatdim" ga aylantiradi.
          cur.openSince = s.started_at;
        }
        sessionsByOrder.set(s.order_id, cur);
      }
    }

    const withSessions = (list: Array<{ id: number }> | null) =>
      (list || []).map((c) => {
        const s = sessionsByOrder.get(c.id);
        // Rasxodlarni buyurtma zaps ichidan ajratamiz (kat='Rasxod' / rasxod:true).
        // Xom `zaps` klientga yuborilmaydi — faqat rasxod qatorlari kerak.
        const row = c as Record<string, unknown>;
        const zapsArr = Array.isArray(row.zaps) ? (row.zaps as Record<string, unknown>[]) : [];
        const rasxodlar = zapsArr
          .filter((z) => z && (z.rasxod === true || z.kat === 'Rasxod'))
          .map((z) => ({
            nom: String(z.nom || z.name || ''),
            summa: Number(z.narx || z.price || 0),
            vaqt: (z.vaqt as string) || null,
            xodim_nomi: (z.xodim_nomi as string) || null,
          }));
        const rasxod_jami = rasxodlar.reduce((sum, r) => sum + r.summa, 0);
        const { zaps: _zaps, ...rest } = row;
        void _zaps;
        return {
          ...rest,
          ish_daqiqa: Math.round(s?.totalMinutes || 0),
          ish_boshlandi: s?.openSince || null,
          rasxodlar,
          rasxod_jami,
        };
      });

    return NextResponse.json({
      ok: true,
      worker: { id: worker.id, ism: worker.ism, is_boss: !!worker.is_boss, is_admin: !!worker.is_admin, bolim: worker.bolim || 'ustaxona' },
      myCars: withSessions(myCars),
      allCars: allCars ? withSessions(allCars) : null,
      readyCars: readyCars ? withSessions(readyCars) : null,
      pricingCars: pricingCars ? withSessions(pricingCars) : null,
    });
  } catch (err) {
    console.error('cars API error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
