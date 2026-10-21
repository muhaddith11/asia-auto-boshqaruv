import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { normalizeMac } from '@/lib/attendance';
import { readJsonObject, requireSection } from '@/lib/routeGuard';

export const dynamic = 'force-dynamic';

// Qurilmani xodimga bog'lash / uzish yoki "e'tiborsiz" (printer, TV) qilish.
export async function PATCH(req: NextRequest) {
  const guard = await requireSection(req, 'workers');
  if (guard.denied) return guard.denied;

  const body = await readJsonObject(req);
  const mac = normalizeMac(body?.mac);
  if (!mac) return NextResponse.json({ ok: false, error: "Qurilma noto'g'ri" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if ('worker_id' in (body || {})) {
    const id = body!.worker_id;
    if (id !== null && !(Number.isSafeInteger(id) && (id as number) > 0)) {
      return NextResponse.json({ ok: false, error: "Xodim noto'g'ri" }, { status: 400 });
    }
    patch.worker_id = id;
    if (id !== null) patch.ignored = false;
  }
  if (typeof body?.ignored === 'boolean') {
    patch.ignored = body.ignored;
    if (body.ignored) patch.worker_id = null;
  }
  if (typeof body?.label === 'string') patch.label = body.label.trim().slice(0, 60) || null;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "O'zgarish yo'q" }, { status: 400 });
  }

  const { data, error } = await supabase.from('wifi_devices').update(patch).eq('mac', mac).select('mac');
  if (error) {
    console.error('attendance device xatosi:', error);
    return NextResponse.json({ ok: false, error: 'Saqlashda xatolik' }, { status: 500 });
  }
  if (!data?.length) return NextResponse.json({ ok: false, error: 'Qurilma topilmadi' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
