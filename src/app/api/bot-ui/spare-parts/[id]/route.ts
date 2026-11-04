import { NextRequest, NextResponse } from 'next/server';
import { requireBotBoss } from '@/lib/botAuth';
import { updateSparePart, deleteSparePart } from '@/lib/sparePartsRepo';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const body = await request.json();
    const guard = await requireBotBoss(request);
    if (guard.denied) return guard.denied;
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
    const guard = await requireBotBoss(request);
    if (guard.denied) return guard.denied;
    const deleted = await deleteSparePart(id);
    return NextResponse.json({ ok: true, deleted });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server xatosi' }, { status: 500 });
  }
}
