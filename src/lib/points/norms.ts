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

// Marka/model kaliti — xizmat nomidan farqli o'laroq bo'shliqlar butunlay
// olib tashlanadi. Bazada bir mashina turlicha yozilgan: "Mercedes-Benz",
// "Mercedes-benz", "MERCEDESBENZ"; "EV 3" va "EV3"; "BYD" va "Byd".
export function normalizeCarKey(s: string | null | undefined): string {
  return (s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
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

  // Faqat shu marka/model uchun ATAYLAB yozilgan norma (umumiy qator emas).
  // Bunday norma topilsa klass koeffitsienti qo'llanmaydi — qiymat allaqachon
  // shu mashina uchun qo'yilgan.
  findExact(nom: string, brand?: string | null, carModel?: string | null): number | null {
    const key = normalizeServiceName(nom);
    if (!key || !brand) return null;
    return (
      this.map.get(normKey(key, brand, carModel || null)) ??
      this.map.get(normKey(key, brand, null)) ??
      null
    );
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

// ── Mashina klassi koeffitsienti ─────────────────────────────────────────────
// Qimmat avtomobil va elektromobil ishi odatdagidan uzoqroq davom etadi.

export interface CarClassRow {
  brand_norm: string;
  car_model_norm: string | null;
  klass: string;
  koeffitsient: number;
}

export class CarClassLookup {
  private map = new Map<string, { klass: string; koef: number }>();

  constructor(rows: CarClassRow[]) {
    for (const r of rows) {
      const koef = Number(r.koeffitsient);
      if (!Number.isFinite(koef) || koef <= 0) continue;
      this.map.set(`${r.brand_norm}|${r.car_model_norm || ''}`, { klass: r.klass, koef });
    }
  }

  // Model istisnosi markadan ustun (Kia benzin 1.15, lekin Kia EV 6 → 1.30).
  // Topilmasa 1.0 — noma'lum marka bazaviy normada baholanadi.
  find(brand?: string | null, carModel?: string | null): { klass: string; koef: number } {
    const b = normalizeCarKey(brand);
    if (!b) return { klass: 'oddiy', koef: 1 };
    return (
      this.map.get(`${b}|${normalizeCarKey(carModel)}`) ??
      this.map.get(`${b}|`) ?? { klass: 'oddiy', koef: 1 }
    );
  }

  get size(): number {
    return this.map.size;
  }
}

export interface ResolvedNorm {
  minutes: number | null;
  koef: number;
  klass: string;
  aniq: boolean; // shu mashina uchun ANIQ norma yozilganmi (koeffitsient qo'llanmagan)
}

/**
 * Yakuniy norma = bazaviy norma x mashina klassi koeffitsienti.
 *
 * Agar `service_norms`da shu marka/model uchun ANIQ norma yozilgan bo'lsa,
 * u o'zgarishsiz ishlatiladi — koeffitsient qo'llanmaydi, chunki aniq qiymat
 * allaqachon shu mashina uchun qo'yilgan (ikki marta kengaytirmaslik uchun).
 */
export function resolveNorm(
  norms: NormLookup,
  classes: CarClassLookup,
  nom: string,
  brand?: string | null,
  carModel?: string | null,
): ResolvedNorm {
  const { klass, koef } = classes.find(brand, carModel);

  const aniq = norms.findExact(nom, brand, carModel);
  if (aniq != null) return { minutes: aniq, koef: 1, klass, aniq: true };

  const base = norms.find(nom);
  if (base == null) return { minutes: null, koef, klass, aniq: false };

  return { minutes: Math.round(base * koef), koef, klass, aniq: false };
}
