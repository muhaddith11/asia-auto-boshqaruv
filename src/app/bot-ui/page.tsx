'use client';

import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import StepCarInfo from '@/components/bot-ui/StepCarInfo';
import StepServices from '@/components/bot-ui/StepServices';
import StepParts from '@/components/bot-ui/StepParts';
import ReceiptPreview from '@/components/bot-ui/ReceiptPreview';
import { Loader2 } from 'lucide-react';

export default function BotUIPage() {
  const [step, setStep] = useState(1);
  const [catalogData, setCatalogData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const store = useBotOrderStore();

  useEffect(() => {
    try {
      if (WebApp && typeof WebApp.ready === 'function') {
        WebApp.ready();
        WebApp.expand();
        WebApp.setHeaderColor('secondary_bg_color');
      }
    } catch(err) {
      console.warn("Telegram WebApp API is not available locally.");
    }

    // Fetch catalog
    fetch('/api/bot-ui/catalog')
      .then(res => res.json())
      .then(data => {
        setCatalogData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Catalog fetch error:", err);
        setLoading(false);
        setCatalogData({ brands: ['Chevrolet', 'Kia', 'Hyundai', 'BYD', 'Lada'], catalog: { } });
      });
  }, []);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const urlParams = new URLSearchParams(window.location.search);
      let workerPhone = urlParams.get('phone') || '';
      
      const mechanicChatId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || WebApp?.initDataUnsafe?.user?.id;
      
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
      
      if (!res.ok) throw new Error("Server xatosi");

      if (WebApp && typeof WebApp.showPopup === 'function') {
        WebApp.showPopup({
          title: 'Muvaffaqiyatli',
          message: 'Chek bot orqali yuborildi va bazaga saqlandi!',
          buttons: [{ type: 'ok' }]
        }, () => {
          WebApp.close();
        });
      } else {
        alert("Chek yuborildi!");
      }

    } catch (error) {
      console.error(error);
      if (WebApp && typeof WebApp.showAlert === 'function') {
        WebApp.showAlert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      } else {
        alert('Xatolik yuz berdi.');
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-sans pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Asia Auto Service
        </h1>
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
