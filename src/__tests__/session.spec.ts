import { describe, it, expect, vi, afterEach } from 'vitest';
import { createSessionToken, readToken, signToken, verifySessionToken } from '@/lib/session';

describe('session (Web Crypto HMAC)', () => {
  it('to\'g\'ri token tekshiruvdan o\'tadi va payload qaytadi', async () => {
    const token = await createSessionToken('egasi', 'Egasi');
    const s = await verifySessionToken(token);
    expect(s).not.toBeNull();
    expect(s!.role).toBe('egasi');
    expect(s!.name).toBe('Egasi');
  });

  it('o\'zbekcha/maxsus belgili nom ham to\'g\'ri qaytadi', async () => {
    const token = await createSessionToken('sherik', "Akmal o'g'li");
    const s = await verifySessionToken(token);
    expect(s!.name).toBe("Akmal o'g'li");
  });

  it('buzilgan (soxta) token null qaytaradi', async () => {
    const token = await createSessionToken('egasi', 'Egasi');
    const tampered = token.slice(0, -2) + 'xx';
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it('bo\'sh/yaroqsiz token null', async () => {
    expect(await verifySessionToken('')).toBeNull();
    expect(await verifySessionToken('abc')).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
  });

  it('bir maqsadga berilgan token boshqa maqsadda o\'tmaydi', async () => {
    const token = await signToken({ exp: Date.now() + 1000 }, 'bot');
    expect(await readToken(token, 'bot')).not.toBeNull();
    expect(await readToken(token)).toBeNull();
    expect(await readToken(token, 'boshqa')).toBeNull();
  });
});

describe('AUTH_SECRET berilmagan holat', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sessiya yaratilmaydi va eski token o\'tmaydi', async () => {
    const token = await createSessionToken('egasi', 'Egasi');
    vi.stubEnv('AUTH_SECRET', '');
    await expect(createSessionToken('egasi', 'Egasi')).rejects.toThrow();
    expect(await verifySessionToken(token)).toBeNull();
  });
});
