import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canAccess, type Role, type Section } from '@/lib/auth';

// Yo'l prefiksini bo'limga moslash (rol tekshiruvi uchun)
function sectionForPath(pathname: string): Section | null {
  if (pathname.startsWith('/reports/audit')) return 'audit';
  if (pathname.startsWith('/reports')) return 'reports';
  if (pathname.startsWith('/workers')) return 'workers';
  if (pathname.startsWith('/clients/reminders')) return 'reminders';
  if (pathname.startsWith('/backup')) return 'backup';
  return null; // qolgan sahifalar barcha tizimga kirganlar uchun ochiq
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host');

  // Yangi bot domeni
  const botDomain = 'asiaautobot.com';
  const botDomainWww = 'www.asiaautobot.com';

  // Agar bot domeni orqali kelsa va asosiy sahifada bo'lsa
  if ((hostname === botDomain || hostname === botDomainWww) && pathname === '/') {
    return NextResponse.rewrite(new URL('/bot-ui', request.url));
  }

  // Normalize path (remove double slashes)
  const normalizedPath = pathname.replace(/\/+/g, '/');

  // Allow API routes, Telegram Webhook, Login page, and Bot UI Web App
  if (
    normalizedPath.startsWith('/api/') ||
    normalizedPath === '/login' || 
    normalizedPath === '/tg-webhook' || 
    normalizedPath.startsWith('/tg-webhook/') || 
    normalizedPath.startsWith('/bot-ui')
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('auth_session');

  if (!authCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Rol bo'yicha sahifa himoyasi
  const section = sectionForPath(normalizedPath);
  if (section) {
    const role = request.cookies.get('auth_role')?.value as Role | undefined;
    if (!canAccess(role ?? null, section)) {
      // Ruxsat yo'q — bosh sahifaga qaytaramiz
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except /api/bot)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)',
  ],
};
