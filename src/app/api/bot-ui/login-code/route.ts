import { NextRequest, NextResponse } from 'next/server';
import { issueLoginCode } from '@/lib/botLoginCode';
import { findWorkerByPhone, isActiveWorker } from '@/lib/botWorker';
import { readJsonObject } from '@/lib/routeGuard';

export const dynamic = 'force-dynamic';

// Javob doim bir xil: raqam tizimda bor-yo'qligini bu yerdan bilib bo'lmaydi.
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonObject(request);
    const worker = await findWorkerByPhone(typeof body?.phone === 'string' ? body.phone : '');
    if (worker?.telegram && isActiveWorker(worker)) {
      await issueLoginCode(worker.id, worker.telegram);
    }
  } catch (err) {
    console.error('bot-ui login-code error:', err);
  }
  return NextResponse.json({ ok: true });
}
