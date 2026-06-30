import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canAccess, type Role, type Section } from '@/lib/auth';
import { verifySessionToken } from '@/lib/session';

// Auth talab QILINMAYDIGAN API prefiksilar (bot, webhook, login, health, chek).
// Telegram va print-agent bu endpointlarni cookie'siz chaqiradi.
const PUBLIC_API_PREFIXES = [
  '/api/auth',             // login / logout
  '/api/telegram-webhook', // Telegram webhook
  '/api/bot',              // bot, bot-ui, bot-test (Telegram Web App)
  '/api/health',
  '/api/receipt',          // chek
  '/api/send-sms',
];

// Yo'l prefiksini bo'limga moslash (rol tekshiruvi uchun)
function sectionForPath(pathname: string): Section | null {
  if (pathname.startsWith('/reports/audit')) return 'audit';
  if (pathname.startsWith('/reports')) return 'reports';
  if (pathname.startsWith('/workers')) return 'workers';
  if (pathname.startsWith('/clients/reminders')) return 'reminders';
  if (pathname.startsWith('/backup')) return 'backup';
  return null; // qolgan sahifalar barcha tizimga kirganlar uchun ochiq
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host');

  // Bot domeni orqali kelsa va asosiy sahifada bo'lsa → bot-ui
  const botDomain = 'asiaautobot.com';
  const botDomainWww = 'www.asiaautobot.com';
  if ((hostname === botDomain || hostname === botDomainWww) && pathname === '/') {
    return NextResponse.rewrite(new URL('/bot-ui', request.url));
  }

  const normalizedPath = pathname.replace(/\/+/g, '/');

  // Imzolangan sessiyani tekshiramiz (soxta cookie o'tmaydi)
  const session = await verifySessionToken(request.cookies.get('auth_session')?.value);

  // ── API so'rovlari ──
  if (normalizedPath.startsWith('/api/')) {
    const isPublic = PUBLIC_API_PREFIXES.some(p => normalizedPath.startsWith(p));
    if (isPublic) return NextResponse.next();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiya talab qilinadi' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Ochiq sahifalar ──
  if (
    normalizedPath === '/login' ||
    normalizedPath === '/tg-webhook' ||
    normalizedPath.startsWith('/tg-webhook/') ||
    normalizedPath.startsWith('/bot-ui')
  ) {
    return NextResponse.next();
  }

  // ── Himoyalangan sahifalar ──
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Rol bo'yicha sahifa himoyasi (rol imzolangan tokendan olinadi — ishonchli)
  const section = sectionForPath(normalizedPath);
  if (section) {
    const role = session.role as Role;
    if (!canAccess(role, section)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)',
  ],
};
