import supabase from '@/lib/supabaseClient';

// Bot oqimida xodimni tanish uchun umumiy helper (submit/accept/stage/cars
// bir xil mantiqdan foydalanadi). is_boss — boshliq kuzatuvi uchun.
const WORKER_COLUMNS =
  'id, ism, tel, mutax, foiz, status, role, is_boss, is_admin, bolim, telegram, "shareType", "parentId", created_at';

export interface BotWorker {
  id: number;
  ism: string;
  tel: string | null;
  foiz: number | null;
  status: string | null;
  role: string | null;
  is_boss: boolean | null;
  is_admin: boolean | null; // "tayyor" buyurtmalarga javobgar xodim (chek chiqargandan keyin)
  bolim: string | null; // 'ustaxona' | 'yog' (null → ustaxona)
  telegram: string | null;
}

// Telefon raqami bo'yicha (oxirgi 9 raqam) xodimni topadi.
export async function findWorkerByPhone(phone: string | undefined | null): Promise<BotWorker | null> {
  const clean = String(phone || '').replace(/\D/g, '');
  if (clean.length < 7) return null;
  const target = clean.slice(-9);

  const { data: all } = await supabase.from('workers').select(WORKER_COLUMNS);
  const w = all?.find((x: any) => {
    if (!x.tel) return false;
    const db = String(x.tel).replace(/\D/g, '');
    return db.endsWith(target) || db === clean;
  });
  return (w as BotWorker) || null;
}

// Telegram ID bo'yicha xodimni topadi.
export async function findWorkerByTelegram(
  telegramId: string | number | undefined | null
): Promise<BotWorker | null> {
  if (!telegramId) return null;
  const { data } = await supabase
    .from('workers')
    .select(WORKER_COLUMNS)
    .eq('telegram', String(telegramId))
    .maybeSingle();
  return (data as BotWorker) || null;
}

// Imzolangan bot tokenidagi id bo'yicha xodimni topadi.
export async function findWorkerById(id: number): Promise<BotWorker | null> {
  const { data } = await supabase.from('workers').select(WORKER_COLUMNS).eq('id', id).maybeSingle();
  return (data as BotWorker) || null;
}

// Ishdan ketgan xodimning tokeni va kodi ishlamaydi.
export const isActiveWorker = (worker: BotWorker) => !worker.status || worker.status === 'aktiv';
