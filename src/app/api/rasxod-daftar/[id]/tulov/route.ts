import { NextRequest, NextResponse, after } from 'next/server';
import { logAudit } from '@/lib/audit';
import { errorMessage, parseIdParam, readJsonObject, requireSection } from '@/lib/routeGuard';
import { setTulov } from '@/lib/rasxodDaftarRepo';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

// Mijoz rasxod pulini qaytardi: { tulandi: true, itemIds?: number[] }.
// itemIds berilmasa — mashinaning barcha qatorlari. tulandi:false — xato
// belgilanganini qaytarish. Faqat daftar belgisi: KASSAGA pul qo'shilmaydi.
export async function POST(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const carId = parseIdParam((await context.params).id);
  if (!carId) return NextResponse.json({ error: "Noto'g'ri mashina ID" }, { status: 400 });
  const body = await readJsonObject(request);
  if (!body || typeof body.tulandi !== 'boolean') {
    return NextResponse.json({ error: "tulandi (true/false) yuborilishi kerak" }, { status: 400 });
  }

  let itemIds: number[] | undefined;
  if (body.itemIds !== undefined) {
    const raw = Array.isArray(body.itemIds) ? body.itemIds : [];
    itemIds = raw.map((v) => parseIdParam(String(v))).filter((v): v is number => v !== null);
    if (itemIds.length === 0 || itemIds.length !== raw.length) {
      return NextResponse.json({ error: "Rasxod qatorlari noto'g'ri tanlangan" }, { status: 400 });
    }
  }

  const tulandi = body.tulandi;
  try {
    const items = await setTulov(carId, tulandi, itemIds);
    if (items.length > 0) {
      after(() =>
        logAudit({
          req: request,
          action: 'payment',
          entity: 'rasxod_daftar',
          entityId: carId,
          details: {
            tulandi,
            summa: items.reduce((sum, i) => sum + i.summa, 0),
            rasxodlar: items.map((i) => ({ id: i.id, nom: i.nom, summa: i.summa })),
          },
        })
      );
    }
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err, "To'lov holati saqlanmadi") }, { status: 500 });
  }
}
