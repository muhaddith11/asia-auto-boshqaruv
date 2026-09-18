import { NextRequest, NextResponse } from 'next/server';
import { errorMessage, requireSection } from '@/lib/routeGuard';
import { listArchivedZaps } from '@/lib/zapArchiveRepo';

export const dynamic = 'force-dynamic';

// Zapchastlar hisoboti (/parts/reports) uchun: buyurtmadan olib tashlangan
// (yoki buyurtmasi o'chirilgan) zapchast qatorlari. Faqat o'qish — arxivga
// yozish buyurtma route'larida (/api/orders/[id]) avtomatik bajariladi.
export async function GET(request: NextRequest) {
  const { denied } = await requireSection(request, 'parts');
  if (denied) return denied;
  try {
    return NextResponse.json({ rows: await listArchivedZaps() });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err, "Zapchast arxivini yuklab bo'lmadi") }, { status: 500 });
  }
}
