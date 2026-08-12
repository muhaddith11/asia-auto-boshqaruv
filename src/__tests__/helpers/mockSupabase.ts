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

/**
 * So'rov konteksti — javobni so'rovga qarab o'zgartirish uchun.
 * Bo'laklab yuklashni (fetchAllRows) route darajasida sinashda kerak:
 * har bir bo'lak boshqa `range` bilan keladi va faqat birinchisi
 * `count: 'exact'` so'raydi.
 */
export interface MockCallContext {
  /** .range(from, to) qiymatlari — chaqirilmagan bo'lsa null */
  range: { from: number; to: number } | null;
  /** select(..., { count: 'exact' }) so'ralganmi */
  withCount: boolean;
  /** shu jadvalga nechanchi so'rov (0 dan boshlanadi) */
  index: number;
}

export type MockResponder = MockResult | ((ctx: MockCallContext) => MockResult);

function createChain(
  table: string,
  getResponder: () => MockResponder,
  nextIndex: () => number,
  calls?: CapturedCalls,
): Record<string, unknown> {
  const chain: Record<string, unknown> = {};
  // Shu zanjirdagi so'rov konteksti
  let range: MockCallContext['range'] = null;
  let withCount = false;

  CHAIN_METHODS.forEach((m) => {
    chain[m] = (...args: unknown[]) => {
      if (calls && (m === 'insert' || m === 'update' || m === 'upsert')) {
        calls[table] ??= {};
        calls[table][m] ??= [];
        calls[table][m].push(args);
      }
      if (m === 'range' && typeof args[0] === 'number' && typeof args[1] === 'number') {
        range = { from: args[0], to: args[1] };
      }
      if (m === 'select') {
        const opts = args[1] as { count?: string } | undefined;
        if (opts?.count) withCount = true;
      }
      return chain;
    };
  });
  chain.single = () => chain;
  chain.maybeSingle = () => chain;
  chain.then = (resolve: (r: MockResult) => unknown, reject?: (e: unknown) => unknown) => {
    const responder = getResponder();
    const result = typeof responder === 'function'
      ? responder({ range, withCount, index: nextIndex() })
      : responder;
    return Promise.resolve(result).then(resolve, reject);
  };
  return chain;
}

/**
 * `responses` — jadval nomi bo'yicha qaytariladigan natija.
 * `calls` (ixtiyoriy) — insert/update/upsert ga uzatilgan argumentlarni yozib boradi,
 * shu orqali route handler bazaga aynan nima yuborganini tekshirish mumkin.
 * Obyektlar reference bo'lgani uchun testda keyinchalik mutatsiya qilib,
 * har bir chaqiruv uchun boshqa javob sozlash mumkin.
 */
export function createSupabaseMock(
  responses: Record<string, MockResponder>,
  calls?: CapturedCalls,
  // Jadval bo'yicha so'rov hisoblagichi — MockCallContext.index uchun.
  // ⚠️ Mock butun test fayli uchun BIR MARTA yaratiladi, shuning uchun
  // hisoblagich testlar orasida o'z-o'zidan nolga qaytmaydi. `index` dan
  // foydalansangiz, bu obyektni `responses` bilan birga beforeEach da
  // tozalang (aks holda ikkinchi test birinchisining sanog'idan davom etadi).
  counters: Record<string, number> = {},
) {
  return {
    from: (table: string) => createChain(
      table,
      () => responses[table] ?? { data: null, error: null },
      () => (counters[table] = (counters[table] ?? -1) + 1),
      calls,
    ),
  };
}
