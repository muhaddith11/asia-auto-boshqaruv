import supabase from '@/lib/supabaseClient';
import { isCancelledHolat } from '@/lib/stock';

interface ZapLike {
  rasxod?: boolean;
  kat?: string;
  narx?: number;
  summa?: number;
}

// Buyurtma YANGI bekor qilinganda (ilgari bekor bo'lmagan holatdan bekorga
// o'tganda), unga bot-ui/rasxod orqali kiritilgan xarajatlar (agar bo'lsa)
// naqd kassaga qaytariladi. Sabab: rasxod kiritilganda summa DARROV naqd
// kassadan ayirilgan edi (bot-ui/rasxod/route.ts) — agar keyin buyurtma
// (ish) amalga oshmay bekor bo'lsa, bu pul yo'qolib qolmasligi kerak.
//
// Faqat BIR MARTA ishlaydi: prevHolat allaqachon bekor bo'lsa (masalan
// buyurtma qayta saqlansa) qayta qaytarilmaydi.
export async function refundRasxodOnCancel(
  orderId: number,
  zaps: ZapLike[] | null | undefined,
  prevHolat: string | null | undefined,
  nextHolat: string | null | undefined,
): Promise<void> {
  if (isCancelledHolat(prevHolat) || !isCancelledHolat(nextHolat)) return;

  const rasxodTotal = (zaps || [])
    .filter((z) => z?.rasxod === true || z?.kat === 'Rasxod')
    .reduce((s, z) => s + (Number(z.narx ?? z.summa) || 0), 0);
  if (rasxodTotal <= 0) return;

  try {
    const nowIso = new Date().toISOString();
    const { data: kassa } = await supabase.from('kassa').select('naqd, karta').eq('id', 1).maybeSingle();
    const naqd = Number(kassa?.naqd || 0) + rasxodTotal;
    const karta = Number(kassa?.karta || 0);
    const { error: kassaErr } = await supabase
      .from('kassa')
      .upsert({ id: 1, naqd, karta, updated_at: nowIso });
    if (kassaErr) {
      console.error('refundRasxodOnCancel kassa error:', kassaErr);
      return;
    }

    await supabase.from('operations').insert([{
      date: nowIso.split('T')[0],
      type: 'income',
      method: 'naqd',
      amount: rasxodTotal,
      category: 'Boshqa',
      comment: `Rasxod qaytarildi — bekor qilindi (Buyurtma #${orderId})`,
      source: 'tizim',
    }]);
  } catch (e) {
    console.error('refundRasxodOnCancel error:', e);
  }
}
