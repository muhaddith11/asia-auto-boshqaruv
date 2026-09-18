import supabase from '@/lib/supabaseClient';
import { isCancelledHolat } from '@/lib/stock';
import { removedRasxodTotal, type ZapLike as ArchiveZapLike } from '@/lib/zapArchive';

interface ZapLike {
  rasxod?: boolean;
  kat?: string;
  narx?: number;
  summa?: number;
}

// Rasxod summasini naqd kassaga qaytaradi va `operations`ga KIRIM yozuvi qo'shadi.
// Absolyut qiymat bilan yoziladi — /api/orders/[id]/payment bilan bir xil semantika.
// Asosiy amalni BLOKLAMAYDI — xatolik bo'lsa faqat konsolga yozadi.
async function creditRasxodToKassa(amount: number, comment: string): Promise<void> {
  try {
    const nowIso = new Date().toISOString();
    const { data: kassa } = await supabase.from('kassa').select('naqd, karta').eq('id', 1).maybeSingle();
    const naqd = Number(kassa?.naqd || 0) + amount;
    const karta = Number(kassa?.karta || 0);
    const { error: kassaErr } = await supabase
      .from('kassa')
      .upsert({ id: 1, naqd, karta, updated_at: nowIso });
    if (kassaErr) {
      console.error('creditRasxodToKassa kassa error:', kassaErr);
      return;
    }

    await supabase.from('operations').insert([{
      date: nowIso.split('T')[0],
      type: 'income',
      method: 'naqd',
      amount,
      category: 'Boshqa',
      comment,
      source: 'tizim',
    }]);
  } catch (e) {
    console.error('creditRasxodToKassa error:', e);
  }
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

  await creditRasxodToKassa(rasxodTotal, `Rasxod qaytarildi — bekor qilindi (Buyurtma #${orderId})`);
}

// Buyurtma tahrirlanganda rasxod qatori OLIB TASHLANSA (o'chirilsa), uning summasi
// naqd kassaga qaytariladi — aks holda pul kassadan ayirilgan holda qolib, izsiz
// yo'qolardi (rasxod kiritilganda summa darrov kassadan ayirilgan, bot-ui/rasxod).
//
// `removed` — diffRemovedZaps() natijasi (faqat olib tashlangan qatorlar).
// Bekor qilish bilan ikki marta qaytarmaslik uchun:
//  • buyurtma allaqachon bekor bo'lgan bo'lsa — rasxod bekor qilishda qaytarilgan;
//  • shu saqlashning o'zida bekor qilinayotgan bo'lsa — refundRasxodOnCancel BUTUN
//    eski zaps'ni (olib tashlangan qatorlar ham) qaytaradi.
export async function refundRemovedRasxod(
  orderId: number,
  removed: ArchiveZapLike[],
  prevHolat: string | null | undefined,
  nextHolat: string | null | undefined,
): Promise<void> {
  if (isCancelledHolat(prevHolat) || isCancelledHolat(nextHolat)) return;

  const total = removedRasxodTotal(removed);
  if (total <= 0) return;

  const names = removed
    .filter((z) => z?.rasxod === true || z?.kat === 'Rasxod')
    .map((z) => String(z.nom ?? z.name ?? '').trim())
    .filter(Boolean)
    .join(', ');
  await creditRasxodToKassa(
    total,
    `Rasxod qaytarildi — buyurtmadan olib tashlandi${names ? `: ${names}` : ''} (Buyurtma #${orderId})`,
  );
}
