// Ustaxona (barcha xodimlar): mashinaning O'ZI (old/orqa tomoni, raqami
// ko'rinadigan) yoki texpasport rasmidan marka, model va davlat raqamini
// aniqlash. Server-only — GEMINI kalitlari brauzerga chiqmaydi.
//
// Katalog (bot dropdown'idagi aynan marka → modellar ro'yxati) AI'ga beriladi:
// katalog nomlari o'ziga xos ("Lasseti", "Tuscon", "K 5", "Boshqa" ichida
// "Skoda Kodiaq"...), shuning uchun oddiy matn moslashtirish ishonchsiz —
// AI'dan to'g'ridan-to'g'ri katalogdagi qatorni tanlashni so'raymiz.

import { callGemini, type GeminiModelChoice } from './geminiOilVision';

export type CarCatalog = Record<string, string[]>;

export interface CarScanResult {
  found: boolean; // rasmda mashina (yoki texpasport) aniqlandimi
  // Formaga yoziladigan marka/model. Katalogda bo'lsa — AYNAN katalog yozuvi;
  // bo'lmasa — katalog tartibida AI ko'rgan nom (qarang: fillOutsideCatalog).
  brand: string;
  model: string;
  fromCatalog: boolean; // marka VA model katalogdan topildimi (false → yangi nom yozildi)
  seenBrand: string; // AI rasmda ko'rgan haqiqiy marka (katalogdan qat'iy nazar)
  seenModel: string; // AI rasmda ko'rgan haqiqiy model
  plateNumber: string; // bo'shliqsiz, katta harf, topilmasa ''
}

const MAX_BRANDS = 120;
const MAX_MODELS_PER_BRAND = 200;
const MAX_NAME_LEN = 60;

// Klientdan kelgan katalogni tozalaydi (hajm va tur cheklovi) — prompt'ga
// faqat oddiy qisqa satrlar tushadi.
export function sanitizeCatalog(raw: any): CarCatalog {
  const out: CarCatalog = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [brand, models] of Object.entries(raw).slice(0, MAX_BRANDS)) {
    const b = String(brand).trim().slice(0, MAX_NAME_LEN);
    if (!b || !Array.isArray(models)) continue;
    const list = models
      .map((m) => String(m ?? '').trim().slice(0, MAX_NAME_LEN))
      .filter(Boolean)
      .slice(0, MAX_MODELS_PER_BRAND);
    if (list.length) out[b] = list;
  }
  return out;
}

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    found: {
      type: 'BOOLEAN',
      description: "Rasmda avtomobil (yoki uning texpasporti) aniq ko'rinib, marka ishonchli aniqlandimi.",
    },
    seenBrand: {
      type: 'STRING',
      description: "Rasmdagi mashinaning haqiqiy markasi, standart lotin yozuvida (masalan: Chevrolet, Kia, BYD, Skoda). Aniqlanmasa bo'sh qator.",
    },
    seenModel: {
      type: 'STRING',
      description: "Rasmdagi mashinaning haqiqiy modeli, MARKASIZ (masalan: Lacetti, Cobalt, K5, Duster, 2106, Song Plus DM-i). Aniqlanmasa bo'sh qator.",
    },
    catalogBrand: {
      type: 'STRING',
      description: "Berilgan KATALOGdagi marka kaliti — AYNAN katalogdagidek yozilsin. Mos keladigani yo'q bo'lsa bo'sh qator.",
    },
    catalogModel: {
      type: 'STRING',
      description: "catalogBrand ichidagi model — AYNAN katalogdagidek (harf, bo'shliq, vergul bilan birga) yozilsin. Mos keladigani yo'q bo'lsa bo'sh qator.",
    },
    plateNumber: {
      type: 'STRING',
      description: "Davlat raqami, bo'shliqsiz, katta lotin harflarida (masalan 01A123AA yoki 01123AAA). Aniq o'qilmasa bo'sh qator — taxmin qilma.",
    },
  },
  required: ['found', 'seenBrand', 'seenModel', 'catalogBrand', 'catalogModel', 'plateNumber'],
};

function buildPrompt(catalog: CarCatalog) {
  const catalogText = Object.entries(catalog)
    .map(([b, models]) => `${b}: ${models.map((m) => `"${m}"`).join(', ')}`)
    .join('\n');
  return (
    "Sen O'zbekistondagi avtoservis xodimiga yordam beryapsan. Rasmda avtomobilning o'zi (oldi, orqasi yoki yon " +
    "tomoni) yoki uning texnik pasporti bo'lishi mumkin.\n" +
    "1) Mashinaning haqiqiy markasi va modelini aniqla (kuzov shakli, fara/chiroqlar, radiator panjarasi, " +
    "emblema va yozuvlar bo'yicha; texpasport bo'lsa — undagi yozuvdan). Gibrid belgisi (Hybrid, DM-i, DM-p, " +
    "PHEV, 하이브리드) yoki elektromobil belgisi (EV, BEV) ko'rinsa, buni hisobga ol.\n" +
    "2) Shu mashinaga eng mos keladigan qatorni quyidagi KATALOGdan tanla. Katalogdagi nomlar xato yozilgan " +
    "bo'lishi mumkin (masalan \"Lasseti\" = Lacetti, \"Tuscon\" = Tucson, \"Arizo\" = Arrizo, \"Chempion\" = Champion, " +
    "\"K 5\" = K5) — bu normal, ma'nosi bo'yicha tanla. Markalar O'zbekistondagi nomi bilan turishi mumkin: " +
    "VAZ / ВАЗ / Jiguli (Жигули, 2101–2107) / Niva → Lada; UAZ → Lada \"UAZ\"; GAZ Gazelle → Lada \"gazel\"; " +
    "Daewoo (Nexia, Matiz, Damas, Tico, Lacetti, Gentra) va Ravon (R2 = Spark, R3 = Nexia 3, R4 = Cobalt) → Chevrolet. " +
    "Ba'zi mashinalar \"Boshqa\" markasi ichida to'liq nom bilan turadi (masalan Boshqa → \"Skoda Kodiaq\", " +
    "\"Mazda 6\", \"Porsche Panamera\") — haqiqiy marka katalogda alohida bo'lmasa, Boshqa ichidan qidir. " +
    "Avlod/versiya (\"Nexia 2\"/\"Nexia 3\", \"Malibu 1\"/\"Malibu 2\", \"Tracker 1\"/\"Tracker 2\", gibrid/oddiy) " +
    "bo'yicha ko'rinishiga qarab eng to'g'risini tanla. catalogBrand va catalogModel'ni AYNAN katalogdagidek ko'chir.\n" +
    "MUHIM: marka katalogda bor-u, aynan shu model yo'q bo'lsa (masalan VAZ 2106 — Lada ichida yo'q) — catalogBrand'ni " +
    "baribir yoz, faqat catalogModel'ni bo'sh qoldir; boshqa modelni o'ylab topma. Marka ham yo'q bo'lsa — ikkalasi bo'sh.\n" +
    "3) Davlat raqamini o'qi (O'zbekiston formati: 01 A 123 AA yoki 01 123 AAA). Raqam ko'rinmasa yoki aniq " +
    "o'qilmasa — bo'sh qoldir.\n\n" +
    `KATALOG (marka: modellar):\n${catalogText || "(bo'sh)"}`
  );
}

// Uzbek raqamlarida faqat lotin harflar — kirill o'xshash harflarni almashtiramiz.
const CYR_TO_LAT: Record<string, string> = {
  А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M', Н: 'H', О: 'O', Р: 'P', С: 'C', Т: 'T', У: 'Y', Х: 'X',
};

// O'zbekiston raqamlari: 01A123AA (jismoniy) va 01123AAA (yuridik).
const UZ_PLATE = /^(\d{2}[A-Z]\d{3}[A-Z]{2}|\d{5}[A-Z]{3})$/;

function normalizePlate(s: any): string {
  const p = String(s || '')
    .toUpperCase()
    .replace(/[АВЕКМНОРСТУХ]/g, (c) => CYR_TO_LAT[c] || c)
    .replace(/[^A-Z0-9]/g, '');
  // Chala o'qilgan raqam ("01VSC") formaga tushmasin — xodim o'zi yozgani
  // yaxshiroq. Boshqa formatdagi (chet el, eski) to'liq raqamlar qoladi.
  if (UZ_PLATE.test(p)) return p;
  return p.length >= 7 && /\d/.test(p) && /[A-Z]/.test(p) ? p : '';
}

// AI tanlagan marka/model haqiqatan katalogda bormi — AYNAN tekshiramiz
// (dropdown'da yo'q qiymat formada "ko'rinmas tanlov" bo'lib qolmasin) va
// katalogdagi yozuvni qaytaramiz. Katalogda bitta marka turli registrda
// takrorlanadi ("Lada"/"LADA", "Kia"/"KIA", "Chevrolet"/"CHEVROLET") — model
// shu markalarning qaysi birida bo'lsa, o'shani olamiz. Model topilmasa ham
// marka qaytariladi (masalan VAZ 2106 → Lada, model qo'lda tanlanadi).
export function resolveInCatalog(catalog: CarCatalog, rawBrand: any, rawModel: any): { brand: string; model: string } {
  const wantBrand = String(rawBrand || '').trim();
  const wantModel = String(rawModel || '').trim().toLowerCase();
  const findModel = (b: string) => (wantModel ? catalog[b].find((m) => m.toLowerCase() === wantModel) || '' : '');

  const sameBrand = Object.keys(catalog)
    .filter((b) => b.toLowerCase() === wantBrand.toLowerCase())
    .sort((a, b) => Number(b === wantBrand) - Number(a === wantBrand)); // aynan yozuv birinchi

  for (const b of sameBrand) {
    const model = findModel(b);
    if (model) return { brand: b, model };
  }
  if (sameBrand.length) return { brand: sameBrand[0], model: '' };

  // Marka mos kelmadi, lekin model nomi katalogda yagona bo'lsa — o'shani olamiz
  // (AI markani boshqacha yozgan holat, masalan "Skoda" o'rniga "Boshqa").
  if (wantModel) {
    const hits = Object.keys(catalog).filter((b) => findModel(b));
    if (hits.length === 1) return { brand: hits[0], model: findModel(hits[0]) };
  }
  return { brand: '', model: '' };
}

// AI qaytargan nomni formaga yaroqli qiladi: ortiqcha bo'shliq, g'alati
// belgilar va haddan uzunlik olib tashlanadi.
function cleanName(s: any): string {
  return String(s || '')
    .replace(/[^\p{L}\p{N} .+\-/]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LEN);
}

const squash = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

// Katalogda yo'q mashinani ham formaga yozish — katalogning o'z tartibida:
//  • marka bor, model yo'q (VAZ 2106) → o'sha marka + AI ko'rgan model ("2106");
//  • marka ham yo'q (Renault Duster) → "Boshqa" + to'liq nom ("Renault Duster"),
//    katalogdagi Boshqa → "Skoda Kodiaq", "Volvo" kabi.
// Buyurtma marka/modelni matn sifatida saqlaydi, xodim kiritgan xizmatlar
// shu nom bilan services_list'ga yoziladi — keyingi safar mashina katalogda bo'ladi.
export function fillOutsideCatalog(
  catalog: CarCatalog,
  inCat: { brand: string; model: string },
  seenBrand: string,
  seenModel: string
): { brand: string; model: string } {
  if (inCat.brand && inCat.model) return inCat;

  if (inCat.brand) {
    // Model nomidan marka takrorini olib tashlaymiz ("Lada 2106" → "2106").
    let m = seenModel;
    for (const b of [seenBrand, inCat.brand]) {
      if (b && m.toLowerCase().startsWith(b.toLowerCase() + ' ')) m = m.slice(b.length).trim();
    }
    if (!m) return inCat;
    // Avlod noaniq bo'lsa ("Nexia" → Nexia 1/2/3) yangi nom yaratmaymiz:
    // bitta mos keladigani bo'lsa o'shani olamiz, bir nechta bo'lsa — xodim tanlaydi.
    const prefixHits = catalog[inCat.brand].filter((x) => squash(x).startsWith(squash(m)));
    if (prefixHits.length === 1) return { brand: inCat.brand, model: prefixHits[0] };
    if (prefixHits.length > 1) return inCat;
    return { brand: inCat.brand, model: m };
  }

  if (!seenBrand) return { brand: '', model: '' };
  // AI catalogBrand'ni bo'sh qoldirgan, lekin ko'rgan markasi katalogda bor bo'lsa — o'sha marka.
  const byName = resolveInCatalog(catalog, seenBrand, seenModel);
  if (byName.brand) return fillOutsideCatalog(catalog, byName, seenBrand, seenModel);
  const other = Object.keys(catalog).find((b) => b.toLowerCase() === 'boshqa');
  const full = cleanName(
    seenModel.toLowerCase().startsWith(seenBrand.toLowerCase()) ? seenModel : `${seenBrand} ${seenModel}`
  );
  return other ? { brand: other, model: full } : { brand: seenBrand, model: seenModel };
}

// Asosiy model + zaxiralar (har biri o'z kvotasi va quvvatiga ega). Asosiy
// model band (503) yoki osilib qolsa, 6 s dan keyin zaxira model bilan so'rov
// ketadi; kvota tugasa (429) — darhol. "O'ylash" har birida o'chirilgan (tezlik).
export const CAR_SCAN_MODELS: GeminiModelChoice[] = [
  { model: 'gemini-3.6-flash', generationConfig: { thinkingConfig: { thinkingLevel: 'minimal' } } },
  { model: 'gemini-2.5-flash', generationConfig: { thinkingConfig: { thinkingBudget: 0 } } },
  { model: 'gemini-3.5-flash-lite', generationConfig: { thinkingConfig: { thinkingLevel: 'minimal' } } },
];

export async function recognizeCarForCatalog(
  base64Data: string,
  mimeType: string,
  catalog: CarCatalog,
  models: GeminiModelChoice[] = CAR_SCAN_MODELS
): Promise<CarScanResult> {
  // Tezlik (2026-11-15 o'lchov): "o'ylash" bosqichi (~500 token) javobni 3–5 s
  // ga cho'zardi, minimal rejimda 1–2,5 s va natija bir xil (marka/model/raqam).
  // Google ba'zan sababsiz 45–60 s osilib qoladi — 6 s ichida javob bo'lmasa
  // parallel so'rov ketadi (birinchi javob olinadi).
  const out = await callGemini(
    [{ text: buildPrompt(catalog) }, { inline_data: { mime_type: mimeType, data: base64Data } }],
    SCHEMA,
    {
      totalTimeoutMs: 45_000,
      attemptTimeoutMs: 25_000,
      hedgeAfterMs: 6_000,
      models,
    }
  );

  const seenBrand = cleanName(out.seenBrand);
  const seenModel = cleanName(out.seenModel);
  const inCat = resolveInCatalog(catalog, out.catalogBrand, out.catalogModel);
  const filled = fillOutsideCatalog(catalog, inCat, seenBrand, seenModel);
  // Yangi yozilgan nom aslida katalogda bo'lib chiqsa (Boshqa → "Skoda Kodiaq") —
  // katalogdagi yozuvni olamiz.
  const canon = filled.model ? resolveInCatalog(catalog, filled.brand, filled.model) : { brand: '', model: '' };
  const fromCatalog = !!(canon.brand && canon.model);
  const { brand, model } = fromCatalog ? canon : filled;

  return {
    found: !!out.found,
    brand,
    model,
    fromCatalog,
    seenBrand,
    seenModel,
    plateNumber: normalizePlate(out.plateNumber),
  };
}
