'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function DataLoader() {
  const { loadInitialData } = useStore();

  useEffect(() => {
    // Bot-ui (xodim buyurtma oqimi) dashboard ma'lumotlarini talab qilmaydi va
    // xodimda dashboard sessiyasi yo'q. Bu yerda loadInitialData himoyalangan
    // endpointlardan 401 oladi va foydalanuvchini /login ga uloqtiradi — shuning
    // uchun bot-ui sahifasida umuman yuklamaymiz.
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/bot-ui')) {
      return;
    }
    // Always load from DB on every page mount/navigation.
    // This ensures DB is always the source of truth (fixes kassa revert bug).
    loadInitialData().catch((err) => {
      console.error('❌ Avtoservis Pro: Ma\'lumotlarni yuklashda xatolik:', err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // Invisible component
}
