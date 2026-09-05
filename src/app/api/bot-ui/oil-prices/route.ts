import { NextRequest, NextResponse } from 'next/server';
import { identifyBoss, identifyWorker } from '@/lib/botWorker';
import { normalizeBolim } from '@/lib/departments';
import { listOilPrices, createOilPrice } from '@/lib/oilPricesRepo';

export const dynamic = 'force-dynamic';

// Yog' narxlari (yog' / yog' filtri / salon filtri — narx VA tannarx).
// KO'RISH (GET): boshliq (hammasini) yoki yog' bo'limi xodimi (tanlash uchun).
// Ustaxona xodimiga ko'rinmaydi (aloqasiz).
// BOSHQARISH (POST/PUT/DELETE): faqat boshliq.

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const worker = await identifyWorker(searchParams.get('phone'), searchParams.get('tg'));
    if (!worker) return NextResponse.json({ ok: false, error: "Ruxsat yo'q" }, { status: 403 });
    if (!worker.is_boss && normalizeBolim(worker.bolim) !== 'yog') {
      return NextResponse.json({ ok: true, prices: [] });
    }
    const prices = await listOilPrices();
    return NextResponse.json({ ok: true, prices });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server xatosi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const boss = await identifyBoss(body.workerPhone, body.mechanicChatId);
    if (!boss) return NextResponse.json({ ok: false, error: "Ruxsat yo'q (faqat boshliq)" }, { status: 403 });
    const price = await createOilPrice(body);
    return NextResponse.json({ ok: true, price }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server xatosi' }, { status: 500 });
  }
}
