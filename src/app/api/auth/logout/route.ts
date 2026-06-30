import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Barcha sessiya cookie'larini o'chirish
  for (const name of ['auth_session', 'auth_role', 'auth_name']) {
    res.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return res;
}
