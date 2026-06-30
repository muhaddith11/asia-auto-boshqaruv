// ─────────────────────────────────────────────────────────────────────────────
// Server tomon imzolangan sessiya tokeni (HMAC-SHA256).
// Web Crypto (global `crypto.subtle`) ishlatadi — Vercel Edge va Node, ikkalasida
// ham ishlaydi. Faqat server kodida (proxy, /api/auth). Soxtalashtirib bo'lmaydi.
// ─────────────────────────────────────────────────────────────────────────────

const SECRET = process.env.AUTH_SECRET || 'asia-auto-service-default-secret-2026-change-me';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 kun
export const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

export interface Session {
  role: string;
  name: string;
  exp: number;
}

const encoder = new TextEncoder();

function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(s: string): Uint8Array {
  let t = s.replace(/-/g, '+').replace(/_/g, '/');
  while (t.length % 4) t += '=';
  const bin = atob(t);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  return bytesToB64url(new Uint8Array(sigBuf));
}

// Doimiy-vaqtli solishtirish (timing leak oldini olish)
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSessionToken(role: string, name: string): Promise<string> {
  const payload: Session = { role, name, exp: Date.now() + MAX_AGE_MS };
  const body = bytesToB64url(encoder.encode(JSON.stringify(payload)));
  const sig = await hmac(body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = await hmac(body);
  if (!safeEqual(sig, expected)) return null;

  try {
    const json = new TextDecoder().decode(b64urlToBytes(body));
    const payload = JSON.parse(json) as Session;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
