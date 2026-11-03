import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { tekshirQolItem } from '@/lib/konteyner';

export const dynamic = 'force-dynamic';

const COLS = 'id, javon, nom, narx, soni, ogirlik, izoh, javon_tur, created_at';

function parseId(idStr: string) {
  const id = Number(idStr);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Noto'g'ri id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const checked = tekshirQolItem(body, false);
  if ('error' in checked) return NextResponse.json({ error: checked.error }, { status: 400 });

  const { data, error } = await supabase
    .from('konteyner_items')
    .update({ ...checked.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLS)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Zapchast topilmadi' }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Noto'g'ri id" }, { status: 400 });

  const { data, error } = await supabase.from('konteyner_items').delete().eq('id', id).select('id').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Zapchast topilmadi' }, { status: 404 });
  return NextResponse.json({ success: true, id: data.id });
}
