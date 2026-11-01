import { createHash, createHmac, timingSafeEqual } from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Telegram tomonidan imzolangan ma'lumotlarni tekshirish.
// Faqat server kodida ishlatiladi — bot tokeni kerak.
// ─────────────────────────────────────────────────────────────────────────────

const INIT_DATA_MAX_AGE_SEC = 24 * 60 * 60;

export const TELEGRAM_WEBHOOK_URL = 'https://asiaautobot.com/api/telegram-webhook';

export interface TelegramUser {
  id: number;
}

function hashMatches(entries: [string, string][], secret: Buffer, hash: string): boolean {
  const dataCheckString = [...entries]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const expected = createHmac('sha256', secret).update(dataCheckString).digest();
  const given = Buffer.from(hash, 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Mini App ochilganda Telegram beradigan `initData` satrini tekshiradi.
// Foydalanuvchi faqat shu imzo orqali tanilishi mumkin: `initDataUnsafe` yoki
// URL'dagi raqamni istalgan odam o'zgartira oladi.
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  nowMs: number = Date.now(),
): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  const entries = [...params.entries()].filter(([key]) => key !== 'hash');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  // Yangi Telegram ilovalari `signature` maydonini ham qo'shadi va u har doim
  // ham shu imzoga kirmaydi. Ikkala holatda ham haqiqiy hash baribir kerak.
  const valid =
    hashMatches(entries, secret, hash) ||
    hashMatches(entries.filter(([key]) => key !== 'signature'), secret, hash);
  if (!valid) return null;

  const authDate = Number(params.get('auth_date'));
  if (!authDate || nowMs / 1000 - authDate > INIT_DATA_MAX_AGE_SEC) return null;

  try {
    const user = JSON.parse(params.get('user') || 'null');
    return user && typeof user.id === 'number' ? { id: user.id } : null;
  } catch {
    return null;
  }
}

// Telegram har webhook so'roviga shu qiymatni `X-Telegram-Bot-Api-Secret-Token`
// sarlavhasida qo'shadi. Bot tokenidan olinadi, shu sabab alohida env kerak emas.
// Token yangilansa /api/bot/set-webhook qayta ochilishi kerak.
export function telegramWebhookSecret(botToken: string): string {
  return createHash('sha256').update(`webhook:${botToken}`).digest('hex');
}
