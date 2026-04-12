import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tests = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Telegram Bot API', url: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe` },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const start = Date.now();
      const res = await fetch(test.url, { method: 'GET', signal: AbortSignal.timeout(5000) });
      const duration = Date.now() - start;
      const data = await res.json().catch(() => 'no-json');
      results.push({
        name: test.name,
        ok: res.ok,
        status: res.status,
        duration: `${duration}ms`,
        data: data
      });
    } catch (err: any) {
      results.push({
        name: test.name,
        ok: false,
        error: err.message || String(err)
      });
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results: results,
    explanation: "If Telegram API fails with timeout but Google works, then Hostinger blocks Telegram specifically."
  });
}
