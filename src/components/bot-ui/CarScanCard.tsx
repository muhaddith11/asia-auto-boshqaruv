'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Identity, scanCarPhoto } from './botClient';
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

  const processDataUrl = async (dataUrl: string) => {
    setScanning(true);
    try {
      const res = await scanCarPhoto(identity, dataUrl, catalog);
      if (!res.ok) {
        toast.error(res.error || "Aniqlab bo'lmadi, qo'lda kiriting");
        return;
      }

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

  // Faqat ikkita tugma (Suratga olish / Galereyadan) — sarlavha va izoh matni
  // yo'q. Natija toast'larda chiqadi, aniqlash paytida tugmada spinner aylanadi.
  return <CameraCapture busy={scanning} onPhoto={processDataUrl} tone="blue" />;
}
