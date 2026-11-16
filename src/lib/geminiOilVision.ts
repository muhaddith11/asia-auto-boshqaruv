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

// Bir nechta bepul (free-tier) kalit — har biri O'Z loyihasining alohida
// kvotasiga ega, shuning uchun biri limitga yetsa keyingisiga o'tiladi.
// GEMINI_API_KEYS="kalit1,kalit2,..." (vergul bilan) — bo'lmasa yagona
// GEMINI_API_KEY'ga qaytadi (eski sozlash bilan moslik uchun).
function getApiKeys(): string[] {
  // Vergul YOKI yangi qator bilan ajratilgan bo'lishi mumkin (masalan Vercel
  // env qutisiga joylashtirishda tasodifan qator ko'chishi bo'lsa ham ishlasin).
  const multi = (process.env.GEMINI_API_KEYS || '')
    .split(/[,\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (multi.length) return multi;
  const single = (process.env.GEMINI_API_KEY || '').trim();
  return single ? [single] : [];
}

// Har bir chaqiruvda boshqa kalitdan boshlanadi (round-robin) — shunda
// kvota bir kalitga to'planib qolmay, hammasi bo'ylab tekis taqsimlanadi.
let rrIndex = 0;

async function callGeminiOnce(
  apiKey: string,
  parts: any[],
  responseSchema: any,
  timeoutMs = TIMEOUT_MS,
  extraConfig?: Record<string, any>,
  outerSignal?: AbortSignal,
  model = MODEL
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  // Tashqi signal (parallel urinishlardan biri yutganda qolganlarini to'xtatish uchun).
  if (outerSignal) {
    if (outerSignal.aborted) controller.abort();
    else outerSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  try {
    const res = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema,
          ...extraConfig,
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

// Har bir kalitda XATO TURIDAN QAT'IY NAZAR keyingisiga o'tamiz — nafaqat
// limit (429/503), balki noto'g'ri/yaroqsiz kalit (401/403, masalan xato
// nusxalangan) bo'lsa ham. Shunday qilib, ro'yxatda BITTA yaroqli kalit
// bo'lsa ham funksiya ishlayveradi — bitta xato kalit hammasini buzmaydi.
// Boshqa AI funksiyalar (masalan geminiCarVision) ham shu kalit aylantirishdan foydalanadi.
//
// `totalTimeoutMs` — barcha urinishlar uchun UMUMIY vaqt chegarasi. Google
// serverlari yuklangan paytda har bir kalit 45s gacha osilib qolishi mumkin
// (7 kalit × 45s = 5 daqiqa!) — xodim telefonda shuncha kutmasligi uchun.
//
// `generationConfig` — qo'shimcha sozlamalar (masalan thinkingConfig).
// `hedgeAfterMs` — berilsa, javob shu vaqt ichida kelmasa KEYINGI kalit bilan
// parallel ikkinchi so'rov yuboriladi va qaysi biri oldin javob bersa o'sha
// olinadi (Google ba'zan sababsiz 45–60 s osilib qoladi, odatiy javob 1–2 s).
//
// `models` (faqat hedgeAfterMs bilan) — tartiblangan modellar ro'yxati. Har bir
// kalitda avval birinchi model, keyin zaxiralar sinaladi. Google bitta modelni
// "high demand" (503) yoki osilib qolish bilan to'xtatib qo'ysa (2026-11-16: 3.6
// flash 7 kalitning hammasida 503/timeout, 2.5 flash esa 1 s da javob berdi) —
// keyingi urinish BOSHQA model bilan ketadi. Kvota ham har model uchun alohida.
export interface GeminiModelChoice {
  model: string;
  generationConfig?: Record<string, any>;
}

export interface CallGeminiOptions {
  totalTimeoutMs?: number;
  generationConfig?: Record<string, any>;
  hedgeAfterMs?: number;
  attemptTimeoutMs?: number; // bitta urinish uchun chegara (standart 45 s)
  models?: GeminiModelChoice[];
}

interface GeminiAttempt {
  key: string;
  model: string;
  generationConfig?: Record<string, any>;
}

export async function callGemini(parts: any[], responseSchema: any, opts?: CallGeminiOptions) {
  const keys = getApiKeys();
  if (!keys.length) throw new Error("GEMINI_API_KEY sozlanmagan (.env.local'ga qo'shing)");

  const deadline = opts?.totalTimeoutMs ? Date.now() + opts.totalTimeoutMs : Infinity;
  const start = rrIndex++ % keys.length;
  const attemptMax = opts?.attemptTimeoutMs ?? TIMEOUT_MS;
  if (opts?.hedgeAfterMs) {
    const models: GeminiModelChoice[] = opts.models?.length
      ? opts.models
      : [{ model: MODEL, generationConfig: opts.generationConfig }];
    const attempts: GeminiAttempt[] = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[(start + i) % keys.length];
      for (const m of models) attempts.push({ key, model: m.model, generationConfig: m.generationConfig });
    }
    return callGeminiHedged(attempts, parts, responseSchema, deadline, opts.hedgeAfterMs, attemptMax);
  }
  let lastErr: any;
  for (let i = 0; i < keys.length; i++) {
    const remaining = deadline - Date.now();
    if (remaining < 3000) break; // vaqt tugadi — qolgan kalitlarni sinamaymiz
    const key = keys[(start + i) % keys.length];
    try {
      return await callGeminiOnce(key, parts, responseSchema, Math.min(attemptMax, remaining), opts?.generationConfig);
    } catch (e: any) {
      lastErr = e;
    }
  }
  if (deadline !== Infinity) {
    // Umumiy chegara bor — qo'shimcha kutish/urinish yo'q, darrov xato.
    throw lastErr || new Error('AI javob bermadi (vaqt tugadi)');
  }
  // Hammasi ishlamadi. Agar sabab vaqtinchalik limit (429/503) bo'lsa —
  // bitta so'nggi urinish, qisqa kutib (401 kabi doimiy xatoda kutish
  // foyda bermaydi, shuning uchun darrov xatoni qaytaramiz).
  if (RETRY_STATUSES.has(lastErr?.status)) {
    await new Promise((r) => setTimeout(r, 1500));
    return await callGeminiOnce(keys[start], parts, responseSchema, TIMEOUT_MS, opts?.generationConfig);
  }
  throw lastErr;
}

const MAX_PARALLEL = 3;

// Pog'onali parallel urinishlar: birinchi (kalit, model) bilan boshlaymiz;
// `hedgeAfterMs` ichida javob bo'lmasa yoki urinish xato bersa (429 kvota, 503
// band va h.k.) — darhol keyingisi. Birinchi muvaffaqiyatli javob olinadi,
// qolganlari to'xtatiladi.
function callGeminiHedged(
  attempts: GeminiAttempt[],
  parts: any[],
  responseSchema: any,
  deadline: number,
  hedgeAfterMs: number,
  attemptMax: number
): Promise<any> {
  return new Promise((resolve, reject) => {
    const stopAll = new AbortController();
    let next = 0;
    let inFlight = 0;
    let done = false;
    let lastErr: any;
    let hedgeTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      clearTimeout(hedgeTimer);
      stopAll.abort();
      fn();
    };

    const launch = (fromTimer = false) => {
      if (done) return;
      clearTimeout(hedgeTimer);
      // Bepul kvotani asrash: bir vaqtda ko'pi bilan 3 ta so'rov.
      if (fromTimer && inFlight >= MAX_PARALLEL) {
        hedgeTimer = setTimeout(() => launch(true), hedgeAfterMs);
        return;
      }
      const remaining = deadline - Date.now();
      if (next >= attempts.length || remaining < 3000) {
        // Yangi urinish yo'q — ishlayotganlari tugashini kutamiz.
        if (inFlight === 0) finish(() => reject(lastErr || new Error('AI javob bermadi (vaqt tugadi)')));
        return;
      }
      const a = attempts[next++];
      inFlight++;
      callGeminiOnce(a.key, parts, responseSchema, Math.min(attemptMax, remaining), a.generationConfig, stopAll.signal, a.model)
        .then((out) => finish(() => resolve(out)))
        .catch((e) => {
          inFlight--;
          if (done) return;
          lastErr = e;
          launch(); // xato bo'ldi — kutmasdan keyingi kalit
        });
      hedgeTimer = setTimeout(() => launch(true), hedgeAfterMs); // sekin — parallel yana bitta
    };

    launch();
  });
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
