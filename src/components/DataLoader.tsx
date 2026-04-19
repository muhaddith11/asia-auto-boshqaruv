'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function DataLoader() {
  const { loadInitialData } = useStore();

  useEffect(() => {
    // Always load from DB on every page mount/navigation.
    // This ensures DB is always the source of truth (fixes kassa revert bug).
    loadInitialData().catch((err) => {
      console.error('❌ Avtoservis Pro: Ma\'lumotlarni yuklashda xatolik:', err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // Invisible component
}
