import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import supabase from '@/lib/supabaseClient';
import { PART_IMAGES_BUCKET, storagePathFromUrl } from '@/lib/partImages';

export const dynamic = 'force-dynamic';

const BUCKET = PART_IMAGES_BUCKET;
const MAX_BYTES = 6 * 1024 * 1024; // 6MB (mijoz allaqachon siqadi)

// Rasmni `part-images` bucket'iga yuklaydi va ommaviy URL qaytaradi.
// Kirish: JSON { dataUrl: "data:image/jpeg;base64,..." }
export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Supabase sozlanmagan' }, { status: 500 });
  try {
    const { dataUrl } = await request.json();
    if (!dataUrl || typeof dataUrl !== 'string') {
      return NextResponse.json({ error: 'Rasm yuborilmadi' }, { status: 400 });
    }

    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
    if (!match) return NextResponse.json({ error: "Noto'g'ri rasm formati" }, { status: 400 });

    const mime = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length === 0) {
      return NextResponse.json({ error: "Rasm bo'sh" }, { status: 400 });
    }
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: 'Rasm hajmi juda katta (max 6MB)' }, { status: 413 });
    }

    const ext = (mime.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
    const path = `${randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: mime,
      upsert: false,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl, path });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Yuklashda xatolik' }, { status: 500 });
  }
}

// Bitta rasmni storage'dan o'chiradi. Kirish: JSON { url }
export async function DELETE(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Supabase sozlanmagan' }, { status: 500 });
  try {
    const { url } = await request.json();
    const path = storagePathFromUrl(url);
    if (!path) return NextResponse.json({ error: "Noto'g'ri rasm URL" }, { status: 400 });
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "O'chirishda xatolik" }, { status: 500 });
  }
}
