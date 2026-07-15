import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';

// Eslatma: OWNER_PASSWORD/PARTNER_PASSWORD/WORKER_PASSWORD env o'rnatilmagan bo'lsa,
// src/lib/auth.server.ts standart parollarga tushadi (asiaauto/salom123 va h.k.).
// Bu modul-darajasidagi konstanta bo'lgani uchun import vaqtida bir marta o'qiladi —
// shu sabab testda vi.stubEnv o'rniga aynan shu standart qiymatlardan foydalanamiz
// (xuddi README'da hujjatlashtirilgani kabi).

function loginRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('/api/auth/login', () => {
  it("to'g'ri login/parol bilan sessiya yaratadi va httpOnly cookie qo'yadi", async () => {
    const res = await POST(loginRequest({ login: 'asiaauto', parol: 'salom123' }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({ ok: true, role: 'egasi', name: 'Egasi' });

    const sessionCookie = res.cookies.get('auth_session');
    expect(sessionCookie?.value).toBeTruthy();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.sameSite).toBe('lax');

    // UI-only cookie'lar ham qo'yiladi, lekin ular auth uchun ishonilmaydi
    expect(res.cookies.get('auth_role')?.value).toBe('egasi');
  });

  it('login case-insensitive ishlaydi', async () => {
    const res = await POST(loginRequest({ login: 'ASIAAUTO', parol: 'salom123' }));
    expect(res.status).toBe(200);
  });

  it("noto'g'ri parol bilan 401 va sessiya cookie'siz qaytadi", async () => {
    const res = await POST(loginRequest({ login: 'asiaauto', parol: "noto'g'ri" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBeTruthy();
    expect(res.cookies.get('auth_session')).toBeUndefined();
  });

  it("mavjud bo'lmagan login bilan 401 qaytadi", async () => {
    const res = await POST(loginRequest({ login: 'bunday-login-yoq', parol: 'x' }));
    expect(res.status).toBe(401);
  });

  it('buzilgan JSON bilan 400 qaytadi', async () => {
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: '{ buzilgan json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("boshqa rol (sherik) uchun ham to'g'ri sessiya yaratadi", async () => {
    const res = await POST(loginRequest({ login: 'sherik', parol: 'sherik123' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.role).toBe('sherik');
  });
});
