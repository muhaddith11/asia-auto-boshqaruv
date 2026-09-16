import { NextRequest, NextResponse, after } from 'next/server';
import { logAudit } from '@/lib/audit';
import { errorMessage, readJsonObject, requireSection } from '@/lib/routeGuard';
import { parseCarInput, parseItemsInput, tashkentDate, type CarInput } from '@/lib/rasxodDaftar';
import { createCar, listCars } from '@/lib/rasxodDaftarRepo';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────
// Rasxod daftari (/reports/rasxod) — mashinaga qilingan, kassadan AYIRILMAGAN
// rasxodlar. Bu route'lar kassa/operations'ga umuman tegmaydi.
// Kirish: hisobotlar bo'limiga ruxsati bor rollar (egasi, boshliq, sherik).
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;
  try {
    return NextResponse.json({ cars: await listCars() });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err, "Rasxod daftarini yuklab bo'lmadi") }, { status: 500 });
  }
}

// Yangi mashina + (ixtiyoriy) birinchi rasxodlari: { mashina, raqam, mijoz, tel, izoh, items: [{ nom, summa, sana }] }
export async function POST(request: NextRequest) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const body = await readJsonObject(request);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const car = parseCarInput(body);
  if (!car.ok) return NextResponse.json({ error: car.error }, { status: 400 });
  const items = parseItemsInput(body.items, tashkentDate());
  if (!items.ok) return NextResponse.json({ error: items.error }, { status: 400 });

  try {
    const created = await createCar(car.value as CarInput, items.value);
    after(() =>
      logAudit({
        req: request,
        action: 'create',
        entity: 'rasxod_daftar',
        entityId: created.id,
        details: {
          mashina: created.mashina,
          raqam: created.raqam,
          rasxodlar: created.items.map((i) => ({ nom: i.nom, summa: i.summa })),
        },
      })
    );
    return NextResponse.json({ car: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err, 'Mashina saqlanmadi') }, { status: 500 });
  }
}
