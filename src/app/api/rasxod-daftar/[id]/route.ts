import { NextRequest, NextResponse, after } from 'next/server';
import { logAudit } from '@/lib/audit';
import { errorMessage, parseIdParam, readJsonObject, requireSection } from '@/lib/routeGuard';
import { parseCarInput } from '@/lib/rasxodDaftar';
import { NotFoundError, deleteCar, updateCar } from '@/lib/rasxodDaftarRepo';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

// Mashina ma'lumotlarini tahrirlash (rasxod qatorlariga tegmaydi).
export async function PATCH(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const id = parseIdParam((await context.params).id);
  if (!id) return NextResponse.json({ error: "Noto'g'ri mashina ID" }, { status: 400 });
  const body = await readJsonObject(request);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  const patch = parseCarInput(body, { partial: true });
  if (!patch.ok) return NextResponse.json({ error: patch.error }, { status: 400 });

  try {
    return NextResponse.json({ car: await updateCar(id, patch.value) });
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : 500;
    return NextResponse.json({ error: errorMessage(err, 'Mashina saqlanmadi') }, { status });
  }
}

// Mashina va uning barcha rasxod qatorlari o'chadi.
export async function DELETE(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const id = parseIdParam((await context.params).id);
  if (!id) return NextResponse.json({ error: "Noto'g'ri mashina ID" }, { status: 400 });

  try {
    const deleted = await deleteCar(id);
    after(() =>
      logAudit({
        req: request,
        action: 'delete',
        entity: 'rasxod_daftar',
        entityId: id,
        details: { mashina: deleted.mashina, raqam: deleted.raqam },
      })
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : 500;
    return NextResponse.json({ error: errorMessage(err, "Mashina o'chirilmadi") }, { status });
  }
}
