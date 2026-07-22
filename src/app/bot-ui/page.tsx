'use client';
import toast from 'react-hot-toast';

import { useState, useEffect, useRef } from 'react';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import StepCarInfo from '@/components/bot-ui/StepCarInfo';
import StepServices from '@/components/bot-ui/StepServices';
import StepParts from '@/components/bot-ui/StepParts';
import ReceiptPreview from '@/components/bot-ui/ReceiptPreview';
import { Loader2 } from 'lucide-react';
import PhoneLogin from '@/components/bot-ui/PhoneLogin';

export default function BotUIPage() {
  const [step, setStep] = useState(1);
  const [catalogData, setCatalogData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const store = useBotOrderStore();
  const webAppRef = useRef<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bot_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Yangi oqim: telefon raqami bilan kirish. Eski (Telegram widget) keshda
        // phone bo'lmaydi — uni bekor qilamiz, xodim raqamini qayta kiritadi.
        if (parsed && parsed.phone) {
          setAuthUser(parsed);
        } else {
          localStorage.removeItem('bot_auth_user');
        }
      } catch (e) {
        localStorage.removeItem('bot_auth_user');
      }
    }
    setLoading(false);

    (async () => {
      try {
        const mod = await import('@twa-dev/sdk');
        const WebApp = mod?.default || mod;
        webAppRef.current = WebApp;
        if (WebApp && typeof WebApp.ready === 'function') {
          WebApp.ready();
          WebApp.expand();
          WebApp.setHeaderColor('secondary_bg_color');
        }
      } catch(err) {
        console.warn("Telegram WebApp API is not available locally.");
      }

      try {
        const res = await fetch(`/api/bot-ui/catalog?t=${Date.now()}`);
        const data = await res.json();
        if (data.error) setError(data.error);
        if (data.isFallback) console.warn("Using fallback catalog data due to error.");
        setCatalogData(data);
      } catch (err: any) {
        console.error("Catalog fetch error:", err);
        setError(err.message);
        setCatalogData({ brands: ['Chevrolet', 'Kia', 'Hyundai', 'BYD', 'Lada'], catalog: { } });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);
  const handleLogout = () => {
    localStorage.removeItem('bot_auth_user');
    setAuthUser(null);
    setStep(1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      let workerPhone = '';
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        workerPhone = urlParams.get('phone') || '';
      }
      // Telegram tugmasi orqali — raqam URL'da (?phone=). Brauzerda — kirishda
      // kiritilgan raqam (authUser.phone). Xodim shu raqam bo'yicha tanaladi.
      if (!workerPhone) workerPhone = authUser?.phone || '';

      // mechanicChatId — faqat chekni Telegram'da yuborish uchun. Tanish uchun EMAS.
      // Telegram ichida — foydalanuvchi id'si; brauzerda — bazadagi telegram id (bo'lsa).
      const tgUserId = (typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id : undefined)
        || webAppRef.current?.initDataUnsafe?.user?.id;
      const mechanicChatId = tgUserId || authUser?.telegram || undefined;
      
      const payload = {
        brand: store.brand,
        model: store.model,
        probeg: store.probeg,
        plateNumber: store.plateNumber,
        services: store.services,
        parts: store.parts,
        mechanicChatId,
        workerPhone
      };

      const res = await fetch('/api/bot-ui/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const resJson = await res.json().catch(()=>({}));
      
      if (!res.ok) {
        throw new Error(resJson.error || `Server xatosi: ${res.status}`);
      }

      const successMsg = `Muvaffaqiyatli! Chek id: #${resJson.id}`;
      
      if (isInsideTelegram && webAppRef.current && typeof webAppRef.current.showPopup === 'function') {
        webAppRef.current.showPopup({
          title: 'Muvaffaqiyatli',
          message: successMsg,
          buttons: [{ type: 'ok' }]
        }, () => {
          webAppRef.current?.close();
        });
      } else {
        toast.success(successMsg);
      }

    } catch (error: any) {
      console.error(error);
      const errMsg = error.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.';
      toast.error("XATOLIK: " + errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-900 text-white min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Telegram mini app aniqlash — ISHONCHLI, SINXRON signallar bilan.
  // initData faqat async @twa-dev/sdk yuklangach to'ladi (poyga xavfi), shuning
  // uchun Telegram URL'ga qo'shadigan hash (#tgWebAppData=...) ni ham tekshiramiz.
  const isInsideTelegram = typeof window !== 'undefined' && (
    (window as any).Telegram?.WebApp?.initData?.length > 0 ||
    window.location.hash.includes('tgWebAppData') ||
    window.location.hash.includes('tgWebAppVersion')
  );
  // Bot tugmasi doim ?phone= qo'shadi — bu bo'lsa, kim ekani aniq, login kerak emas.
  const hasPhoneParam = typeof window !== 'undefined'
    && !!new URLSearchParams(window.location.search).get('phone');

  // Faqat brauzerda (Telegram'siz VA raqamsiz VA login qilinmagan) telefon-login.
  if (!isInsideTelegram && !hasPhoneParam && !authUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <PhoneLogin
          onAuth={(user) => {
            setAuthUser(user);
            localStorage.setItem('bot_auth_user', JSON.stringify(user));
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-sans pb-24">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Asia Auto Service
          </h1>
          {authUser && (
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5 transition-colors shrink-0"
            >
              Chiqish
            </button>
          )}
        </div>
        {authUser?.name && (
          <p className="text-sm text-gray-400 mt-1">👤 {authUser.name}</p>
        )}
        {error && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded-lg text-xs text-red-200">
            ⚠️ Diqqat: {error}. Iltimos, qayta yangilang.
          </div>
        )}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-blue-500' : 'bg-gray-700'}`}
            />
          ))}
        </div>
      </header>

      <main>
        {step === 1 && <StepCarInfo catalog={catalogData} onNext={handleNext} />}
        {step === 2 && <StepServices catalog={catalogData} onNext={handleNext} onPrev={handlePrev} />}
        {step === 3 && <StepParts catalog={catalogData} onNext={handleNext} onPrev={handlePrev} />}
        {step === 4 && <ReceiptPreview onPrev={handlePrev} onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
      </main>
    </div>
  );
}
