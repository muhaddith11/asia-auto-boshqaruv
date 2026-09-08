'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Loader2, Sparkles, Droplet, Cog, Zap, X, Aperture } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Identity,
  OilScanRecognized,
  OilScanRecommendation,
  OilRecommendationSnapshot,
  scanOilCar,
  compressImageFile,
} from './botClient';

interface Props {
  identity: Identity;
  catalog: any;
  onApply: (info: { brand: string; model: string; plateNumber: string }, snapshot: OilRecommendationSnapshot) => void;
}

// Katalogdagi eng yaqin brand/model nomini topadi (dropdown to'g'ri tanlansin
// deb) — topilmasa AI o'qigan xom matn qoladi (foydalanuvchi qo'lda tuzatadi).
function matchCatalog(catalog: any, rawBrand: string, rawModel: string) {
  const brands: string[] = catalog?.brands || [];
  const b = rawBrand.toLowerCase();
  const foundBrand =
    brands.find((x) => x.toLowerCase() === b) ||
    brands.find((x) => b.includes(x.toLowerCase()) || x.toLowerCase().includes(b));
  if (!foundBrand) return { brand: rawBrand, model: rawModel };
  const models: string[] = Object.keys(catalog?.catalog?.[foundBrand] || {});
  const m = rawModel.toLowerCase();
  const foundModel =
    models.find((x) => x.toLowerCase() === m) ||
    models.find((x) => m.includes(x.toLowerCase()) || x.toLowerCase().includes(m));
  return { brand: foundBrand, model: foundModel || rawModel };
}

export default function OilScanCard({ identity, catalog, onApply }: Props) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ recognized: OilScanRecognized; recommendation: OilScanRecommendation } | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Jonli kamera (getUserMedia) — fayl input'dagi `capture` atributi ba'zi
  // WebView'larda (masalan Telegram ilovasi ichida) e'tiborga olinmay,
  // to'g'ridan-to'g'ri galereyani ochib yuboradi. Shuning uchun kamerani
  // sahifa ichida o'zimiz ochamiz — bu ancha ishonchli.
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
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
      toast.error("Kameraga ruxsat berilmadi — galereyadan tanlang");
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
    const maxDim = 1280;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > maxDim || h > maxDim) {
      if (w >= h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    closeCamera();
    processDataUrl(dataUrl);
  };

  const processDataUrl = async (dataUrl: string) => {
    setScanning(true);
    setResult(null);
    try {
      const res = await scanOilCar(identity, dataUrl);
      if (!res.ok || !res.recognized || !res.recommendation) {
        toast.error(res.error || "Aniqlab bo'lmadi, qo'lda kiriting");
        return;
      }
      setResult({ recognized: res.recognized, recommendation: res.recommendation });
      const matched = matchCatalog(catalog, res.recognized.brand, res.recognized.model);
      onApply(
        { brand: matched.brand, model: matched.model, plateNumber: res.recognized.plateNumber },
        {
          vin: res.recognized.vin,
          vehicleType: res.recognized.vehicleType,
          motorYogTuri: res.recommendation.motorYogTuri,
          motorLitr: res.recommendation.motorLitr,
          korobkaYogTuri: res.recommendation.korobkaYogTuri,
          korobkaLitr: res.recommendation.korobkaLitr,
          reduktorYogTuri: res.recommendation.reduktorYogTuri,
          reduktorLitr: res.recommendation.reduktorLitr,
          izoh: res.recommendation.izoh,
        }
      );
      toast.success(res.fromCache ? 'Tavsiya topildi (avval saqlangan) ✅' : 'AI tavsiyasi tayyor ✅');
    } catch (e: any) {
      toast.error(e?.message || 'Xatolik yuz berdi');
    } finally {
      setScanning(false);
    }
  };

  const handleGalleryFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    // Kichikroq o'lcham — mobil internetda tezroq yuklanadi, AI ham tezroq javob beradi.
    const dataUrl = await compressImageFile(file, 1280, 0.8);
    processDataUrl(dataUrl);
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
        <Sparkles className="w-3.5 h-3.5" /> AI bilan tanish
        {scanning && <span className="text-amber-200/60 font-normal">— tekshiryapti...</span>}
      </div>

      {cameraOpen ? (
        <div className="rounded-xl overflow-hidden border border-amber-500/40 bg-black relative">
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
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 border-amber-400 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Aperture className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={scanning}
            onClick={openCamera}
            className="flex-1 py-2.5 rounded-xl flex justify-center items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-bold transition-colors disabled:opacity-60"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            Suratga olish
          </button>
          <button
            type="button"
            disabled={scanning}
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

      {result && (
        <div className="rounded-xl bg-gray-900/60 border border-gray-700/60 p-3 space-y-2.5 mt-1">
          <div className="text-xs text-gray-400">
            {result.recognized.brand} {result.recognized.model}
            {result.recognized.plateNumber && <> · {result.recognized.plateNumber}</>}
            {result.recognized.vehicleType !== 'ICE' && (
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                {result.recognized.vehicleType === 'ELECTRIC' ? '🔋 Elektromobil' : '⚡ Gibrid'}
              </span>
            )}
            {result.recognized.vin && (
              <div className="mt-0.5">
                Shassi (VIN): <span className="text-gray-300 font-mono">{result.recognized.vin}</span>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {result.recognized.vehicleType !== 'ELECTRIC' && (
              <>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="flex items-center gap-1.5 text-gray-300 shrink-0">
                    <Droplet className="w-3.5 h-3.5 text-amber-400" /> Motor
                  </span>
                  <span className="font-semibold text-white text-right">
                    {result.recommendation.motorYogTuri || '—'}
                    {result.recommendation.motorLitr ? <> · {result.recommendation.motorLitr} L</> : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="flex items-center gap-1.5 text-gray-300 shrink-0">
                    <Cog className="w-3.5 h-3.5 text-blue-400" /> Korobka
                  </span>
                  <span className="font-semibold text-white text-right">
                    {result.recommendation.korobkaYogTuri || '—'}
                    {result.recommendation.korobkaLitr ? <> · {result.recommendation.korobkaLitr} L</> : ''}
                  </span>
                </div>
              </>
            )}
            {result.recognized.vehicleType === 'ELECTRIC' && (
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="flex items-center gap-1.5 text-gray-300 shrink-0">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Reduktor
                </span>
                <span className="font-semibold text-white text-right">
                  {result.recommendation.reduktorYogTuri || '—'}
                  {result.recommendation.reduktorLitr ? <> · {result.recommendation.reduktorLitr} L</> : ''}
                </span>
              </div>
            )}
          </div>
          {result.recommendation.izoh && (
            <p className="text-[11px] text-gray-500 leading-relaxed pt-1 border-t border-gray-800">
              {result.recommendation.izoh}
            </p>
          )}
          <p className="text-[10px] text-amber-200/50">⚠️ Taxminiy AI tavsiyasi — texnik xususiyatlarni tekshiring.</p>
        </div>
      )}
    </div>
  );
}
