import { NextRequest, NextResponse } from 'next/server';
import { identifyWorker } from '@/lib/botWorker';
import { recognizeCarPhoto } from '@/lib/geminiOilVision';

export const dynamic = 'force-dynamic';

// Qabulda rasmdan mashinani tanish (marka, model, davlat raqami) — HAR QANDAY
// bo'lim xodimi uchun. Rasm texpasport, birka yoki mashinaning o'zi bo'lishi mumkin.
// Yog' tavsiyasi bu yerda YO'Q (u faqat /oil-scan'da, yog' bo'limi uchun).
// Kirish: JSON { dataUrl, workerPhone, mechanicChatId }. Chiqish: { ok, recognized }.
export async function POST(request: NextRequest) {
  try {
    const { dataUrl, workerPhone, mechanicChatId } = await request.json();

    const worker = await identifyWorker(workerPhone, mechanicChatId);
    if (!worker) {
      return NextResponse.json({ ok: false, error: 'Siz tizimda xodim sifatida topilmadingiz.' }, { status: 403 });
    }

    const match = /^data:([^;]+);base64,(.+)$/.exec(String(dataUrl || ''));
    if (!match) {
      return NextResponse.json({ ok: false, error: "Rasm noto'g'ri formatda" }, { status: 400 });
    }
    const [, mimeType, base64Data] = match;

    const recognized = await recognizeCarPhoto(base64Data, mimeType);
    const hasCar = recognized.found && !!recognized.brand && !!recognized.model;
    // Faqat raqam o'qilgan bo'lsa ham foydali — uni to'ldiramiz, markani xodim tanlaydi.
    if (!hasCar && !recognized.plateNumber) {
      return NextResponse.json({
        ok: false,
        error: "Rasmdan mashinani aniqlab bo'lmadi. Raqami ko'rinadigan qilib yoki texpasportni suratga oling.",
        recognized,
      });
    }
    if (!hasCar) {
      recognized.brand = '';
      recognized.model = '';
    }

    return NextResponse.json({ ok: true, recognized });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e instanceof Error && e.message) || 'Server xatosi' }, { status: 500 });
  }
}
