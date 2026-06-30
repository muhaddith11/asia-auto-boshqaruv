import { NextRequest, NextResponse } from 'next/server';
import { findAccount } from '@/lib/auth.server';
import { createSessionToken, SESSION_MAX_AGE_SEC } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { login, parol } = await request.json();
    const account = findAccount(login, parol);

    if (!account) {
      return NextResponse.json({ error: 'Login yoki parol noto\'g\'ri' }, { status: 401 });
    }

    const token = await createSessionToken(account.role, account.ism);
    const res = NextResponse.json({ ok: true, role: account.role, name: account.ism });

    // Imzolangan, soxtalashtirib bo'lmaydigan sessiya (httpOnly)
    res.cookies.set('auth_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SEC,
    });
    // Faqat UI uchun o'qiladigan cookie'lar (xavfsizlik uchun ishonilmaydi)
    res.cookies.set('auth_role', account.role, { sameSite: 'lax', path: '/', maxAge: SESSION_MAX_AGE_SEC });
    res.cookies.set('auth_name', encodeURIComponent(account.ism), { sameSite: 'lax', path: '/', maxAge: SESSION_MAX_AGE_SEC });

    return res;
  } catch {
    return NextResponse.json({ error: 'Noto\'g\'ri so\'rov' }, { status: 400 });
  }
}
