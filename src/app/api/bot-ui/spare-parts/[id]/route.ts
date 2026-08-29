import { NextRequest, NextResponse } from 'next/server';
import { identifyBoss } from '@/lib/botWorker';
import { updateSparePart, deleteSparePart } from '@/lib/sparePartsRepo';

export const dynamic = 'force-dynamic';

// Tahrirlash — identifikatsiya body ichida (workerPhone / mechanicChatId).
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const body = await request.json();
    const boss = await identifyBoss(body.workerPhone, body.mechanicChatId);
    if (!boss) return NextResponse.json({ ok: false, error: "Ruxsat yo'q (faqat boshliq)" }, { status: 403 });
    const part = await updateSparePart(id, body);
    return NextResponse.json({ ok: true, part });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server xatosi' }, { status: 500 });
  }
}

// O'chirish — identifikatsiya query orqali (?phone= & tg=). DELETE tanasi ba'zi
// muhitlarda tashlanadi, shuning uchun query ishonchliroq.
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const { searchParams } = new URL(request.url);
    const boss = await identifyBoss(searchParams.get('phone'), searchParams.get('tg'));
    if (!boss) return NextResponse.json({ ok: false, error: "Ruxsat yo'q (faqat boshliq)" }, { status: 403 });
    const deleted = await deleteSparePart(id);
    return NextResponse.json({ ok: true, deleted });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server xatosi' }, { status: 500 });
  }
}
