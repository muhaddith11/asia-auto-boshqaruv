import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host')

  // Yangi bot domeni
  const botDomain = 'asiaautobot.com'
  const botDomainWww = 'www.asiaautobot.com'

  // Agar foydalanuvchi bot domeni orqali kelsa
  if (hostname === botDomain || hostname === botDomainWww) {
    // Agar u asosiy sahifaga kelsa (/), uni /bot-ui ga yo'naltiramiz
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/bot-ui', request.url))
    }
    
    // Agar u boshqa sahifalarga (masalan /orders) kirmoqchi bo'lsa ham 
    // uni bot-ui ichida ushlab qolishimiz mumkin (ixtiyoriy)
    // Hozircha faqat asosiy sahifani rewrite qilamiz
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Quyidagi yo'llardan tashqari barcha so'rovlarni tekshirish:
     * - api (API marshrutlari)
     * - _next/static (statik fayllar)
     * - _next/image (rasmlar)
     * - favicon.ico (belgi fayli)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
