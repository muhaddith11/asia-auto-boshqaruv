import { randomInt } from 'crypto';
import supabase from '@/lib/supabaseClient';
import { hmac, safeEqual } from '@/lib/session';

// Telegram'dan tashqarida (brauzerda) bot-ui'ga kirish kodi. Kod xodimning
// o'z Telegram'iga boradi, shu sabab telefon raqamini bilish yetarli emas.

const CODE_TTL_MS = 5 * 60 * 1000;
const RESEND_AFTER_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const codeHash = (workerId: number, code: string) => hmac(`${workerId}:${code}`, 'bot-code');

async function sendCode(chatId: string, code: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `Asia Auto kirish kodi: ${code}\n\nKod 5 daqiqa amal qiladi. Uni hech kimga bermang.`,
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Telegram javobi: ${res.status}`);
}

// Tez-tez so'ralsa yoki urinishlar tugagan bo'lsa, yangi kod berilmaydi.
export async function issueLoginCode(workerId: number, chatId: string): Promise<void> {
  const { data: prev } = await supabase
    .from('bot_login_codes')
    .select('attempts, expires_at, created_at')
    .eq('worker_id', workerId)
    .maybeSingle();

  const now = Date.now();
  if (prev) {
    const tooSoon = now - new Date(prev.created_at).getTime() < RESEND_AFTER_MS;
    const locked = prev.attempts >= MAX_ATTEMPTS && new Date(prev.expires_at).getTime() > now;
    if (tooSoon || locked) return;
  }

  const code = String(randomInt(100000, 1000000));
  const code_hash = await codeHash(workerId, code);
  if (!code_hash) throw new Error('AUTH_SECRET sozlanmagan');

  const { error } = await supabase.from('bot_login_codes').upsert({
    worker_id: workerId,
    code_hash,
    attempts: 0,
    expires_at: new Date(now + CODE_TTL_MS).toISOString(),
    created_at: new Date(now).toISOString(),
  });
  if (error) throw new Error(error.message);

  await sendCode(chatId, code);
}

export async function consumeLoginCode(workerId: number, code: string): Promise<boolean> {
  const { data: row } = await supabase
    .from('bot_login_codes')
    .select('code_hash, expires_at, attempts')
    .eq('worker_id', workerId)
    .maybeSingle();
  if (!row || row.attempts >= MAX_ATTEMPTS || new Date(row.expires_at).getTime() < Date.now()) return false;

  // Urinish koddan OLDIN sanaladi: bir vaqtda yuborilgan so'rovlardan faqat
  // bittasi shu qiymatdan o'tadi, shu sabab 5 tadan ortiq sinab bo'lmaydi.
  const { data: claimed } = await supabase
    .from('bot_login_codes')
    .update({ attempts: row.attempts + 1 })
    .eq('worker_id', workerId)
    .eq('attempts', row.attempts)
    .select('worker_id');
  if (!claimed?.length) return false;

  const hash = await codeHash(workerId, code);
  if (!hash || !safeEqual(hash, row.code_hash)) return false;

  await supabase.from('bot_login_codes').delete().eq('worker_id', workerId);
  return true;
}
