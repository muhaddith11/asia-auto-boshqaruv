// Bot katalogi javobi uchun in-memory cache (5 daqiqa TTL).
// Har safar Supabase'dan yuklamaslik uchun serverda saqlanadi.
// Vercel warm instance bo'lsa, repeat so'rovlar ~5ms da javob beradi.
// route.ts faqat HTTP handler eksport qila oladi, shu sabab cache alohida faylda.
let _cache: { data: string; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 daqiqa

export function readCatalogCache(now: number): string | null {
  return _cache && now - _cache.ts < CACHE_TTL_MS ? _cache.data : null;
}

export function writeCatalogCache(data: string, now: number) {
  _cache = { data, ts: now };
}

// Cache tozalash uchun (xizmat qo'shilganda chaqirish mumkin)
export function invalidateCatalogCache() {
  _cache = null;
}
