import crypto from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Server tomon imzolangan sessiya tokeni (HMAC-SHA256).
// Faqat server kodida ishlatiladi (proxy, /api/auth). Client'ga chiqmaydi.
// Token soxtalashtirib bo'lmaydi (oldingi `auth_session=active` dan farqli).
// ─────────────────────────────────────────────────────────────────────────────

const SECRET = process.env.AUTH_SECRET || 'asia-auto-service-default-secret-2026-change-me';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 kun
export const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

export interface Session {
  role: string;
  name: string;
  exp: number;
}

function sign(body: string): string {
  return crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}

export function createSessionToken(role: string, name: string): string {
  const payload: Session = { role, name, exp: Date.now() + MAX_AGE_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as Session;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
