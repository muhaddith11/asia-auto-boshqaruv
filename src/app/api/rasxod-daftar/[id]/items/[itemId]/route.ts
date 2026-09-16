import { NextRequest, NextResponse, after } from 'next/server';
import { logAudit } from '@/lib/audit';
import { errorMessage, parseIdParam, readJsonObject, requireSection } from '@/lib/routeGuard';
import { parseItemInput, tashkentDate } from '@/lib/rasxodDaftar';
import { NotFoundError, deleteItem, updateItem } from '@/lib/rasxodDaftarRepo';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string; itemId: string }> };

async function ids(context: Context) {
  const { id, itemId } = await context.params;
  return { carId: parseIdParam(id), itemId: parseIdParam(itemId) };
}

// Rasxod qatorini tahrirlash: nom / summa / sana. To'lov holati — /tulov orqali.
export async function PATCH(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const { carId, itemId } = await ids(context);
  if (!carId || !itemId) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  const body = await readJsonObject(request);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  const patch = parseItemInput(body, tashkentDate(), { partial: true });
  if (!patch.ok) return NextResponse.json({ error: patch.error }, { status: 400 });

  try {
    const item = await updateItem(carId, itemId, patch.value);
    after(() =>
      logAudit({ req: request, action: 'update', entity: 'rasxod_daftar_item', entityId: itemId, details: { carId, ...patch.value } })
    );
    return NextResponse.json({ item });
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : 500;
    return NextResponse.json({ error: errorMessage(err, 'Rasxod saqlanmadi') }, { status });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const { carId, itemId } = await ids(context);
  if (!carId || !itemId) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  try {
    const deleted = await deleteItem(carId, itemId);
    after(() =>
      logAudit({
        req: request,
        action: 'delete',
        entity: 'rasxod_daftar_item',
        entityId: itemId,
        details: { carId, nom: deleted.nom, summa: deleted.summa, tulandi: deleted.tulandi },
      })
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : 500;
    return NextResponse.json({ error: errorMessage(err, "Rasxod o'chirilmadi") }, { status });
  }
}
