// Yog' bo'limi: texpasport/birka rasmidan mashina ma'lumotini o'qish (Gemini
// vision) va motor/korobka/reduktor yog'i tavsiyasini olish. Server-only —
// GEMINI_API_KEY brauzerga chiqmaydi.

const MODEL = 'gemini-3.6-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 45000;

export interface RecognizedCar {
  brand: string;
  model: string;
  plateNumber: string;
  vin: string;
  isElectric: boolean;
  found: boolean;
}

export interface OilRecommendation {
  motorYogTuri: string;
  motorLitr: number | null;
  korobkaYogTuri: string;
  korobkaLitr: number | null;
  reduktorYogTuri: string | null;
  reduktorLitr: number | null;
  izoh: string;
}

async function callGemini(parts: any[], responseSchema: any) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY sozlanmagan (.env.local'ga qo'shing)");

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
      throw new Error(`Gemini xatosi (${res.status}): ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini bo'sh javob qaytardi");
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

const RECOGNIZE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    brand: { type: 'STRING', description: "Avtomobil ishlab chiqaruvchisi, masalan: Chevrolet, Kia, Hyundai, BYD, Lada. Faqat marka, model emas." },
    model: { type: 'STRING', description: 'Model nomi, ishlab chiqaruvchisiz, qisqa va standart shaklda. Masalan: Cobalt, Cerato, Tucson, Nexia 3.' },
    plateNumber: { type: 'STRING', description: "Davlat raqami, bo'shliqsiz, katta harflarda. Masalan: 01A123AA. Aniq o'qilmasa bo'sh qator." },
    vin: { type: 'STRING', description: "Shassi (VIN) raqami, odatda 17 ta belgi. Aniq o'qilmasa bo'sh qator." },
    isElectric: { type: 'BOOLEAN', description: "Hujjatda dvigatel turi elektr yoki gibrid (elektromobil) ekanligi ko'rsatilganmi." },
    found: { type: 'BOOLEAN', description: "Rasmda mashina texpasporti/birkasi aniq o'qildimi (marka va model ishonchli aniqlandimi)." },
  },
  required: ['brand', 'model', 'plateNumber', 'vin', 'isElectric', 'found'],
};

export async function recognizeCarPhoto(base64Data: string, mimeType: string): Promise<RecognizedCar> {
  const prompt =
    "Bu O'zbekistondagi avtomobil texnik pasporti yoki birkasi rasmi. Undagi mashina ma'lumotlarini " +
    'aniq o\'qib, so\'ralgan JSON formatda qaytar. Agar biror maydon aniq o\'qilmasa — bo\'sh qator ("") ' +
    "qo'y, o'ylab topma. Marka va modelni standart lotin harflarida yoz.";
  const out = await callGemini(
    [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }],
    RECOGNIZE_SCHEMA
  );
  return {
    brand: String(out.brand || '').trim(),
    model: String(out.model || '').trim(),
    plateNumber: String(out.plateNumber || '').trim().toUpperCase().replace(/\s+/g, ''),
    vin: String(out.vin || '').trim().toUpperCase().replace(/\s+/g, ''),
    isElectric: !!out.isElectric,
    found: !!out.found,
  };
}

const RECOMMEND_SCHEMA = {
  type: 'OBJECT',
  properties: {
    motorYogTuri: { type: 'STRING', description: "Motor yog'i turi/vyazkosti, masalan: 5W-30 sintetik" },
    motorLitr: { type: 'NUMBER', description: "Motorga ketadigan yog' hajmi, litrda (masalan 3.5)" },
    korobkaYogTuri: { type: 'STRING', description: "Korobka (uzatmalar qutisi) yog'i turi, masalan: ATF yoki 75W-90" },
    korobkaLitr: { type: 'NUMBER', description: "Korobkaga ketadigan yog' hajmi, litrda" },
    reduktorYogTuri: { type: 'STRING', description: "FAQAT elektromobil bo'lsa: reduktor yog'i turi. Aks holda bo'sh qator." },
    reduktorLitr: { type: 'NUMBER', description: "FAQAT elektromobil bo'lsa: reduktorga ketadigan yog' hajmi, litrda. Aks holda 0." },
    izoh: { type: 'STRING', description: "Qisqa eslatma, masalan aniq motor hajmi noma'lumligi haqida (1 gap, o'zbek tilida)." },
  },
  required: ['motorYogTuri', 'motorLitr', 'korobkaYogTuri', 'korobkaLitr', 'izoh'],
};

export async function recommendOil(brand: string, model: string, isElectric: boolean): Promise<OilRecommendation> {
  const prompt =
    `Tajribali avtomexanik sifatida "${brand} ${model}" avtomobili uchun tavsiya ber. ` +
    (isElectric
      ? "Bu ELEKTROMOBIL — motor yog'i o'rniga mos elektr dvigatel/transmissiya moylash tavsiyasini ber, " +
        "shuningdek reduktor (bitta uzatmali reduktor) yog'i turi va hajmini ham ko'rsat."
      : "Bu ICE (ichki yonuv dvigateli) avtomobil — motor yog'i va korobka (uzatmalar qutisi, avtomat yoki mexanika, " +
        "modelga qarab) yog'i turi va hajmini ko'rsat.") +
    ' Eng ko\'p tarqalgan/standart komplektatsiya bo\'yicha taxminiy hajmlarni ber (litr, o\'nlik kasr bilan). ' +
    "JSON formatda, so'ralgan sxema bo'yicha javob ber.";
  const out = await callGemini([{ text: prompt }], RECOMMEND_SCHEMA);
  return {
    motorYogTuri: String(out.motorYogTuri || '').trim(),
    motorLitr: Number(out.motorLitr) || null,
    korobkaYogTuri: String(out.korobkaYogTuri || '').trim(),
    korobkaLitr: Number(out.korobkaLitr) || null,
    reduktorYogTuri: isElectric ? String(out.reduktorYogTuri || '').trim() || null : null,
    reduktorLitr: isElectric ? Number(out.reduktorLitr) || null : null,
    izoh: String(out.izoh || '').trim(),
  };
}
