'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export default function DataLoader() {
  const { loadInitialData } = useStore();
  const loaded = useRef(false);

  useEffect(() => {
    if (!loaded.current) {
      console.log('🔄 Avtoservis Pro: Ma\'lumotlarni bazadan yuklash boshlandi...');
      loadInitialData()
        .then(() => {
          console.log('✅ Avtoservis Pro: Barcha ma\'lumotlar muvaffaqiyatli yuklandi.');
        })
        .catch((err) => {
          console.error('❌ Avtoservis Pro: Ma\'lumotlarni yuklashda xatolik:', err);
        });
      loaded.current = true;
    }
  }, [loadInitialData]);

  return null; // Invisible component
}
