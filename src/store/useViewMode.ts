import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Admin darajasidagi hisob (egasi/boshliq — ikkalasi ham to'liq huquqli, [[auth.ts]])
// qaysi KO'RINISHNI ko'rishni xohlaydi: 'full' (Admin — hammasi) yoki 'compact'
// (Boshliq — ixcham: hisob-kitob, buyurtmalar, eng muhim narsalar).
//
// Bu SOF taqdimot afzalligi — canAccess huquqiga hech qanday ta'sir qilmaydi,
// faqat shu brauzerda (localStorage) eslab qolinadi. `null` — hali tanlanmagan,
// shu holda rolning standart ko'rinishi ishlatiladi (useRole.ts'dagi
// defaultViewFor: boshliq→compact, egasi→full).
// ─────────────────────────────────────────────────────────────────────────────

export type ViewMode = 'full' | 'compact';

interface ViewModeStore {
  viewMode: ViewMode | null;
  setViewMode: (m: ViewMode | null) => void;
}

export const useViewMode = create<ViewModeStore>()(
  persist(
    (set) => ({
      viewMode: null,
      setViewMode: (m) => set({ viewMode: m }),
    }),
    {
      name: 'asia-auto-view-mode',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
