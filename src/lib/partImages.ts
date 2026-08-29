import supabase from '@/lib/supabaseClient';

// Zapchast rasmlari uchun storage yordamchilari.
export const PART_IMAGES_BUCKET = 'part-images';

// Public URL'dan bucket ichidagi fayl yo'lini ajratadi.
// Ko'rinishi: https://<ref>.supabase.co/storage/v1/object/public/part-images/<path>
export function storagePathFromUrl(url: unknown): string | null {
  if (!url || typeof url !== 'string') return null;
  const marker = `/storage/v1/object/public/${PART_IMAGES_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = url.slice(i + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
}

// Berilgan URL massividagi rasmlarni storage'dan o'chiradi (best-effort —
// o'chmasa ham chaqiruvchi amal davom etaveradi).
export async function deletePartImages(urls: unknown): Promise<void> {
  if (!supabase || !Array.isArray(urls)) return;
  const paths = urls
    .map((u) => storagePathFromUrl(u))
    .filter((p): p is string => !!p);
  if (paths.length === 0) return;
  try {
    await supabase.storage.from(PART_IMAGES_BUCKET).remove(paths);
  } catch {
    // e'tiborsiz — orfan rasm zarar bermaydi
  }
}
