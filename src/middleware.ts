import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Telegram Webhook, Login page, and Bot UI Web App
  if (pathname === '/login' || pathname.startsWith('/api/bot') || pathname.startsWith('/api/bot-test') || pathname.startsWith('/api/debug-env') || pathname.startsWith('/api/debug-tg') || pathname.startsWith('/bot-ui')) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('auth_session');

  if (!authCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
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
