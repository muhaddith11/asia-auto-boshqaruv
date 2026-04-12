import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normalize path (remove double slashes)
  const normalizedPath = pathname.replace(/\/+/g, '/');

  // Allow Telegram Webhook, Login page, and Bot UI Web App
  if (
    normalizedPath === '/login' || 
    normalizedPath === '/tg-webhook' || 
    normalizedPath.startsWith('/tg-webhook/') || 
    normalizedPath.startsWith('/api/debug-outgoing') || 
    normalizedPath.startsWith('/api/bot') || 
    normalizedPath.startsWith('/api/telegram-webhook') || 
    normalizedPath.startsWith('/api/bot-test') || 
    normalizedPath.startsWith('/api/debug-env') || 
    normalizedPath.startsWith('/api/debug-tg') || 
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
