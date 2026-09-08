// Yog' bo'limi: texpasport/birka rasmidan mashina ma'lumotini o'qish (Gemini
// vision) va motor/korobka/reduktor yog'i tavsiyasini olish. Server-only —
// GEMINI_API_KEY brauzerga chiqmaydi.

const MODEL = 'gemini-3.6-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 45000;

// ICE — oddiy benzin/dizel dvigateli. HYBRID — gibrid/plagin-gibrid: benzin
// dvigateli VA elektr motori BIRGA bor (motor yog'i HAM kerak!). ELECTRIC —
// to'liq elektromobil, ichki yonuv dvigateli UMUMAN yo'q (faqat reduktor).
export type VehicleType = 'ICE' | 'HYBRID' | 'ELECTRIC';

export interface RecognizedCar {
  brand: string;
  model: string;
  plateNumber: string;
  vin: string;
  vehicleType: VehicleType;
  found: boolean;
}

export interface OilRecommendation {
  motorYogTuri: string | null;
  motorLitr: number | null;
  korobkaYogTuri: string | null;
  korobkaLitr: number | null;
  reduktorYogTuri: string | null;
  reduktorLitr: number | null;
  izoh: string;
}

function normalizeVehicleType(v: any): VehicleType {
  const s = String(v || '').toUpperCase();
  return s === 'HYBRID' || s === 'ELECTRIC' ? s : 'ICE';
}

const RETRY_STATUSES = new Set([429, 503]);

async function callGeminiOnce(apiKey: string, parts: any[], responseSchema: any) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const err: any = new Error(`Gemini xatosi (${res.status}): ${errText.slice(0, 300)}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini bo'sh javob qaytardi");
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

// Gemini vaqti-vaqti bilan "high demand" (503) yoki rate-limit (429) qaytaradi —
// bular vaqtinchalik, shuning uchun 1 marta qisqa kutib qayta urinamiz.
async function callGemini(parts: any[], responseSchema: any) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY sozlanmagan (.env.local'ga qo'shing)");

  try {
    return await callGeminiOnce(apiKey, parts, responseSchema);
  } catch (e: any) {
    if (!RETRY_STATUSES.has(e?.status)) throw e;
    await new Promise((r) => setTimeout(r, 1500));
    return await callGeminiOnce(apiKey, parts, responseSchema);
  }
}

const RECOGNIZE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    brand: { type: 'STRING', description: "Avtomobil ishlab chiqaruvchisi, masalan: Chevrolet, Kia, Hyundai, BYD, Lada, Porsche. Faqat marka, model emas." },
    model: { type: 'STRING', description: 'Model nomi, ishlab chiqaruvchisiz, qisqa va standart shaklda. Masalan: Cobalt, Cerato, Tucson, Nexia 3, Panamera.' },
    plateNumber: { type: 'STRING', description: "Davlat raqami, bo'shliqsiz, katta harflarda. Masalan: 01A123AA. Aniq o'qilmasa bo'sh qator." },
    vin: { type: 'STRING', description: "Shassi (VIN) raqami, odatda 17 ta belgi. Aniq o'qilmasa bo'sh qator." },
    vehicleType: {
      type: 'STRING',
      enum: ['ICE', 'HYBRID', 'ELECTRIC'],
      description:
        "Dvigatel turi. ICE = oddiy benzin/dizel dvigateli (gibrid/elektr belgisi yo'q). " +
        "HYBRID = gibrid yoki plagin-gibrid (masalan koreyscha '하이브리드', 'E-하이브리드', 'PHEV', 'Hybrid' so'zi bor) — " +
        "BUNDA HAM benzin dvigateli bor, faqat elektr motor bilan birga ishlaydi. " +
        "ELECTRIC = FAQAT to'liq elektromobil, ichki yonuv dvigateli UMUMAN yo'q (masalan 'EV', 'Electric', '전기차' — 'hybrid' so'zisiz).",
    },
    found: { type: 'BOOLEAN', description: "Rasmda mashina texpasporti/birkasi aniq o'qildimi (marka va model ishonchli aniqlandimi)." },
  },
  required: ['brand', 'model', 'plateNumber', 'vin', 'vehicleType', 'found'],
};

export async function recognizeCarPhoto(base64Data: string, mimeType: string): Promise<RecognizedCar> {
  const prompt =
    "Bu avtomobil texnik pasporti yoki VIN/ishlab chiqaruvchi birkasi rasmi (o'zbekcha, ruscha, koreyscha yoki " +
    "boshqa tildagi bo'lishi mumkin — kerak bo'lsa tarjima qilib o'qi). Undagi mashina ma'lumotlarini aniq o'qib, " +
    'so\'ralgan JSON formatda qaytar. Agar biror maydon aniq o\'qilmasa — bo\'sh qator ("") qo\'y, o\'ylab topma. ' +
    "Marka va modelni standart lotin harflarida yoz. vehicleType'ni AYNIQSA ehtiyotkorlik bilan aniqla — " +
    "'gibrid'/'hybrid' so'zi bo'lsa ELECTRIC emas, HYBRID deb belgila (chunki gibridda ham benzin dvigateli bor).";
  const out = await callGemini(
    [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }],
    RECOGNIZE_SCHEMA
  );
  return {
    brand: String(out.brand || '').trim(),
    model: String(out.model || '').trim(),
    plateNumber: String(out.plateNumber || '').trim().toUpperCase().replace(/\s+/g, ''),
    vin: String(out.vin || '').trim().toUpperCase().replace(/\s+/g, ''),
    vehicleType: normalizeVehicleType(out.vehicleType),
    found: !!out.found,
  };
}

const RECOMMEND_SCHEMA = {
  type: 'OBJECT',
  properties: {
    motorYogTuri: { type: 'STRING', description: "Motor yog'i turi/vyazkosti, masalan: 5W-30 sintetik. To'liq elektromobil bo'lsa bo'sh qator." },
    motorLitr: { type: 'NUMBER', description: "Motorga ketadigan yog' hajmi, litrda. To'liq elektromobil bo'lsa 0." },
    korobkaYogTuri: { type: 'STRING', description: "Korobka/transmissiya yog'i turi, masalan: ATF yoki 75W-90. To'liq elektromobilda odatda bo'lmaydi — bo'sh qoldir." },
    korobkaLitr: { type: 'NUMBER', description: "Korobkaga ketadigan yog' hajmi, litrda. To'liq elektromobil bo'lsa 0." },
    reduktorYogTuri: { type: 'STRING', description: "FAQAT to'liq elektromobil bo'lsa: reduktor (bitta uzatmali reduktor/differensial) yog'i turi. Aks holda bo'sh qator." },
    reduktorLitr: { type: 'NUMBER', description: "FAQAT to'liq elektromobil bo'lsa: reduktorga ketadigan yog' hajmi, litrda. Aks holda 0." },
    izoh: { type: 'STRING', description: "Qisqa eslatma, masalan aniq motor hajmi noma'lumligi haqida (1 gap, o'zbek tilida)." },
  },
  required: ['motorYogTuri', 'motorLitr', 'korobkaYogTuri', 'korobkaLitr', 'izoh'],
};

export async function recommendOil(brand: string, model: string, vehicleType: VehicleType): Promise<OilRecommendation> {
  const situationPrompt =
    vehicleType === 'ELECTRIC'
      ? "Bu TO'LIQ ELEKTROMOBIL — ichki yonuv dvigateli UMUMAN yo'q. Motor yog'i VA korobka yog'i KERAK EMAS " +
        "(ikkalasini ham bo'sh/0 qoldir). Faqat reduktor (bitta uzatmali reduktor/differensial) yog'i turi va hajmini ko'rsat."
      : vehicleType === 'HYBRID'
        ? "Bu GIBRID (yoki plagin-gibrid) avtomobil — benzin dvigateli VA elektr motori BIRGA ishlaydi. " +
          "Motor yog'i (ICE dvigateli uchun, ko'pincha past vyazkosti, masalan 0W-20) VA korobka/transmissiya " +
          "(gibrid transaksle) yog'ini tavsiya ber. Reduktor KERAK EMAS (bo'sh qoldir)."
        : "Bu oddiy ICE (ichki yonuv dvigateli) avtomobil — motor yog'i va korobka (uzatmalar qutisi, avtomat yoki " +
          "mexanika, modelga qarab) yog'i turi va hajmini ko'rsat. Reduktor KERAK EMAS (bo'sh qoldir).";
  const prompt =
    `Tajribali avtomexanik sifatida "${brand} ${model}" avtomobili uchun tavsiya ber. ${situationPrompt} ` +
    'Eng ko\'p tarqalgan/standart komplektatsiya bo\'yicha taxminiy hajmlarni ber (litr, o\'nlik kasr bilan). ' +
    "JSON formatda, so'ralgan sxema bo'yicha javob ber.";
  const out = await callGemini([{ text: prompt }], RECOMMEND_SCHEMA);
  const isElectric = vehicleType === 'ELECTRIC';
  return {
    motorYogTuri: isElectric ? null : String(out.motorYogTuri || '').trim() || null,
    motorLitr: isElectric ? null : Number(out.motorLitr) || null,
    korobkaYogTuri: isElectric ? null : String(out.korobkaYogTuri || '').trim() || null,
    korobkaLitr: isElectric ? null : Number(out.korobkaLitr) || null,
    reduktorYogTuri: isElectric ? String(out.reduktorYogTuri || '').trim() || null : null,
    reduktorLitr: isElectric ? Number(out.reduktorLitr) || null : null,
    izoh: String(out.izoh || '').trim(),
  };
}
