/**
 * Supabase bitta so'rovda ko'pi bilan 1000 qator qaytaradi. Jadval undan
 * kattaroq bo'lsa, qolganini bo'lak-bo'lak so'rash kerak.
 *
 * Ilgari route'larda bu KETMA-KET (while/for loop) qilinardi: har bo'lak
 * oldingisi tugagach yuborilardi. `services_list` da 4164 qator bor — bu
 * 5 ta navbatdagi so'rov, jami ~2 soniya (o'lchangan). Aslida bo'laklar
 * bir-biriga bog'liq emas.
 *
 * Bu yerda birinchi bo'lak bilan birga umumiy son (`count: 'exact'`)
 * olinadi, so'ng qolgan bo'laklar PARALLEL so'raladi. Natijada qancha
 * bo'lak bo'lishidan qat'i nazar — 2 ta navbat.
 *
 * Tartib saqlanadi: bo'laklar `range` bo'yicha ketma-ket birlashtiriladi,
 * so'rovda esa bir xil ORDER BY ishlatiladi.
 */

export const PAGE_SIZE = 1000;

/** Supabase so'rov natijasining bizga kerakli qismi. */
export interface ChunkResult<T> {
  data: T[] | null;
  error: { message: string } | null;
  count?: number | null;
}

/**
 * @param buildQuery  (from, to, withCount) → Supabase so'rovi.
 *                    `withCount` faqat birinchi bo'lakda true bo'ladi.
 * @param maxPages    Xavfsizlik chegarasi (cheksiz sikl bo'lmasligi uchun).
 */
export async function fetchAllRows<T>(
  buildQuery: (from: number, to: number, withCount: boolean) => PromiseLike<ChunkResult<T>>,
  maxPages = 100,
): Promise<T[]> {
  const first = await buildQuery(0, PAGE_SIZE - 1, true);
  if (first.error) throw new Error(first.error.message);

  const rows = first.data ?? [];
  // Birinchi bo'lak to'lmagan bo'lsa — hammasi shu.
  if (rows.length < PAGE_SIZE) return rows;

  // count berilmasa (ba'zi so'rovlarda null bo'lishi mumkin) — eski
  // xulqqa qaytamiz va bo'laklarni to'lmaguncha ketma-ket so'raymiz.
  const total = first.count ?? null;
  if (total === null) return fetchAllRowsSequential(buildQuery, rows, maxPages);

  const pages = Math.min(maxPages, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return rows;

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      buildQuery((i + 1) * PAGE_SIZE, (i + 2) * PAGE_SIZE - 1, false)),
  );

  for (const chunk of rest) {
    if (chunk.error) throw new Error(chunk.error.message);
    if (chunk.data?.length) rows.push(...chunk.data);
  }

  return rows;
}

/** count mavjud bo'lmagan holat uchun zaxira yo'l (eski xulq). */
async function fetchAllRowsSequential<T>(
  buildQuery: (from: number, to: number, withCount: boolean) => PromiseLike<ChunkResult<T>>,
  rows: T[],
  maxPages: number,
): Promise<T[]> {
  for (let page = 1; page < maxPages; page++) {
    const chunk = await buildQuery(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1, false);
    if (chunk.error) throw new Error(chunk.error.message);
    const data = chunk.data ?? [];
    if (data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows;
}
