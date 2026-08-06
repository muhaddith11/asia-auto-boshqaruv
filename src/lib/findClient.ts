import supabase from '@/lib/supabaseClient';

// Bot oqimida mijozni telefon raqami bo'yicha tanish uchun helper.
// Mos kelsa mijozning haqiqiy ismini qaytaradi (accept/stage shu bilan
// "Kunlik Mijoz" o'rniga bazadagi ismni yozadi). Baza ifloslanmaydi —
// yangi mijoz YARATILMAYDI, faqat mavjudi bo'lsa tanib olinadi.
export async function findClientNameByPhone(
  phone: string | undefined | null
): Promise<string | null> {
  const clean = String(phone || '').replace(/\D/g, '');
  if (clean.length < 7) return null;
  const target = clean.slice(-9);

  const { data } = await supabase.from('clients').select('ism, tel, tel2');
  const match = data?.find((c: any) => {
    for (const raw of [c.tel, c.tel2]) {
      const db = String(raw || '').replace(/\D/g, '');
      if (db && (db.endsWith(target) || db === clean)) return true;
    }
    return false;
  });

  const name = String((match as any)?.ism || '').trim();
  return name || null;
}
