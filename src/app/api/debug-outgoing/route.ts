import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tests = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Telegram Bot API', url: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe` },
    { name: 'Supabase API', url: `${process.env.SUPABASE_URL}/rest/v1/` },
  ];

  const results = [];

  // DNS Test
  try {
    const dns = await import('dns');
    const hostname = new URL(process.env.SUPABASE_URL || '').hostname;
    const { address } = await dns.promises.lookup(hostname);
    results.push({ name: 'DNS Lookup (Supabase)', ok: true, address: address });
  } catch (err: any) {
    results.push({ name: 'DNS Lookup (Supabase)', ok: false, error: err.message });
  }

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

  // Database Row Test
  try {
    const { default: supabase } = await import('@/lib/supabaseClient');
    const { count, error: countError } = await supabase.from('workers').select('*', { count: 'exact', head: true });
    const { data: firstRow, error: rowError } = await supabase.from('workers').select('*').limit(1).maybeSingle();
    
    results.push({
      name: 'Supabase Data Test',
      ok: !countError && !rowError,
      workerCount: count,
      firstWorkerFound: !!firstRow,
      error: (countError?.message || rowError?.message) || null
    });
  } catch (err: any) {
    results.push({ name: 'Supabase Data Test', ok: false, error: err.message });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results: results,
    explanation: "If DNS is OK but fetch fails, firewall exists. If fetch is OK but Data Test has 0 count or error, check RLS policies in Supabase."
  });
}
