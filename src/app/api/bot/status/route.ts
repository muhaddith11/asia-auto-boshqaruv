import { NextResponse } from 'next/server';
import { startBotPolling, getPollingStatus } from '@/bot-poller';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const startPoller = process.env.START_POLLER;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const runtime = process.env.NEXT_RUNTIME;

  let botInfo = null;
  let botError = null;

  if (token) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      botInfo = await res.json();
    } catch (e: any) {
      botError = e.message;
    }
  }

  const pollingStatus = getPollingStatus();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      TELEGRAM_BOT_TOKEN: token ? '✅ Set (present)' : '❌ Missing',
      START_POLLER: startPoller === 'true' ? '✅ true' : `❌ ${startPoller} (must be 'true')`,
      NEXT_PUBLIC_SITE_URL: siteUrl || '⚠️ Missing (using fallback)',
      NEXT_RUNTIME: runtime || 'nodejs (default)'
    },
    bot: {
      connected: botInfo?.ok || false,
      info: botInfo?.result || null,
      error: botError
    },
    poller: {
      isStarted: pollingStatus.isStarted,
      lastUpdateId: pollingStatus.lastUpdateId,
      message: pollingStatus.isStarted ? '✅ Bot is polling' : '❌ Bot is NOT polling'
    },
    instruction: "Botni qo'lda yoqish uchun POST so'rov yuboring."
  });
}

export async function POST() {
  const startPoller = process.env.START_POLLER;
  
  if (startPoller !== 'true') {
     return NextResponse.json({ error: "START_POLLER env 'true' emas. Iltimos avval env-ni to'g'rilang." }, { status: 400 });
  }

  // Trigger start
  startBotPolling();

  return NextResponse.json({ 
    message: "Bot poller ishga tushirish buyrug'i yuborildi.",
    status: getPollingStatus()
  });
}
