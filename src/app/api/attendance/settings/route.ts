import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { readJsonObject, requireSection } from '@/lib/routeGuard';

export const dynamic = 'force-dynamic';

const HM = /^([01]\d|2[0-3]):[0-5]\d$/;

// Ish boshlanishi, hisobot vaqti va boshliqqa yuborish yoqilganmi.
export async function PATCH(req: NextRequest) {
  const guard = await requireSection(req, 'workers');
  if (guard.denied) return guard.denied;

  const body = await readJsonObject(req);
  const patch: Record<string, unknown> = {};
  for (const key of ['work_start', 'report_time'] as const) {
    if (body?.[key] === undefined) continue;
    if (typeof body[key] !== 'string' || !HM.test(body[key] as string)) {
      return NextResponse.json({ ok: false, error: "Vaqt noto'g'ri (SS:DD)" }, { status: 400 });
    }
    patch[key] = body[key];
  }
  if (typeof body?.notify === 'boolean') patch.notify = body.notify;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "O'zgarish yo'q" }, { status: 400 });
  }

  const { error } = await supabase.from('attendance_settings').update(patch).eq('id', 1);
  if (error) {
    console.error('attendance settings xatosi:', error);
    return NextResponse.json({ ok: false, error: 'Saqlashda xatolik' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
