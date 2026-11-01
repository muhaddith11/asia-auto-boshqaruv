import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { telegramWebhookSecret, verifyTelegramInitData } from '@/lib/telegramAuth';

const BOT_TOKEN = 'test-bot-token';
const NOW_MS = 1_800_000_000_000;
const AUTH_DATE = String(NOW_MS / 1000 - 60);

function sign(fields: Record<string, string>, token = BOT_TOKEN) {
  const dataCheck = Object.keys(fields).sort().map((key) => `${key}=${fields[key]}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  return createHmac('sha256', secret).update(dataCheck).digest('hex');
}

function initData(fields: Record<string, string>, token = BOT_TOKEN) {
  return new URLSearchParams({ ...fields, hash: sign(fields, token) }).toString();
}

const fields = { auth_date: AUTH_DATE, query_id: 'q1', user: JSON.stringify({ id: 555, first_name: 'Ali' }) };

describe('verifyTelegramInitData', () => {
  it("Telegram imzolagan ma'lumotdan foydalanuvchini oladi", () => {
    expect(verifyTelegramInitData(initData(fields), BOT_TOKEN, NOW_MS)).toEqual({ id: 555 });
  });

  it("imzodan keyin o'zgartirilgan foydalanuvchini rad etadi", () => {
    const data = new URLSearchParams(initData(fields));
    data.set('user', JSON.stringify({ id: 999 }));
    expect(verifyTelegramInitData(data.toString(), BOT_TOKEN, NOW_MS)).toBeNull();
  });

  it('boshqa bot tokeni bilan imzolangan satrni rad etadi', () => {
    expect(verifyTelegramInitData(initData(fields, 'boshqa-token'), BOT_TOKEN, NOW_MS)).toBeNull();
  });

  it("imzosiz va bo'sh satrni rad etadi", () => {
    expect(verifyTelegramInitData('user=%7B%22id%22%3A555%7D', BOT_TOKEN, NOW_MS)).toBeNull();
    expect(verifyTelegramInitData('', BOT_TOKEN, NOW_MS)).toBeNull();
    expect(verifyTelegramInitData('hash=zzz', BOT_TOKEN, NOW_MS)).toBeNull();
  });

  it('24 soatdan eski imzoni rad etadi', () => {
    const old = { ...fields, auth_date: String(NOW_MS / 1000 - 25 * 60 * 60) };
    expect(verifyTelegramInitData(initData(old), BOT_TOKEN, NOW_MS)).toBeNull();
  });

  it("signature maydoni imzoga kirgan ham, kirmagan ham holatda ishlaydi", () => {
    const withSignature = { ...fields, signature: 'abc' };
    expect(verifyTelegramInitData(initData(withSignature), BOT_TOKEN, NOW_MS)).toEqual({ id: 555 });

    const outside = new URLSearchParams({ ...withSignature, hash: sign(fields) }).toString();
    expect(verifyTelegramInitData(outside, BOT_TOKEN, NOW_MS)).toEqual({ id: 555 });
  });
});

describe('telegramWebhookSecret', () => {
  it("Telegram qabul qiladigan ko'rinishda va tokenning o'zi emas", () => {
    const secret = telegramWebhookSecret(BOT_TOKEN);
    expect(secret).toMatch(/^[A-Za-z0-9_-]{1,256}$/);
    expect(secret).not.toContain(BOT_TOKEN);
    expect(telegramWebhookSecret('boshqa-token')).not.toBe(secret);
  });
});
