import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { logAudit } from '@/lib/audit';
import { notifyOrderReady } from '@/lib/telegramNotify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Buyurtma "tayyor" xabarini Telegram guruhga qo'lda yuborish.
// Buyurtmalar sahifasidagi "SMS yuborish" tugmasi shu endpointni chaqiradi.
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Buyurtma topilmadi' }, { status: 404 });
    }

    await notifyOrderReady(order);

    await logAudit({
      req: request,
      action: 'telegram_notify',
      entity: 'order',
      entityId: id,
      details: { mashina: order.mashina, raqam: order.raqam },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Telegram notify endpoint xatosi:', err);
    return NextResponse.json({ error: err.message || 'Guruhga yuborishda xatolik' }, { status: 500 });
  }
}
