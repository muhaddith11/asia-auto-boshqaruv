'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Identity, CarScanResponse, scanCarPhoto } from './botClient';
import CameraCapture from './CameraCapture';

interface Props {
  identity: Identity;
  catalog: any;
  // Faqat aniqlangan maydonlar keladi — topilmaganlari formada o'zgarmaydi.
  onApply: (info: { brand?: string; model?: string; plateNumber?: string }) => void;
  // Raqam o'qilmasa — formadagi raqam maydoniga fokus berish uchun.
  onPlateMissing?: () => void;
}

// Mashinani bir marta suratga olish → AI marka, model va davlat raqamini
// formaga o'zi yozadi. Saqlamaydi — xodim tekshirib "Qabul qildim" bosadi.
export default function CarScanCard({ identity, catalog, onApply, onPlateMissing }: Props) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<CarScanResponse | null>(null);

  const processDataUrl = async (dataUrl: string) => {
    setScanning(true);
    setResult(null);
    try {
      const res = await scanCarPhoto(identity, dataUrl, catalog);
      if (!res.ok) {
        toast.error(res.error || "Aniqlab bo'lmadi, qo'lda kiriting");
        return;
      }
      setResult(res);

      const patch: { brand?: string; model?: string; plateNumber?: string } = {};
      if (res.brand) {
        patch.brand = res.brand;
        patch.model = res.model || ''; // model topilmasa eski markaning modeli qolib ketmasin
      }
      if (res.plateNumber) patch.plateNumber = res.plateNumber;
      onApply(patch);

      const seen = [res.seenBrand, res.seenModel].filter(Boolean).join(' ');
      if (!res.brand) {
        toast(`Katalogda topilmadi${seen ? `: ${seen}` : ''} — marka/modelni qo'lda tanlang`, { icon: '⚠️' });
      } else if (!res.model) {
        toast(`Model katalogda topilmadi${seen ? ` (${seen})` : ''} — qo'lda tanlang`, { icon: '⚠️' });
      }
      if (!res.plateNumber) {
        toast("Mashina raqami o'qilmadi — qo'lda kiriting", { icon: '⌨️' });
        onPlateMissing?.();
      }
      if (res.brand && res.model && res.plateNumber) {
        toast.success("To'ldirildi — tekshirib «Qabul qildim»ni bosing");
      }
    } catch (e: any) {
      toast.error(e?.message || "Server bilan bog'lanishda xatolik");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
        <Sparkles className="w-3.5 h-3.5" /> AI bilan to&apos;ldirish
        {scanning && <span className="text-blue-200/60 font-normal">— aniqlayapti...</span>}
      </div>
      {!result && !scanning && (
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Mashinani old yoki orqa tomonidan, raqami ko&apos;rinadigan qilib suratga oling — marka, model va raqam o&apos;zi
          yoziladi.
        </p>
      )}

      <CameraCapture busy={scanning} onPhoto={processDataUrl} tone="blue" />

      {result && (
        <div className="text-[11px] text-gray-400">
          AI ko&apos;rdi:{' '}
          <span className="text-gray-200 font-semibold">
            {[result.seenBrand, result.seenModel].filter(Boolean).join(' ') || '—'}
          </span>
          {result.plateNumber && (
            <>
              {' · '}
              <span className="text-gray-200 font-mono">{result.plateNumber}</span>
            </>
          )}
          <span className="block text-blue-200/50 mt-0.5">⚠️ Tekshiring — xato bo&apos;lsa pastda tuzating.</span>
        </div>
      )}
    </div>
  );
}
