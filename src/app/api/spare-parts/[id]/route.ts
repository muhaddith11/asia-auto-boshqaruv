import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { deletePartImages } from '@/lib/partImages';

export const dynamic = 'force-dynamic';

function mapAppToDB(body: any) {
  const b = { ...body } as any;
  const allowed = ['nom', 'artikul', 'brand', 'mashina', 'rasmlar', 'izoh'];
  const clean: any = {};
  allowed.forEach((key) => {
    if (b[key] !== undefined) clean[key] = b[key];
  });
  if (clean.rasmlar !== undefined && !Array.isArray(clean.rasmlar)) {
    clean.rasmlar = [];
  }
  clean.updated_at = new Date().toISOString();
  return clean;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!supabase) return NextResponse.json({ error: 'Supabase sozlanmagan' }, { status: 500 });
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const body = await request.json();
    const dbBody = mapAppToDB(body);
    const { data, error } = await supabase.from('spare_parts').update(dbBody).eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data && data[0]) ?? null);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// Barqarorlik uchun POST ham PATCH kabi ishlaydi (loyiha konvensiyasi).
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return PATCH(request, context);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!supabase) return NextResponse.json({ error: 'Supabase sozlanmagan' }, { status: 500 });
  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const { data, error } = await supabase.from('spare_parts').delete().eq('id', id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const deleted = (data && data[0]) ?? null;
    // Zapchast o'chirilsa, uning rasmlarini storage'dan ham tozalaymiz (orfan qolmasin)
    if (deleted?.rasmlar) await deletePartImages(deleted.rasmlar);
    return NextResponse.json({ success: true, deleted });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
