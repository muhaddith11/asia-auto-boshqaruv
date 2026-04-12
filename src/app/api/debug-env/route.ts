import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN || 'missing';
  return NextResponse.json({
    hasToken: token !== 'missing',
    tokenPrefix: token.substring(0, 5),
    nodeEnv: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
}
