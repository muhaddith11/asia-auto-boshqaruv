import { NextRequest, NextResponse, after } from 'next/server';
import { logAudit } from '@/lib/audit';
import { errorMessage, parseIdParam, readJsonObject, requireSection } from '@/lib/routeGuard';
import { parseSumma } from '@/lib/rasxodDaftar';
import { NotFoundError, ValidationError, addPartialPayment, resetPartialPayment } from '@/lib/rasxodDaftarRepo';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string; itemId: string }> };

async function ids(context: Context) {
  const { id, itemId } = await context.params;
  return { carId: parseIdParam(id), itemId: parseIdParam(itemId) };
}

// Qisman to'lov: mijoz shu rasxodning bir qismini qaytardi — { summa }.
// Qoldiq nolga tushsa qator avtomatik "tulandi" bo'ladi. Kassaga tegmaydi.
export async function POST(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const { carId, itemId } = await ids(context);
  if (!carId || !itemId) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  const body = await readJsonObject(request);
  const summa = body ? parseSumma(body.summa) : null;
  if (summa === null) return NextResponse.json({ error: "To'lov summasini to'g'ri kiriting" }, { status: 400 });

  try {
    const item = await addPartialPayment(carId, itemId, summa);
    after(() =>
      logAudit({
        req: request,
        action: 'payment',
        entity: 'rasxod_daftar_item',
        entityId: itemId,
        details: { carId, summa, tulandi: item.tulandi, tulanganSumma: item.tulangan_summa },
      })
    );
    return NextResponse.json({ item });
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : err instanceof ValidationError ? 400 : 500;
    return NextResponse.json({ error: errorMessage(err, "To'lov saqlanmadi") }, { status });
  }
}

// Qisman to'lovni bekor qilish — qator yana "hech narsa qaytmagan" holatiga qaytadi.
export async function DELETE(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const { carId, itemId } = await ids(context);
  if (!carId || !itemId) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  try {
    const item = await resetPartialPayment(carId, itemId);
    after(() =>
      logAudit({ req: request, action: 'payment', entity: 'rasxod_daftar_item', entityId: itemId, details: { carId, bekor: true } })
    );
    return NextResponse.json({ item });
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : 500;
    return NextResponse.json({ error: errorMessage(err, "Bekor qilinmadi") }, { status });
  }
}
