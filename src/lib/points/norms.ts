// Xizmat vaqt normalari — "injektor tozalash 1 soat", "svecha 20 daqiqa" kabi.
//
// Nomni normallashtirish SHART: katalogda 621 xil nom bor, lekin ular asosan bir
// xil xizmatning turli yozilishi — "💉 Injector tozalash", "Injector tozalash",
// "Diagnostika " (oxirida bo'sh joy), "🔍 Diagnostika". Emoji/tinish belgilari
// olib tashlanadi va kichik harfga o'tkaziladi, shunda bitta norma hammasiga tegadi.
//
// Diqqat: normalizatsiya ataylab EHTIYOTKOR — "injektor" va "injector" (k/c) turli
// kalit bo'lib qoladi. Ularni zo'rlab birlashtirish turli xizmatlarni ham qo'shib
// yuborishi mumkin edi. Buning o'rniga egasi admin sahifada ikkala variantga ham
// norma belgilaydi (yoki normasiz qoldiradi — u holda ball berilmaydi).

export interface ServiceNorm {
  nom_norm: string;
  brand: string | null;
  car_model: string | null;
  norma_daqiqa: number;
}

// Emoji, tinish belgilari va ortiqcha bo'shliqlarni olib tashlaydi.
export function normalizeServiceName(nom: string | null | undefined): string {
  return (nom || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ') // harf/raqamdan boshqasi (emoji ham) — bo'shliqqa
    .trim()
    .replace(/\s+/g, ' ');
}

function normKey(nom: string, brand: string | null, model: string | null): string {
  return `${nom}|${(brand || '').toLowerCase()}|${(model || '').toLowerCase()}`;
}

// Normalar ro'yxatidan tez qidiruv uchun indeks.
export class NormLookup {
  private map = new Map<string, number>();

  constructor(norms: ServiceNorm[]) {
    for (const n of norms) {
      const minutes = Number(n.norma_daqiqa);
      if (!Number.isFinite(minutes) || minutes <= 0) continue;
      this.map.set(normKey(n.nom_norm, n.brand, n.car_model), minutes);
    }
  }

  // Aniqlikdan umumiyga: (nom+brand+model) → (nom+brand) → (nom).
  // Topilmasa null — chaqiruvchi buni "ball berilmaydi" deb qabul qilishi shart.
  find(nom: string, brand?: string | null, carModel?: string | null): number | null {
    const key = normalizeServiceName(nom);
    if (!key) return null;
    const candidates = [
      normKey(key, brand || null, carModel || null),
      normKey(key, brand || null, null),
      normKey(key, null, null),
    ];
    for (const c of candidates) {
      const found = this.map.get(c);
      if (found != null) return found;
    }
    return null;
  }

  get size(): number {
    return this.map.size;
  }
}

// `orders.mashina` "Chevrolet Gentra" ko'rinishida saqlanadi — normani brand yoki
// model darajasida topish uchun ajratiladi.
export function splitMashina(mashina: string | null | undefined): { brand: string | null; model: string | null } {
  const parts = (mashina || '').trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return { brand: null, model: null };
  return { brand: parts[0], model: parts.slice(1).join(' ') || null };
}
