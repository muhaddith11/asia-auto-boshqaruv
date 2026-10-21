import { timingSafeEqual } from 'crypto';
import { Telegraf } from 'telegraf';
import supabase from '@/lib/supabaseClient';
import {
  buildDayView,
  lateArrivalText,
  normalizeHM,
  summaryText,
  tashkentDay,
  tashkentHM,
  type DayLite,
  type DayView,
} from '@/lib/attendance';

// Davomat — bazaga yozish/o'qish va boshliqqa Telegram xabari.
// Sof hisob-kitob attendance.ts da (vitest bilan tekshiriladi).

export interface AttendanceSettings {
  work_start: string; // 'HH:MM'
  report_time: string; // 'HH:MM'
  notify: boolean;
  scanner_key: string;
}

export async function getSettings(): Promise<AttendanceSettings | null> {
  const { data, error } = await supabase
    .from('attendance_settings')
    .select('work_start, report_time, notify, scanner_key')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    work_start: normalizeHM(data.work_start, '09:00'),
    report_time: normalizeHM(data.report_time, '09:30'),
    notify: !!data.notify,
    scanner_key: data.scanner_key,
  };
}

export function scannerKeyMatches(given: string | null, expected: string): boolean {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Skaner yuborgan "hozir tarmoqda" ro'yxatini yozadi.
export async function ingestScan(devices: { mac: string; ip: string | null }[], now: Date) {
  const nowIso = now.toISOString();
  const day = tashkentDay(now);

  // Kun qatori: birinchi skan vaqti saqlanadi, oxirgisi yangilanadi.
  await supabase
    .from('attendance_days')
    .upsert({ day, scanner_first: nowIso, scanner_last: nowIso }, { onConflict: 'day', ignoreDuplicates: true });
  await supabase.from('attendance_days').update({ scanner_last: nowIso }).eq('day', day);

  if (devices.length === 0) return { day, seen: 0 };

  // first_seen/worker_id/ignored yuborilmaydi — yangi qurilmada default, eskisida o'zgarmaydi.
  const { error: devErr } = await supabase
    .from('wifi_devices')
    .upsert(devices.map((d) => ({ mac: d.mac, ip: d.ip, last_seen: nowIso })), { onConflict: 'mac' });
  if (devErr) throw devErr;

  const macs = devices.map((d) => d.mac);
  const { error: presErr } = await supabase
    .from('wifi_presence')
    .upsert(
      macs.map((mac) => ({ mac, day, first_seen: nowIso, last_seen: nowIso })),
      { onConflict: 'mac,day', ignoreDuplicates: true },
    );
  if (presErr) throw presErr;
  const { error: updErr } = await supabase
    .from('wifi_presence')
    .update({ last_seen: nowIso })
    .eq('day', day)
    .in('mac', macs);
  if (updErr) throw updErr;

  return { day, seen: devices.length };
}

export async function loadDayView(
  day: string,
  workStart: string,
): Promise<{ view: DayView; dayRow: DayLite | null }> {
  const [workersRes, devicesRes, presenceRes, dayRes] = await Promise.all([
    supabase.from('workers').select('id, ism').eq('status', 'aktiv'),
    supabase.from('wifi_devices').select('mac, worker_id').not('worker_id', 'is', null),
    supabase.from('wifi_presence').select('mac, first_seen, last_seen').eq('day', day),
    supabase
      .from('attendance_days')
      .select('scanner_first, scanner_last, report_sent_at, late_notified')
      .eq('day', day)
      .maybeSingle(),
  ]);
  for (const r of [workersRes, devicesRes, presenceRes, dayRes]) if (r.error) throw r.error;

  const dayRow = (dayRes.data as DayLite | null) ?? null;
  const view = buildDayView({
    day,
    workStart,
    workers: (workersRes.data || []).map((w: any) => ({ id: Number(w.id), ism: String(w.ism || '') })),
    devices: (devicesRes.data || []).map((d: any) => ({ mac: d.mac, worker_id: Number(d.worker_id) })),
    presence: presenceRes.data || [],
    dayRow,
  });
  return { view, dayRow };
}

// Boshliq (is_boss) + admin (ADMIN_TELEGRAM_ID) — chek xabarlari kabi.
async function sendToBoss(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('Davomat: TELEGRAM_BOT_TOKEN yo\'q — xabar yuborilmadi');
    return;
  }
  const targets = new Set<string>();
  if (process.env.ADMIN_TELEGRAM_ID) targets.add(String(process.env.ADMIN_TELEGRAM_ID));
  const { data: bosses } = await supabase.from('workers').select('telegram').eq('is_boss', true);
  for (const b of bosses || []) if (b.telegram) targets.add(String(b.telegram));

  const bot = new Telegraf(token);
  for (const t of targets) {
    try {
      await bot.telegram.sendMessage(t, text);
    } catch (e) {
      console.warn('Davomat xabari ketmadi:', t, e);
    }
  }
}

// Har skandan keyin chaqiriladi: vaqti kelgan bo'lsa kunlik hisobot, undan
// keyin kelganlar uchun alohida "keldi" xabari. Har biri bir marta ketadi.
export async function maybeNotify(settings: AttendanceSettings, now: Date) {
  if (!settings.notify) return;
  const nowIso = now.toISOString();
  const day = tashkentDay(now);
  const { view, dayRow } = await loadDayView(day, settings.work_start);
  if (!dayRow || view.rows.length === 0) return; // hech kimning telefoni bog'lanmagan

  if (!dayRow.report_sent_at) {
    if (tashkentHM(now) < settings.report_time) return;
    // Faqat shu so'rov "egallasa" yuboradi — ikki marta ketmasin.
    const { data: claimed } = await supabase
      .from('attendance_days')
      .update({ report_sent_at: nowIso })
      .eq('day', day)
      .is('report_sent_at', null)
      .select('day');
    if (!claimed?.length) return;
    await sendToBoss(summaryText(view, nowIso));
    return;
  }

  const notified = new Set((dayRow.late_notified || []).map(Number));
  const fresh = view.present.filter(
    (r) => !notified.has(r.workerId) && r.arrivedAt! > dayRow.report_sent_at!,
  );
  if (fresh.length === 0) return;
  const { error } = await supabase
    .from('attendance_days')
    .update({ late_notified: [...notified, ...fresh.map((r) => r.workerId)] })
    .eq('day', day);
  if (error) throw error;
  await sendToBoss(lateArrivalText(fresh, settings.work_start));
}
