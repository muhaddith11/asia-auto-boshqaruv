import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing in ENV' }, { status: 500 });
  }

  // Detect the current host from headers
  const host = req.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const webhookUrl = `${baseUrl}/tg-webhook`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
    const data = await response.json();

    return NextResponse.json({
      ok: data.ok,
      message: data.description || 'Webhook configuration attempted',
      configuredUrl: webhookUrl,
      raw: data
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err),
      attemptedUrl: webhookUrl
    }, { status: 500 });
  }
}
