import { NextRequest, NextResponse } from 'next/server';
import { findWorkerById, isActiveWorker, type BotWorker } from '@/lib/botWorker';
import { readToken, signToken } from '@/lib/session';

// ─────────────────────────────────────────────────────────────────────────────
// Bot-ui API'si uchun kirish tekshiruvi. Xodim imzolangan token bilan tanib
// olinadi (`x-bot-token` sarlavhasi). Token faqat /api/bot-ui/session orqali
// beriladi: Telegram imzosi yoki Telegram'ga yuborilgan kod bilan.
// So'rovdagi telefon raqami yoki Telegram ID endi hech narsani isbotlamaydi.
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_PURPOSE = 'bot';
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 kun

interface BotTokenPayload {
  worker_id: number;
  exp: number;
}

export type BotGuardResult = { worker: BotWorker; denied: null } | { worker: null; denied: NextResponse };

export function createBotToken(workerId: number): Promise<string> {
  const payload: BotTokenPayload = { worker_id: workerId, exp: Date.now() + TOKEN_MAX_AGE_MS };
  return signToken(payload, TOKEN_PURPOSE);
}

export async function requireBotWorker(request: NextRequest): Promise<BotGuardResult> {
  const payload = await readToken<BotTokenPayload>(request.headers.get('x-bot-token'), TOKEN_PURPOSE);
  const worker = payload ? await findWorkerById(payload.worker_id) : null;
  if (!worker || !isActiveWorker(worker)) {
    return { worker: null, denied: NextResponse.json({ ok: false, error: 'Qayta kiring.' }, { status: 401 }) };
  }
  return { worker, denied: null };
}

export async function requireBotBoss(request: NextRequest): Promise<BotGuardResult> {
  const guard = await requireBotWorker(request);
  if (guard.denied) return guard;
  if (!guard.worker.is_boss) {
    return { worker: null, denied: NextResponse.json({ ok: false, error: "Ruxsat yo'q (faqat boshliq)" }, { status: 403 }) };
  }
  return guard;
}
