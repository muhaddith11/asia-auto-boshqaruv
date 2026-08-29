import { NextRequest, NextResponse } from 'next/server';
import { identifyBoss } from '@/lib/botWorker';
import { listSpareParts, createSparePart } from '@/lib/sparePartsRepo';

export const dynamic = 'force-dynamic';

// Zapchast katalogi — faqat BOSHLIQ (is_boss) uchun. Bot-ui public endpoint
// bo'lgani uchun kirish telefon/tg orqali tekshiriladi.

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const boss = await identifyBoss(searchParams.get('phone'), searchParams.get('tg'));
    if (!boss) return NextResponse.json({ ok: false, error: "Ruxsat yo'q (faqat boshliq)" }, { status: 403 });
    const parts = await listSpareParts();
    return NextResponse.json({ ok: true, parts });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const boss = await identifyBoss(body.workerPhone, body.mechanicChatId);
    if (!boss) return NextResponse.json({ ok: false, error: "Ruxsat yo'q (faqat boshliq)" }, { status: 403 });
    if (!String(body.nom || '').trim() && !String(body.artikul || '').trim()) {
      return NextResponse.json({ ok: false, error: 'Nom yoki detal nomeri kerak' }, { status: 400 });
    }
    const part = await createSparePart(body);
    return NextResponse.json({ ok: true, part }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server xatosi' }, { status: 500 });
  }
}
