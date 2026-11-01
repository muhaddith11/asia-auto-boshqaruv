import { NextRequest, NextResponse } from 'next/server';
import { createBotToken } from '@/lib/botAuth';
import { consumeLoginCode } from '@/lib/botLoginCode';
import { findWorkerByPhone, findWorkerByTelegram, isActiveWorker, type BotWorker } from '@/lib/botWorker';
import { readJsonObject } from '@/lib/routeGuard';
import { verifyTelegramInitData } from '@/lib/telegramAuth';

export const dynamic = 'force-dynamic';

async function workerSession(worker: BotWorker) {
  return NextResponse.json({
    ok: true,
    token: await createBotToken(worker.id),
    worker: { id: worker.id, ism: worker.ism, tel: worker.tel },
  });
}

// Bot-ui token beradigan yagona joy. Kirish: { initData } (Telegram ichida)
// yoki { phone, code } (brauzerda, kod /api/bot-ui/login-code orqali keladi).
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ ok: false, error: "Noto'g'ri so'rov" }, { status: 400 });

    const initData = typeof body.initData === 'string' ? body.initData : '';
    if (initData) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const tgUser = botToken ? verifyTelegramInitData(initData, botToken) : null;
      if (!tgUser) {
        return NextResponse.json({ ok: false, error: "Telegram tasdig'idan o'tmadi." }, { status: 401 });
      }
      const worker = await findWorkerByTelegram(tgUser.id);
      if (!worker || !isActiveWorker(worker)) {
        return NextResponse.json(
          { ok: false, code: 'not_linked', error: 'Raqamingiz tasdiqlanmagan. Botga /start yozing va raqamingizni yuboring.' },
          { status: 403 },
        );
      }
      return workerSession(worker);
    }

    const phone = typeof body.phone === 'string' ? body.phone : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!phone || !code) {
      return NextResponse.json({ ok: false, error: "Raqam va kodni kiriting." }, { status: 400 });
    }
    const worker = await findWorkerByPhone(phone);
    if (!worker || !isActiveWorker(worker) || !(await consumeLoginCode(worker.id, code))) {
      return NextResponse.json({ ok: false, error: "Kod noto'g'ri yoki muddati o'tgan." }, { status: 401 });
    }
    return workerSession(worker);
  } catch (err) {
    console.error('bot-ui session error:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
