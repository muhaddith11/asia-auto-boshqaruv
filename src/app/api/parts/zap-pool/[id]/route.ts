import { NextRequest, NextResponse, after } from 'next/server';
import { logAudit } from '@/lib/audit';
import { errorMessage, parseIdParam, requireSection } from '@/lib/routeGuard';
import { deleteZapPoolChiqim } from '@/lib/zapPoolRepo';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

// Xato kiritilgan chiqimni o'chirish — summa bannerdagi qoldiqqa qaytadi.
// Kassaga tegmaydi (bu pul kassada bo'lmagan).
export async function DELETE(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const id = parseIdParam((await context.params).id);
  if (!id) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  try {
    const deleted = await deleteZapPoolChiqim(id);
    if (!deleted) return NextResponse.json({ error: 'Chiqim topilmadi' }, { status: 404 });
    after(() =>
      logAudit({
        req: request,
        action: 'delete',
        entity: 'zap_puli_chiqim',
        entityId: id,
        details: { summa: deleted.summa, izoh: deleted.izoh },
      })
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err, "Chiqim o'chirilmadi") }, { status: 500 });
  }
}
