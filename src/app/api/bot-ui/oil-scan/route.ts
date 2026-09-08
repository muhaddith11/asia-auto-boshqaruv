import { NextRequest, NextResponse } from 'next/server';
import { identifyWorker } from '@/lib/botWorker';
import { normalizeBolim } from '@/lib/departments';
import { recognizeCarPhoto, recommendOil } from '@/lib/geminiOilVision';
import { getCachedOilRecommendation, saveOilRecommendation } from '@/lib/oilRecommendationsRepo';

export const dynamic = 'force-dynamic';

// Texpasport/birka rasmidan mashinani tanish + yog' tavsiyasi.
// Faqat yog' bo'limi xodimi (yoki boshliq) — Kirish: JSON { dataUrl, workerPhone, mechanicChatId }.
// Chiqish: { ok, recognized, recommendation, fromCache }.
export async function POST(request: NextRequest) {
  try {
    const { dataUrl, workerPhone, mechanicChatId } = await request.json();

    const worker = await identifyWorker(workerPhone, mechanicChatId);
    if (!worker) {
      return NextResponse.json({ ok: false, error: 'Siz tizimda xodim sifatida topilmadingiz.' }, { status: 403 });
    }
    if (!worker.is_boss && normalizeBolim(worker.bolim) !== 'yog') {
      return NextResponse.json({ ok: false, error: "Bu funksiya faqat yog' bo'limi uchun." }, { status: 403 });
    }

    const match = /^data:([^;]+);base64,(.+)$/.exec(String(dataUrl || ''));
    if (!match) {
      return NextResponse.json({ ok: false, error: "Rasm noto'g'ri formatda" }, { status: 400 });
    }
    const [, mimeType, base64Data] = match;

    const recognized = await recognizeCarPhoto(base64Data, mimeType);
    if (!recognized.found || !recognized.brand || !recognized.model) {
      return NextResponse.json({
        ok: false,
        error: "Rasmda mashina ma'lumotini aniqlab bo'lmadi. Aniqroq rasmga oling yoki qo'lda kiriting.",
        recognized,
      });
    }

    let fromCache = true;
    let recommendation = await getCachedOilRecommendation(recognized.brand, recognized.model);
    if (!recommendation) {
      fromCache = false;
      const rec = await recommendOil(recognized.brand, recognized.model, recognized.isElectric);
      recommendation = await saveOilRecommendation(recognized.brand, recognized.model, recognized.isElectric, rec);
    }

    return NextResponse.json({ ok: true, recognized, recommendation, fromCache });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server xatosi' }, { status: 500 });
  }
}
