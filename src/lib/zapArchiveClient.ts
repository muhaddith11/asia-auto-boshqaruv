import { handleJson } from '@/lib/api';
import type { ArchivedZap } from '@/lib/zapArchive';

// Zapchast arxivi API'si (/api/zap-archive) uchun client funksiya.
// Xato bo'lsa server xabari bilan Error tashlaydi (handleJson).
export async function fetchZapArchive(): Promise<ArchivedZap[]> {
  const res = await handleJson<{ rows: ArchivedZap[] }>(await fetch('/api/zap-archive', { cache: 'no-store' }));
  return res.rows;
}
