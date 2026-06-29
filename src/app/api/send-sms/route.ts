import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ── Token cache (Eskiz token ~29 kun amal qiladi) ────────────────────────────
let _tokenCache: { token: string; ts: number } | null = null;
const TOKEN_TTL_MS = 28 * 24 * 60 * 60 * 1000; // 28 kun

async function getEskizToken(): Promise<string> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < TOKEN_TTL_MS) {
    return _tokenCache.token;
  }

  const email    = process.env.ESKIZ_EMAIL!;
  const password = process.env.ESKIZ_PASSWORD!;

  const fd = new FormData();
  fd.append('email',    email);
  fd.append('password', password);

  const res  = await fetch('https://notify.eskiz.uz/api/auth/login', { method: 'POST', body: fd });
  const json = await res.json();

  if (!json.data?.token) {
    throw new Error(`Eskiz token xatolik: ${JSON.stringify(json)}`);
  }

  _tokenCache = { token: json.data.token, ts: now };
  return json.data.token;
}

async function doSend(token: string, phone: string, message: string) {
  const fd = new FormData();
  fd.append('mobile_phone', phone);
  fd.append('message',      message);
  fd.append('from',         '4546');
  fd.append('callback_url', '');

  const res  = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}` },
    body:    fd,
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return NextResponse.json({ error: 'phone va message majburiy' }, { status: 400 });
    }

    // ── Raqamni Eskiz formatiga o'tkazish: 998XXXXXXXXX ─────────────────────
    const digits      = String(phone).replace(/\D/g, '');
    const eskizPhone  = digits.startsWith('998') ? digits : `998${digits.slice(-9)}`;

    if (eskizPhone.length !== 12) {
      return NextResponse.json({ error: `Noto'g'ri telefon raqami: ${phone}` }, { status: 400 });
    }

    // ── Dev rejimi (token yo'q bo'lsa faqat log) ─────────────────────────────
    if (!process.env.ESKIZ_EMAIL || !process.env.ESKIZ_PASSWORD) {
      return NextResponse.json({ success: true, dev: true });
    }

    // ── Birinchi urinish ─────────────────────────────────────────────────────
    let token = await getEskizToken();
    let data  = await doSend(token, eskizPhone, message);

    // Token muddati o'tgan bo'lsa — cache tozalab qayta urinish
    if (data.status === 'error' || data.message?.toLowerCase().includes('token')) {
      _tokenCache = null;
      token = await getEskizToken();
      data  = await doSend(token, eskizPhone, message);
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('❌ SMS API xatolik:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
