import { NextRequest, NextResponse } from 'next/server';
import { normalizeMac } from '@/lib/attendance';
import { getSettings, ingestScan, maybeNotify, scannerKeyMatches } from '@/lib/attendanceRepo';
import { readJsonObject } from '@/lib/routeGuard';

export const dynamic = 'force-dynamic';

// Ishxona tarmog'idagi skaner (davomat-skaner/skaner.ps1) har daqiqada shu
// yerga "hozir WiFi'da turgan qurilmalar" ro'yxatini yuboradi. Cookie yo'q —
// proxy.ts da ochiq, o'rniga attendance_settings.scanner_key tekshiriladi.
export async function POST(req: NextRequest) {
  try {
    const settings = await getSettings();
    if (!settings || !scannerKeyMatches(req.headers.get('x-scanner-key'), settings.scanner_key)) {
      return NextResponse.json({ ok: false, error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await readJsonObject(req);
    const list = Array.isArray(body?.devices) ? body.devices : null;
    if (!list || list.length > 1024) {
      return NextResponse.json({ ok: false, error: "Ma'lumot noto'g'ri" }, { status: 400 });
    }

    const byMac = new Map<string, { mac: string; ip: string | null }>();
    for (const d of list as any[]) {
      const mac = normalizeMac(d?.mac);
      if (!mac) continue;
      const ip = typeof d?.ip === 'string' && /^[\d.]{7,15}$/.test(d.ip) ? d.ip : null;
      byMac.set(mac, { mac, ip });
    }

    const now = new Date();
    const result = await ingestScan([...byMac.values()], now);

    // Xabar yuborilmasa ham skan yozilgan bo'lsin.
    try {
      await maybeNotify(settings, now);
    } catch (e) {
      console.error('Davomat xabari xatosi:', e);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('attendance scan xatosi:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
