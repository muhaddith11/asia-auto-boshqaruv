import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { identifyBoss } from '@/lib/botWorker';
import { uploadPartImageFromDataUrl } from '@/lib/sparePartsRepo';
import { PART_IMAGES_BUCKET, storagePathFromUrl } from '@/lib/partImages';

export const dynamic = 'force-dynamic';

// Rasm yuklash — faqat boshliq. Kirish: JSON { dataUrl, workerPhone, mechanicChatId }
export async function POST(request: NextRequest) {
  try {
    const { dataUrl, workerPhone, mechanicChatId } = await request.json();
    const boss = await identifyBoss(workerPhone, mechanicChatId);
    if (!boss) return NextResponse.json({ ok: false, error: "Ruxsat yo'q (faqat boshliq)" }, { status: 403 });
    const { url, path } = await uploadPartImageFromDataUrl(dataUrl);
    return NextResponse.json({ ok: true, url, path });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Yuklashda xatolik' }, { status: 500 });
  }
}

// Bitta rasmni o'chirish — faqat boshliq. Kirish: JSON { url, workerPhone, mechanicChatId }
export async function DELETE(request: NextRequest) {
  if (!supabase) return NextResponse.json({ ok: false, error: 'Supabase sozlanmagan' }, { status: 500 });
  try {
    const { url, workerPhone, mechanicChatId } = await request.json();
    const boss = await identifyBoss(workerPhone, mechanicChatId);
    if (!boss) return NextResponse.json({ ok: false, error: "Ruxsat yo'q (faqat boshliq)" }, { status: 403 });
    const path = storagePathFromUrl(url);
    if (!path) return NextResponse.json({ ok: false, error: "Noto'g'ri rasm URL" }, { status: 400 });
    const { error } = await supabase.storage.from(PART_IMAGES_BUCKET).remove([path]);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "O'chirishda xatolik" }, { status: 500 });
  }
}
