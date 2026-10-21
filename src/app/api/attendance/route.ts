import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { summaryText, tashkentDay } from '@/lib/attendance';
import { getSettings, loadDayView } from '@/lib/attendanceRepo';
import { requireSection } from '@/lib/routeGuard';

export const dynamic = 'force-dynamic';

// Shu kundan eskiroq ko'ringan, hech kimga bog'lanmagan qurilmalar ro'yxatda turmaydi.
const DEVICE_LIST_DAYS = 14;

// Davomat sahifasi uchun hammasi bitta so'rovda: kun ko'rinishi, qurilmalar,
// sozlamalar va boshliqqa boradigan xabarning ko'rinishi.
export async function GET(req: NextRequest) {
  const guard = await requireSection(req, 'workers');
  if (guard.denied) return guard.denied;

  try {
    const qDay = req.nextUrl.searchParams.get('day');
    const day = qDay && /^\d{4}-\d{2}-\d{2}$/.test(qDay) ? qDay : tashkentDay();

    const settings = await getSettings();
    if (!settings) {
      return NextResponse.json({ ok: false, error: 'Davomat sozlamasi topilmadi (db/attendance.sql)' }, { status: 500 });
    }

    const since = new Date(Date.now() - DEVICE_LIST_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const [{ view, dayRow }, devicesRes, workersRes, lastScanRes] = await Promise.all([
      loadDayView(day, settings.work_start),
      supabase
        .from('wifi_devices')
        .select('mac, worker_id, ignored, label, ip, first_seen, last_seen')
        .or(`last_seen.gte.${since},worker_id.not.is.null`)
        .order('last_seen', { ascending: false }),
      supabase.from('workers').select('id, ism').eq('status', 'aktiv').order('ism'),
      supabase.from('attendance_days').select('scanner_last').order('day', { ascending: false }).limit(1).maybeSingle(),
    ]);
    for (const r of [devicesRes, workersRes, lastScanRes]) if (r.error) throw r.error;

    return NextResponse.json({
      ok: true,
      day,
      today: tashkentDay(),
      view,
      reportSentAt: dayRow?.report_sent_at ?? null,
      scannerLast: lastScanRes.data?.scanner_last ?? null,
      devices: devicesRes.data || [],
      workers: workersRes.data || [],
      settings,
      preview: view.rows.length ? summaryText(view, new Date().toISOString()) : null,
    });
  } catch (err) {
    console.error('attendance GET xatosi:', err);
    return NextResponse.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}
