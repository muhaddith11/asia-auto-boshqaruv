// Supabase JS query-builder'ini taqlid qiluvchi yengil mock.
// Har bir metod (select/insert/update/delete/order/eq/...) zanjir uchun
// o'zini qaytaradi va obyekt "thenable" — qayerda await qilinsa ham
// shu jadval uchun oldindan sozlangan natijani beradi.

export interface MockResult {
  data?: unknown;
  error?: { message: string; code?: string; details?: string } | null;
  count?: number;
  status?: number;
}

const CHAIN_METHODS = [
  'select', 'insert', 'update', 'upsert', 'delete',
  'order', 'gte', 'lte', 'eq', 'in', 'range', 'limit',
] as const;

// insert/update/upsert ga uzatilgan argumentlarni ushlab qolish uchun
// (mass-assignment himoyasi kabi narsalarni tekshirish uchun kerak).
export type CapturedCalls = Record<string, Record<string, unknown[][]>>;

function createChain(table: string, getResult: () => MockResult, calls?: CapturedCalls): Record<string, unknown> {
  const chain: Record<string, unknown> = {};
  CHAIN_METHODS.forEach((m) => {
    chain[m] = (...args: unknown[]) => {
      if (calls && (m === 'insert' || m === 'update' || m === 'upsert')) {
        calls[table] ??= {};
        calls[table][m] ??= [];
        calls[table][m].push(args);
      }
      return chain;
    };
  });
  chain.single = () => chain;
  chain.maybeSingle = () => chain;
  chain.then = (resolve: (r: MockResult) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(getResult()).then(resolve, reject);
  return chain;
}

/**
 * `responses` — jadval nomi bo'yicha qaytariladigan natija.
 * `calls` (ixtiyoriy) — insert/update/upsert ga uzatilgan argumentlarni yozib boradi,
 * shu orqali route handler bazaga aynan nima yuborganini tekshirish mumkin.
 * Obyektlar reference bo'lgani uchun testda keyinchalik mutatsiya qilib,
 * har bir chaqiruv uchun boshqa javob sozlash mumkin.
 */
export function createSupabaseMock(responses: Record<string, MockResult>, calls?: CapturedCalls) {
  return {
    from: (table: string) => createChain(table, () => responses[table] ?? { data: null, error: null }, calls),
  };
}
