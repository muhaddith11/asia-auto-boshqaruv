import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { identifyWorker } from '@/lib/botWorker';

export const dynamic = 'force-dynamic';

// Xodim mashinani QABUL qiladi — yengil buyurtma yaratiladi (bosqich=qabul_qilindi).
// Xizmat/zapchast/narx keyinroq (topshirish bosqichida) qo'shiladi.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brand, model, plateNumber, customerPhone, workerPhone, mechanicChatId } = body;

    const worker = await identifyWorker(workerPhone, mechanicChatId);
    if (!worker) {
      return NextResponse.json(
        { ok: false, error: 'Siz tizimda xodim sifatida topilmadingiz.' },
        { status: 403 }
      );
    }

    if (!brand || !model) {
      return NextResponse.json(
        { ok: false, error: 'Marka va rusum (model) tanlanishi shart.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const nowIso = now.toISOString();

    const orderData = {
      ism: 'Kunlik Mijoz',
      tel: customerPhone || '',
      mashina: `${brand} ${model}`.trim(),
      raqam: plateNumber || '',
      km: '',
      muammo: '',
      sana: nowIso.split('T')[0],
      created_at: nowIso,
      holat: 'jarayonda', // to'lov emas — hali topshirilmagan
      bosqich: 'qabul_qilindi',
      qabul_xodim_id: worker.id,
      qabul_xodim_nomi: worker.ism,
      qabul_vaqti: nowIso,
      services: [],
      zaps: [],
      srv: 0,
      zap: 0,
      total: 0,
      final: 0,
      zarplata: 0,
      pribil: 0,
      status_log: [{ bosqich: 'qabul_qilindi', vaqt: nowIso, xodim_id: worker.id }],
    };

    const { data, error } = await supabase.from('orders').insert([orderData]).select('id').single();

    if (error) {
      console.error('Accept save error:', error);
      return NextResponse.json({ ok: false, error: 'Bazaga saqlashda xatolik: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error('Accept API error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
