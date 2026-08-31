import { randomUUID } from 'crypto';
import supabase from '@/lib/supabaseClient';
import { deletePartImages, PART_IMAGES_BUCKET } from '@/lib/partImages';

// ─────────────────────────────────────────────────────────────────────────────
// Zapchastlar katalogi (spare_parts) bilan ishlash — DB va rasm yuklash mantiqi.
// Server-only. Route'lar (dashboard yoki bot-ui) shu funksiyalardan foydalanadi;
// kirish tekshiruvi (auth / boss) route darajasida bo'ladi.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED = ['nom', 'artikul', 'brand', 'mashina', 'rasmlar', 'izoh', 'narx'] as const;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6MB

function clean(body: any) {
  const out: any = {};
  ALLOWED.forEach((k) => {
    if (body?.[k] !== undefined) out[k] = body[k];
  });
  if (out.rasmlar !== undefined && !Array.isArray(out.rasmlar)) out.rasmlar = [];
  // narx — numeric ustun: bo'sh/xato qiymatni NULL ga aylantiramiz
  if (out.narx !== undefined) {
    const n = out.narx === null || out.narx === '' ? null : Number(out.narx);
    out.narx = n === null || Number.isNaN(n) ? null : n;
  }
  return out;
}

export async function listSpareParts() {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const { data, error } = await supabase
    .from('spare_parts')
    .select('*')
    .range(0, 10000)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSparePart(body: any) {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const { data, error } = await supabase.from('spare_parts').insert([clean(body)]).select();
  if (error) throw new Error(error.message);
  return (data && data[0]) ?? null;
}

export async function updateSparePart(id: number, body: any) {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const patch = clean(body);
  patch.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('spare_parts').update(patch).eq('id', id).select();
  if (error) throw new Error(error.message);
  return (data && data[0]) ?? null;
}

export async function deleteSparePart(id: number) {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  const { data, error } = await supabase.from('spare_parts').delete().eq('id', id).select();
  if (error) throw new Error(error.message);
  const deleted = (data && data[0]) ?? null;
  // Zapchast o'chirilsa rasmlarini storage'dan ham tozalaymiz (orfan qolmasin)
  if (deleted?.rasmlar) await deletePartImages(deleted.rasmlar);
  return deleted;
}

// base64 data URL rasmni `part-images` bucket'iga yuklab, ommaviy URL qaytaradi.
export async function uploadPartImageFromDataUrl(dataUrl: unknown) {
  if (!supabase) throw new Error('Supabase sozlanmagan');
  if (!dataUrl || typeof dataUrl !== 'string') throw new Error('Rasm yuborilmadi');
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Noto'g'ri rasm formati");

  const mime = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0) throw new Error("Rasm bo'sh");
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error('Rasm hajmi juda katta (max 6MB)');

  const ext = (mime.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
  const path = `${randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PART_IMAGES_BUCKET)
    .upload(path, buffer, { contentType: mime, upsert: false });
  if (error) throw new Error(error.message);

  const { data: pub } = supabase.storage.from(PART_IMAGES_BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl, path };
}
