import { NextRequest, NextResponse } from 'next/server';
import { identifyWorker } from '@/lib/botWorker';
import { recognizeCarForCatalog, sanitizeCatalog } from '@/lib/geminiCarVision';

export const dynamic = 'force-dynamic';

// ~1280px JPEG odatda 150–400 KB; base64 bilan ham 4 MB dan oshmasligi kerak.
const MAX_DATA_URL_LEN = 6_000_000;

// Mashina (yoki texpasport) rasmidan marka/model/raqamni AI bilan aniqlash —
// barcha xodimlar uchun (bo'limdan qat'iy nazar).
// Kirish: JSON { dataUrl, catalog: { marka: [modellar] }, workerPhone, mechanicChatId }.
// Chiqish: { ok, found, brand, model, seenBrand, seenModel, plateNumber }.
export async function POST(request: NextRequest) {
  try {
    const { dataUrl, catalog, workerPhone, mechanicChatId } = await request.json();

    const worker = await identifyWorker(workerPhone, mechanicChatId);
    if (!worker) {
      return NextResponse.json({ ok: false, error: 'Siz tizimda xodim sifatida topilmadingiz.' }, { status: 403 });
    }

    const raw = String(dataUrl || '');
    if (raw.length > MAX_DATA_URL_LEN) {
      return NextResponse.json({ ok: false, error: 'Rasm juda katta' }, { status: 413 });
    }
    const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(raw);
    if (!match) {
      return NextResponse.json({ ok: false, error: "Rasm noto'g'ri formatda" }, { status: 400 });
    }
    const [, mimeType, base64Data] = match;

    const result = await recognizeCarForCatalog(base64Data, mimeType, sanitizeCatalog(catalog));
    if (!result.found && !result.plateNumber) {
      return NextResponse.json({
        ok: false,
        error: "Rasmda mashinani aniqlab bo'lmadi. Raqami ko'rinadigan qilib qayta suratga oling yoki qo'lda kiriting.",
      });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    // Google serverlari yuklangan (503 / 429 / vaqt tugadi / tarmoq) — xodimga
    // texnik matn o'rniga tushunarli xabar.
    const busy =
      e?.name === 'AbortError' ||
      e?.status === 503 ||
      e?.status === 429 ||
      /fetch failed|aborted|vaqt tugadi/i.test(String(e?.message || ''));
    if (busy) {
      return NextResponse.json(
        { ok: false, error: "AI hozir band (Google serverlari yuklangan). Birozdan keyin qayta urining yoki qo'lda kiriting." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: false, error: e?.message || 'Server xatosi' }, { status: 500 });
  }
}
