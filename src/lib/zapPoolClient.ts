import { handleJson } from '@/lib/api';
import type { ZapPoolChiqim } from '@/lib/zapPool';

// "Kassaga tushmagan zapchast puli" chiqimlari API'si (/api/parts/zap-pool).
// Xato bo'lsa server xabari bilan Error tashlaydi (handleJson).

const BASE = '/api/parts/zap-pool';

export async function fetchZapPoolChiqim(): Promise<ZapPoolChiqim[]> {
  const res = await handleJson<{ rows: ZapPoolChiqim[] }>(await fetch(BASE, { cache: 'no-store' }));
  return res.rows;
}

export async function createZapPoolChiqim(summa: number, izoh: string): Promise<ZapPoolChiqim> {
  const res = await handleJson<{ row: ZapPoolChiqim }>(
    await fetch(BASE, {
      method: 'POST',
      body: JSON.stringify({ summa, izoh }),
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  return res.row;
}

export async function deleteZapPoolChiqim(id: number): Promise<void> {
  await handleJson(await fetch(`${BASE}/${id}`, { method: 'DELETE' }));
}
