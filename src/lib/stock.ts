import supabase from '@/lib/supabaseClient';

// ─────────────────────────────────────────────────────────────────────────────
// Ombor (zapchast) balansini SERVER tomonda boshqarish — yagona ishonchli manba.
//
// Buyurtmadagi har bir zapchast ombordan chiqadi (balans kamayadi). Buyurtma
// bekor qilinsa yoki o'chirilsa — qaytadi. Buyurtma tahrirlanганда farqi
// (qo'shilgan/olib tashlangan/soni o'zgargan) hisoblanadi.
//
// Bularning barchasi bitta formula bilan ifodalanadi:
//   delta = yangi_effektiv - eski_effektiv
//   balance -= delta
// bu yerda "effektiv" — buyurtma bekor qilingan bo'lsa 0 (ombordan hech nima
// chiqmaydi), aks holda zaps'dagi har bir zapchast id -> jami qty.
//
// Client tomonda balansga TEGILMAYDI — ikki marta kamaymasligi uchun.
// ─────────────────────────────────────────────────────────────────────────────

export interface ZapLike {
  id?: number | string | null;
  qty?: number;
  quantity?: number;
}

export interface OrderStockState {
  zaps?: ZapLike[] | null;
  holat?: string | null;
}

// Buyurtmaning "effektiv" zapchast miqdorlari (id -> jami qty).
// Bekor qilingan buyurtma ombordan hech narsa olmaydi — bo'sh map.
export function effectiveQtyMap(zaps: ZapLike[] | null | undefined, holat: string | null | undefined): Map<number, number> {
  const map = new Map<number, number>();
  if (holat === 'bekor qilingan') return map;
  for (const z of (zaps || [])) {
    const id = Number(z?.id);
    if (!id) continue;
    const qty = Number(z.qty ?? z.quantity ?? 1) || 1;
    map.set(id, (map.get(id) || 0) + qty);
  }
  return map;
}

// Har bir zapchast id uchun eski->yangi o'tishdagi balans o'zgarishini qaytaradi
// (delta = yangi_effektiv - eski_effektiv). Testlarda alohida tekshirish uchun eksport.
export function computeStockDeltas(
  oldState: OrderStockState | null,
  newState: OrderStockState | null,
): Map<number, number> {
  const oldMap = effectiveQtyMap(oldState?.zaps, oldState?.holat);
  const newMap = effectiveQtyMap(newState?.zaps, newState?.holat);
  const deltas = new Map<number, number>();
  const ids = new Set<number>([...oldMap.keys(), ...newMap.keys()]);
  for (const id of ids) {
    const delta = (newMap.get(id) || 0) - (oldMap.get(id) || 0);
    if (delta !== 0) deltas.set(id, delta);
  }
  return deltas;
}

// Ombor balansini eski holatdan yangi holatga o'tishga qarab moslashtiradi.
// Asosiy amalni BLOKLAMAYDI — xatolik bo'lsa faqat konsolga yozadi.
export async function applyStockDelta(
  oldState: OrderStockState | null,
  newState: OrderStockState | null,
): Promise<void> {
  if (!supabase) return;
  const deltas = computeStockDeltas(oldState, newState);
  for (const [id, delta] of deltas) {
    try {
      const { data } = await supabase.from('parts').select('balance').eq('id', id).maybeSingle();
      if (!data) continue;
      await supabase.from('parts').update({ balance: (Number(data.balance) || 0) - delta }).eq('id', id);
    } catch (e) {
      console.error('❌ Ombor balansini yangilashda xatolik (part', id, '):', e);
    }
  }
}
