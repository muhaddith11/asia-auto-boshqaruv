import { NextRequest, NextResponse } from 'next/server';
import { canAccess, type Role, type Section } from '@/lib/auth';
import { verifySessionToken, type Session } from '@/lib/session';

// ─────────────────────────────────────────────────────────────────────────────
// API route'lar uchun umumiy tekshiruvlar. proxy.ts faqat "tizimga kirganmi"ni
// tekshiradi — bo'lim huquqini (masalan hisobotlar) route o'zi tekshiradi.
// Rol imzolangan sessiyadan olinadi: auth_role cookie'sini qo'lda o'zgartirib
// o'tib bo'lmaydi.
// ─────────────────────────────────────────────────────────────────────────────

export type GuardResult = { session: Session; denied: null } | { session: null; denied: NextResponse };

export async function requireSection(request: NextRequest, section: Section): Promise<GuardResult> {
  const session = await verifySessionToken(request.cookies.get('auth_session')?.value);
  if (!session) {
    return { session: null, denied: NextResponse.json({ error: 'Avtorizatsiya talab qilinadi' }, { status: 401 }) };
  }
  if (!canAccess(session.role as Role, section)) {
    return { session: null, denied: NextResponse.json({ error: "Bu amal uchun ruxsat yo'q" }, { status: 403 }) };
  }
  return { session, denied: null };
}

// Pul va o'chirish amallari — faqat egasi va boshliq.
export const FULL_ACCESS: Role[] = ['egasi', 'boshliq'];

export async function requireRole(request: NextRequest, roles: Role[]): Promise<GuardResult> {
  const session = await verifySessionToken(request.cookies.get('auth_session')?.value);
  if (!session) {
    return { session: null, denied: NextResponse.json({ error: 'Avtorizatsiya talab qilinadi' }, { status: 401 }) };
  }
  if (!roles.includes(session.role as Role)) {
    return { session: null, denied: NextResponse.json({ error: "Bu amal uchun ruxsat yo'q" }, { status: 403 }) };
  }
  return { session, denied: null };
}

// JSON obyekt bo'lmasa (yaroqsiz JSON, massiv, bo'sh tana) — null.
export const PAYMENT_DENIED_MESSAGE = "To'lovni faqat egasi yoki boshliq belgilaydi";

interface OrderMoneyFields {
  paid?: unknown;
  holat?: unknown;
}

// Buyurtmani tahrirlash xodimga ochiq, lekin to'langan summa va "tulangan" holati
// faqat egasi/boshliq qo'lida (o'zgarmagan qiymatni qayta yuborish mumkin).
export function isPaymentChangeDenied(role: string, next: OrderMoneyFields, prev: OrderMoneyFields | null): boolean {
  if (FULL_ACCESS.includes(role as Role)) return false;
  const paidChanged = next.paid !== undefined && Number(next.paid || 0) !== Number(prev?.paid || 0);
  const holatChanged = next.holat !== undefined && next.holat !== prev?.holat;
  return paidChanged || (holatChanged && (next.holat === 'tulangan' || prev?.holat === 'tulangan'));
}

export async function readJsonObject(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

// URL'dagi [id] — faqat musbat butun son.
export function parseIdParam(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function errorMessage(err: unknown, fallback = 'Server xatosi'): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
