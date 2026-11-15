'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Loader2, X, Aperture } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImageFile } from './botClient';

// Rasm olish tugmalari: "Suratga olish" (sahifa ichidagi jonli kamera) va
// "Galereyadan". Natija — siqilgan JPEG data URL (max 1280px, 0.8 sifat).
//
// Jonli kamera (getUserMedia) — fayl input'dagi `capture` atributi ba'zi
// WebView'larda (masalan Telegram ilovasi ichida) e'tiborga olinmay,
// to'g'ridan-to'g'ri galereyani ochib yuboradi. Shuning uchun kamerani
// sahifa ichida o'zimiz ochamiz — bu ancha ishonchli.

const MAX_DIM = 1280;
const QUALITY = 0.8;

const TONES = {
  amber: {
    frame: 'border-amber-500/40',
    shutter: 'border-amber-400',
    primary: 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-200',
  },
  blue: {
    frame: 'border-blue-500/40',
    shutter: 'border-blue-400',
    primary: 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/40 text-blue-200',
  },
} as const;

interface Props {
  busy: boolean;
  onPhoto: (dataUrl: string) => void;
  tone?: keyof typeof TONES;
}

export default function CameraCapture({ busy, onPhoto, tone = 'amber' }: Props) {
  const t = TONES[tone];
  const galleryRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopStream(), []);

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Kamera qo'llab-quvvatlanmaydi — galereyadan tanlang");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      toast.error('Kameraga ruxsat berilmadi — galereyadan tanlang');
    }
  };

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOpen]);

  const closeCamera = () => {
    stopStream();
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > MAX_DIM || h > MAX_DIM) {
      if (w >= h) {
        h = Math.round((h * MAX_DIM) / w);
        w = MAX_DIM;
      } else {
        w = Math.round((w * MAX_DIM) / h);
        h = MAX_DIM;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
    closeCamera();
    onPhoto(dataUrl);
  };

  const handleGalleryFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      // Kichikroq o'lcham — mobil internetda tezroq yuklanadi, AI ham tezroq javob beradi.
      onPhoto(await compressImageFile(file, MAX_DIM, QUALITY));
    } catch (e: any) {
      toast.error(e?.message || "Rasmni o'qib bo'lmadi");
    }
  };

  return (
    <>
      {cameraOpen ? (
        <div className={`rounded-xl overflow-hidden border ${t.frame} bg-black relative`}>
          <video ref={videoRef} playsInline muted autoPlay className="w-full h-64 object-cover bg-black" />
          <button
            type="button"
            onClick={closeCamera}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={capturePhoto}
            className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 ${t.shutter} flex items-center justify-center active:scale-95 transition-transform`}
          >
            <Aperture className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={openCamera}
            className={`flex-1 py-2.5 rounded-xl flex justify-center items-center gap-1.5 border ${t.primary} text-xs font-bold transition-colors disabled:opacity-60`}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            Suratga olish
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => galleryRef.current?.click()}
            className="flex-1 py-2.5 rounded-xl flex justify-center items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-bold transition-colors disabled:opacity-60"
          >
            <ImageIcon className="w-4 h-4" /> Galereyadan
          </button>
        </div>
      )}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          handleGalleryFile(e.target.files);
          e.target.value = '';
        }}
      />
    </>
  );
}
