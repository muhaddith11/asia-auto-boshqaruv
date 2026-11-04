import { NextRequest, NextResponse, after } from 'next/server';
import { logAudit } from '@/lib/audit';
import { errorMessage, parseIdParam, requireSection } from '@/lib/routeGuard';
import { NotFoundError, ValidationError, undoWriteOff, writeOffToIshxona } from '@/lib/rasxodDaftarRepo';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string; itemId: string }> };

async function ids(context: Context) {
  const { id, itemId } = await context.params;
  return { carId: parseIdParam(id), itemId: parseIdParam(itemId) };
}

const statusOf = (err: unknown) => (err instanceof NotFoundError ? 404 : err instanceof ValidationError ? 400 : 500);

// "Ishxonaga": mijoz qaytarmaydigan rasxodning qoldig'i 'Ishxona' chiqimi bo'lib
// yoziladi va naqd kassadan ayiriladi. Daftarning kassaga tegadigan yagona amali.
export async function POST(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const { carId, itemId } = await ids(context);
  if (!carId || !itemId) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  try {
    const { item, opId, amount } = await writeOffToIshxona(carId, itemId);
    after(() =>
      logAudit({
        req: request,
        action: 'create',
        entity: 'operation',
        entityId: opId,
        details: { type: 'expense', amount, category: 'Ishxona', method: 'naqd', manba: 'rasxod_daftar', carId, itemId },
      })
    );
    return NextResponse.json({ item, amount });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err, 'Ishxonaga yozilmadi') }, { status: statusOf(err) });
  }
}

// Adashib bosilgan bo'lsa: chiqim o'chadi, pul naqd kassaga qaytadi, rasxod yana ochiq.
export async function DELETE(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const { carId, itemId } = await ids(context);
  if (!carId || !itemId) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  try {
    const { item, opId, amount } = await undoWriteOff(carId, itemId);
    after(() =>
      logAudit({
        req: request,
        action: 'delete',
        entity: 'operation',
        entityId: opId,
        details: { type: 'expense', amount, category: 'Ishxona', method: 'naqd', manba: 'rasxod_daftar', carId, itemId },
      })
    );
    return NextResponse.json({ item, amount });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err, 'Qaytarilmadi') }, { status: statusOf(err) });
  }
}
