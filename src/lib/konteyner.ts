// 3D konteyner ombori (/parts/konteyner): javon raqamlari, zapchast turlari va
// `parts` jadvalidan 3D sahna uchun ro'yxat yig'ish. Javon — A/B tomon,
// bo'lim 1-6 (eshikdan orqaga), qavat 1-5 (pastdan tepaga): masalan 'B2-3'.
// Baza cheklovi: db/parts_javon.sql.

export const JAVON_TOMONLAR = ['A', 'B'] as const;
export const BOLIMLAR = 6;
export const QAVATLAR = 5;

const JAVON_RE = /^([AB])([1-6])-([1-5])$/;

export function isJavon(id: unknown): id is string {
  return typeof id === 'string' && JAVON_RE.test(id);
}

export function javonTavsif(id: string | null | undefined): string {
  const m = JAVON_RE.exec(id || '');
  if (!m) return '';
  return `${m[1] === 'A' ? 'Chap tomon' : "O'ng tomon"} · ${m[2]}-bo'lim · ${m[3]}-qavat`;
}

// 3D da zapchast qanday ko'rinishi (containerScene.js dagi CATS bilan bir xil id'lar)
export const JAVON_TURLARI = [
  { id: 'motor', label: 'Dvigatel qismlari', color: '#b98a5a' },
  { id: 'tormoz', label: 'Tormoz', color: '#8f949a' },
  { id: 'filtr', label: 'Filtrlar', color: '#2f7bd6' },
  { id: 'elektr', label: 'Elektr qismlari', color: '#5b6470' },
  { id: 'osma', label: 'Amortizator / osma', color: '#b8322a' },
  { id: 'moy', label: 'Moy va suyuqlik', color: '#e0a526' },
  { id: 'shina', label: 'Shina va disk', color: '#3a3c40' },
  { id: 'kuzov', label: 'Kuzov detallari', color: '#9aa3ad' },
  { id: 'akkum', label: 'Akkumulyator', color: '#1d1f22' },
  { id: 'boshqa', label: 'Boshqa (quti)', color: '#c49a6c' },
] as const;

export type JavonTur = (typeof JAVON_TURLARI)[number]['id'];

export function isJavonTur(v: unknown): v is JavonTur {
  return typeof v === 'string' && JAVON_TURLARI.some((t) => t.id === v);
}

export function javonTurInfo(id: string | null | undefined) {
  return JAVON_TURLARI.find((t) => t.id === id) || JAVON_TURLARI[JAVON_TURLARI.length - 1];
}

// Ombordagi nomlar qo'lda, xatolar bilan yozilgan ("Antifiriz", "Benzin dachik"),
// shuning uchun so'z boshlari bo'yicha taxmin qilamiz. Tartib muhim: "moy filtri" —
// filtr; "oyna suv" — suyuqlik, "oyna" — kuzov; "tormoz suyuqligi" — suyuqlik.
const TAXMIN: [JavonTur, string[]][] = [
  ['filtr', ['filtr', 'filter', 'fltr']],
  ['moy', ['moy', 'masl', 'antif', 'tosol', 'suyuq', 'oyna suv', 'oyne suv', 'omivat', 'dot-', 'dot4']],
  ['shina', ['shina', 'balon', 'pokrishk', 'disk r']],
  ['tormoz', ['kolodk', 'tormoz', 'supor', 'baraban']],
  ['akkum', ['akkum', 'akumul', 'akb']],
  ['osma', ['amort', 'stoyk', 'rychag', 'richag', 'pruj', 'shrus', 'granat', 'vtulk', 'opor']],
  ['kuzov', ['bamper', 'fara', 'oyna', 'oyne', 'kapot', 'krilo', 'qanot', 'eshik', 'zerkal', 'stop ']],
  ['elektr', ['datchik', 'dachik', 'svech', 'babin', 'bobin', 'generator', 'starter', 'injek', 'lampa', 'rele', 'provod', 'sim ']],
  ['motor', ['porshen', 'grm', 'remen', 'pompa', 'nasos', 'klapan', 'klapn', 'prokladk', 'salnik', 'kolenval', 'raspred', 'rolik', 'zanjir']],
];

export function taxminTur(nom: string | null | undefined): JavonTur {
  const s = ` ${String(nom || '').toLowerCase()} `;
  for (const [tur, sozlar] of TAXMIN) {
    if (sozlar.some((k) => s.includes(k))) return tur;
  }
  return 'boshqa';
}

export interface JavonPart {
  id: number;
  nom: string;
  mashina?: string | null;
  balance?: number | string | null;
  bir?: string | null;
  javon?: string | null;
  javon_tur?: string | null;
}

export function partTur(p: { nom: string; javon_tur?: string | null }): JavonTur {
  return isJavonTur(p.javon_tur) ? p.javon_tur : taxminTur(p.nom);
}

// Tashqaridan olib kelinib to'g'ridan-to'g'ri javonga qo'yilgan zapchast
// (konteyner_items jadvali, db/konteyner_items.sql). Ombor qoldig'iga kirmaydi.
// narx — 1 donasining narxi (so'm), ogirlik — 1 donasining og'irligi (kg).
export interface QolItem {
  id: number;
  javon: string;
  nom: string;
  narx: number | string | null;
  soni: number | string;
  ogirlik: number | string | null;
  izoh: string | null;
  javon_tur: string | null;
  created_at?: string;
}

export type QolItemInput = Partial<Pick<QolItem, 'javon' | 'nom' | 'izoh' | 'javon_tur'>> & {
  narx?: number | null; soni?: number; ogirlik?: number | null;
};

// "150 000", "1,5" kabi qo'lda yozilgan sonlarni o'qiydi. Bo'sh — null, xato — NaN.
export function sonniOqi(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  const s = String(v).replace(/[\s ]/g, '').replace(',', '.');
  if (!s) return null;
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

// POST (yangi=true) da javon, nom, soni majburiy; PATCH da faqat kelgan maydonlar.
export function tekshirQolItem(body: Record<string, unknown>, yangi: boolean): { data: QolItemInput } | { error: string } {
  const data: QolItemInput = {};
  const bor = (k: string) => k in body && body[k] !== undefined;

  if (yangi || bor('javon')) {
    if (!isJavon(body.javon)) return { error: "Javon raqami noto'g'ri (masalan: B2-3)" };
    data.javon = body.javon;
  }
  if (yangi || bor('nom')) {
    const nom = typeof body.nom === 'string' ? body.nom.trim() : '';
    if (!nom) return { error: 'Zapchast nomini yozing' };
    if (nom.length > 200) return { error: 'Nomi juda uzun' };
    data.nom = nom;
  }
  if (yangi || bor('soni')) {
    const soni = sonniOqi(body.soni);
    if (soni === null || Number.isNaN(soni) || soni <= 0 || soni > 100000) return { error: "Sonini to'g'ri kiriting" };
    data.soni = soni;
  }
  if (bor('narx')) {
    const narx = sonniOqi(body.narx);
    if (Number.isNaN(narx) || (narx !== null && narx > 1e12)) return { error: "Narxini to'g'ri kiriting" };
    data.narx = narx;
  }
  if (bor('ogirlik')) {
    const og = sonniOqi(body.ogirlik);
    if (Number.isNaN(og) || (og !== null && og > 100000)) return { error: "Og'irligini to'g'ri kiriting" };
    data.ogirlik = og;
  }
  if (bor('izoh')) {
    const izoh = body.izoh === null ? '' : typeof body.izoh === 'string' ? body.izoh.trim() : null;
    if (izoh === null) return { error: "Izoh noto'g'ri" };
    if (izoh.length > 1000) return { error: 'Izoh juda uzun' };
    data.izoh = izoh || null;
  }
  if (bor('javon_tur')) {
    if (body.javon_tur !== null && !isJavonTur(body.javon_tur)) return { error: "Zapchast turi noto'g'ri" };
    data.javon_tur = body.javon_tur as string | null;
  }
  if (!yangi && !Object.keys(data).length) return { error: "O'zgartirish yo'q" };
  return { data };
}

export function qolSoni(it: Pick<QolItem, 'soni'>): number {
  const n = Number(it.soni);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function qoldiq(p: JavonPart): number {
  const n = Number(p.balance);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface SahnaItem { name: string; cat: JavonTur; qty: number }

// 3D sahnaga: javonga qo'yilgan va omborda qoldig'i bor zapchastlar + qo'lda
// qo'yilganlar. Tugagan (0) ombor zapchasti javonda ro'yxatda qoladi, 3D da yo'q.
export function sahnaInventari(parts: JavonPart[], qolItems: QolItem[] = []): Record<string, SahnaItem[]> {
  const inv: Record<string, SahnaItem[]> = {};
  for (const p of parts) {
    if (!isJavon(p.javon)) continue;
    const qty = Math.ceil(qoldiq(p));
    if (!qty) continue;
    (inv[p.javon] ||= []).push({ name: p.nom, cat: partTur(p), qty });
  }
  for (const it of qolItems) {
    if (!isJavon(it.javon)) continue;
    const qty = Math.ceil(qolSoni(it));
    if (!qty) continue;
    (inv[it.javon] ||= []).push({ name: it.nom, cat: partTur(it), qty });
  }
  for (const k of Object.keys(inv)) inv[k].sort((a, b) => a.name.localeCompare(b.name));
  return inv;
}
