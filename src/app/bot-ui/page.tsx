'use client';

import { useState, useEffect, useRef } from 'react';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import StepCarInfo from '@/components/bot-ui/StepCarInfo';
import StepServices from '@/components/bot-ui/StepServices';
import StepParts from '@/components/bot-ui/StepParts';
import ReceiptPreview from '@/components/bot-ui/ReceiptPreview';
import { Loader2 } from 'lucide-react';
import TelegramLogin from '@/components/bot-ui/TelegramLogin';

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
    // Check if we have a saved user in localStorage (for browser mode)
    const savedUser = localStorage.getItem('bot_auth_user');
    if (savedUser) {
      setAuthUser(JSON.parse(savedUser));
    }

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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      let workerPhone = '';
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        workerPhone = urlParams.get('phone') || '';
      }

      const mechanicChatId = (typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id : undefined) 
        || webAppRef.current?.initDataUnsafe?.user?.id
        || authUser?.id;
      
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
        throw new Error(resJson.error || "Server xatosi");
      }

      if (webAppRef.current && typeof webAppRef.current.showPopup === 'function') {
        webAppRef.current.showPopup({
          title: 'Muvaffaqiyatli',
          message: 'Chek bot orqali yuborildi va bazaga saqlandi!',
          buttons: [{ type: 'ok' }]
        }, () => {
          webAppRef.current?.close();
        });
      } else {
        alert("Chek yuborildi!");
      }

    } catch (error: any) {
      console.error(error);
      const errMsg = error.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.';
      if (webAppRef.current && typeof webAppRef.current.showAlert === 'function') {
        webAppRef.current.showAlert(errMsg);
      } else {
        alert(errMsg);
      }
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

  // If not in Telegram TMA and no authUser, show login screen
  const isInsideTelegram = typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData?.length > 0;
  
  if (!isInsideTelegram && !authUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <TelegramLogin 
          botName="Asiaautoservice_bot" 
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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Asia Auto Service
        </h1>
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
        {step === 3 && <StepParts onNext={handleNext} onPrev={handlePrev} />}
        {step === 4 && <ReceiptPreview onPrev={handlePrev} onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
      </main>
    </div>
  );
}
