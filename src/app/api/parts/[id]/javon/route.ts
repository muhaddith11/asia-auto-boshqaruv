import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { isJavon, isJavonTur } from '@/lib/konteyner';

export const dynamic = 'force-dynamic';

// 3D konteyner ombori: zapchastni javonga qo'yish / ko'chirish / olib tashlash
// va 3D ko'rinish turini o'zgartirish. Faqat javon va javon_tur ustunlariga
// tegadi — qoldiq (balance) va narxlar shu yo'l orqali hech qachon o'zgarmaydi.
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await context.params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Noto'g'ri zapchast id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const update: { javon?: string | null; javon_tur?: string | null } = {};
  if ('javon' in body) {
    if (body.javon !== null && !isJavon(body.javon)) {
      return NextResponse.json({ error: "Javon raqami noto'g'ri (masalan: B2-3)" }, { status: 400 });
    }
    update.javon = body.javon as string | null;
  }
  if ('javon_tur' in body) {
    if (body.javon_tur !== null && !isJavonTur(body.javon_tur)) {
      return NextResponse.json({ error: "Zapchast turi noto'g'ri" }, { status: 400 });
    }
    update.javon_tur = body.javon_tur as string | null;
  }
  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "O'zgartirish yo'q" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('parts')
    .update(update)
    .eq('id', id)
    .select('id, javon, javon_tur')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Zapchast topilmadi' }, { status: 404 });
  return NextResponse.json(data);
}
