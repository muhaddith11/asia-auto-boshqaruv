import supabase from '@/lib/supabaseClient';

// Har bir chekning DOIMIY nusxasi kimlarga boradi: admin chati (ADMIN_TELEGRAM_ID)
// va `workers.chek_nusxa` belgilangan xodimlar (2026-11-03 dan Umarxon). Ularga
// borgan chek bot_messages_to_delete ga yozilmaydi — 24 soatdan keyin o'chmaydi.
// Yangi xodim qo'shish: UPDATE workers SET chek_nusxa = true WHERE id = ...
export async function chekNusxaChatlari(): Promise<Set<string>> {
  const targets = new Set<string>();
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  if (adminId) targets.add(String(adminId));
  const { data } = await supabase.from('workers').select('telegram').eq('chek_nusxa', true);
  for (const w of Array.isArray(data) ? data : []) if (w?.telegram) targets.add(String(w.telegram));
  return targets;
}
