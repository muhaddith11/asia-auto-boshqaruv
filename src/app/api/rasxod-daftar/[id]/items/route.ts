import { NextRequest, NextResponse, after } from 'next/server';
import { logAudit } from '@/lib/audit';
import { errorMessage, parseIdParam, readJsonObject, requireSection } from '@/lib/routeGuard';
import { parseItemsInput, tashkentDate } from '@/lib/rasxodDaftar';
import { NotFoundError, addItems } from '@/lib/rasxodDaftarRepo';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

// Mashinaga rasxod qo'shish: { nom, summa, sana } yoki { items: [...] }. Kassaga tegmaydi.
export async function POST(request: NextRequest, context: Context) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const carId = parseIdParam((await context.params).id);
  if (!carId) return NextResponse.json({ error: "Noto'g'ri mashina ID" }, { status: 400 });
  const body = await readJsonObject(request);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const parsed = parseItemsInput(Array.isArray(body.items) ? body.items : [body], tashkentDate());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (parsed.value.length === 0) return NextResponse.json({ error: "Rasxod kiritilmadi" }, { status: 400 });

  try {
    const items = await addItems(carId, parsed.value);
    after(() =>
      logAudit({
        req: request,
        action: 'create',
        entity: 'rasxod_daftar_item',
        entityId: carId,
        details: { rasxodlar: items.map((i) => ({ id: i.id, nom: i.nom, summa: i.summa, sana: i.sana })) },
      })
    );
    return NextResponse.json({ items }, { status: 201 });
  } catch (err) {
    const status = err instanceof NotFoundError ? 404 : 500;
    return NextResponse.json({ error: errorMessage(err, 'Rasxod saqlanmadi') }, { status });
  }
}
