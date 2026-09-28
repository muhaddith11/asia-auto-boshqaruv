import { NextRequest, NextResponse, after } from 'next/server';
import { logAudit } from '@/lib/audit';
import { errorMessage, readJsonObject, requireSection } from '@/lib/routeGuard';
import { tashkentDate } from '@/lib/rasxodDaftar';
import { parseChiqimInput } from '@/lib/zapPool';
import { createZapPoolChiqim, listZapPoolChiqim } from '@/lib/zapPoolRepo';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────
// "Kassaga tushmagan zapchast puli"dan ayirilgan summalar (Ehtiyot qismlar
// sahifasidagi banner). KASSAGA TEGMAYDI — bu pul kassada bo'lmagan.
//
// O'qish: zapchastlar bo'limini ko'radigan hamma (banner ham shu yerda).
// Yozish/o'chirish: moliyaviy amal — faqat hisobotlar bo'limiga ruxsati bor
// rollar (egasi, boshliq, sherik).
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { denied } = await requireSection(request, 'parts');
  if (denied) return denied;
  try {
    return NextResponse.json({ rows: await listZapPoolChiqim() });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err, "Zapchast puli chiqimlarini yuklab bo'lmadi") }, { status: 500 });
  }
}

// { summa, izoh }
export async function POST(request: NextRequest) {
  const { denied } = await requireSection(request, 'reports');
  if (denied) return denied;

  const body = await readJsonObject(request);
  const parsed = parseChiqimInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const created = await createZapPoolChiqim(parsed.value, tashkentDate());
    after(() =>
      logAudit({
        req: request,
        action: 'create',
        entity: 'zap_puli_chiqim',
        entityId: created.id,
        details: { summa: created.summa, izoh: created.izoh },
      })
    );
    return NextResponse.json({ row: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err, 'Chiqim saqlanmadi') }, { status: 500 });
  }
}
