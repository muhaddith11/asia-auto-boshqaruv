import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Mijoz, Xodim, Xizmat, Zapchast, Buyurtma, 
  MaoshTarixi, TashqariOperatsiya, Kassa, Counters, ZapPurchase 
} from '@/types';

interface AutoServisStore {
  mijozlar: Mijoz[];
  xodimlar: Xodim[];
  xizmatlar: Xizmat[];
  zapchastlar: Zapchast[];
  buyurtmalar: Buyurtma[];
  purchases: ZapPurchase[]; // New
  maoshTarixi: MaoshTarixi[];
  tashqariOperatsiyalar: TashqariOperatsiya[];
  mashinalar: string[];
  kassa: Kassa;
  counters: Counters;

  // Actions
  addMijoz: (m: Omit<Mijoz, 'id' | 'tashriflar' | 'jami' | 'qarzdorlik'>) => void;
  updateMijoz: (id: number, data: Partial<Mijoz>) => void;
  deleteMijoz: (id: number) => void;

  addXodim: (x: Omit<Xodim, 'id' | 'status'>) => void;
  updateXodim: (id: number, data: Partial<Xodim>) => void;
  deleteXodim: (id: number) => void;

  addMaosh: (m: Omit<MaoshTarixi, 'id'>) => void;

  addXizmat: (x: Omit<Xizmat, 'id'>) => void;
  updateXizmat: (id: number, data: Partial<Xizmat>) => void;
  deleteXizmat: (id: number) => void;

  addZapchast: (z: Omit<Zapchast, 'id' | 'balance'>) => void;
  updateZapchast: (id: number, data: Partial<Zapchast>) => void;
  deleteZapchast: (id: number) => void;

  addBuyurtma: (b: Omit<Buyurtma, 'id'>) => void;
  updateBuyurtma: (id: number, data: Partial<Buyurtma>) => void;
  deleteBuyurtma: (id: number) => void;

  updateKassa: (method: keyof Kassa, amount: number, operation: 'add' | 'sub') => void;
  transferKassa: (from: keyof Kassa, to: keyof Kassa, amount: number) => void; // New
  addTashqariOperatsiya: (op: Omit<TashqariOperatsiya, 'id'>) => void;
  deleteTashqariOperatsiya: (id: number) => void;
  
  addPurchase: (p: Omit<ZapPurchase, 'id'>) => void; 
  addMashina: (m: string) => void;
}

const defaultMashinalar = [
  'CHEVROLET DAMAS', 'CHEVROLET LABO', 'CHEVROLET MATIZ', 'CHEVROLET NEXIA 1', 'CHEVROLET NEXIA 2', 'CHEVROLET NEXIA 3', 'CHEVROLET SPARK', 'CHEVROLET COBALT', 'CHEVROLET LACETTI', 'CHEVROLET GENTRA', 'CHEVROLET ONIX', 'CHEVROLET TRACKER', 'CHEVROLET MALIBU 1', 'CHEVROLET MALIBU 2', 'CHEVROLET CAPTIVA', 'CHEVROLET EQUINOX', 'CHEVROLET TRAVERSE', 'CHEVROLET TAHOE',
  'BYD SONG PLUS', 'BYD CHAZOR', 'BYD HAN', 'BYD TANG', 'BYD YUAN PLUS', 'BYD SEAGULL', 'BYD QIN PLUS',
  'KIA K5', 'KIA K8', 'KIA SPORTAGE', 'KIA SELTOS', 'KIA SONET', 'KIA CARNIVAL', 'KIA SORENTO', 'KIA BACTO',
  'HYUNDAI SONATA', 'HYUNDAI ELANTRA', 'HYUNDAI TUCSON', 'HYUNDAI SANTA FE', 'HYUNDAI PALISADE', 'HYUNDAI CRETA', 'HYUNDAI STARIA',
  'CHERY TIGGO 7 PRO', 'CHERY TIGGO 8 PRO', 'CHERY ARRIZO 6 PRO', 'OMODA E5',
  'HAVAL JOLION', 'HAVAL H6', 'HAVAL DARGO', 'HAVAL M6',
  'JETOUR DASHING', 'JETOUR X70 PLUS', 'JETOUR X90 PLUS',
  'BMW X5', 'BMW X6', 'BMW X7', 'BMW XM', 'BMW i7', 'BMW 5-SERIES', 'BMW 7-SERIES',
  'MERCEDES-BENZ S-CLASS', 'MERCEDES-BENZ G-CLASS', 'MERCEDES-BENZ GLS', 'MERCEDES-BENZ GLE', 'MERCEDES-BENZ E-CLASS', 'MERCEDES-BENZ C-CLASS',
  'GENESIS G80', 'GENESIS G90', 'GENESIS GV80',
  'VOLKSWAGEN ID.4', 'VOLKSWAGEN ID.6', 'VOLKSWAGEN TERAMONT',
  'LI AUTO L7', 'LI AUTO L8', 'LI AUTO L9',
  'LEAPMOTOR C11', 'LEAPMOTOR T03',
  'LADA VESTA', 'LADA LARGUS', 'LADA NIVA'
].sort();

export const useStore = create<AutoServisStore>()(
  persist(
    (set, get) => ({
      mijozlar: [],
      xodimlar: [],
      xizmatlar: [],
      zapchastlar: [],
      buyurtmalar: [],
      purchases: [],
      maoshTarixi: [],
      tashqariOperatsiyalar: [],
      mashinalar: defaultMashinalar,
      kassa: { naqd: 0, karta: 0 },
      counters: { mijoz: 1, xodim: 1, xizmat: 10, zap: 10, buyurtma: 1, cash: 1, maosh: 1, purchase: 1 },

      addMijoz: (m) => set((state) => ({
        mijozlar: [...state.mijozlar, { ...m, id: state.counters.mijoz, tashriflar: 0, jami: 0, qarzdorlik: 0 }],
        counters: { ...state.counters, mijoz: state.counters.mijoz + 1 }
      })),
      updateMijoz: (id, data) => set((state) => ({
        mijozlar: state.mijozlar.map((m) => m.id === id ? { ...m, ...data } : m)
      })),
      deleteMijoz: (id) => set((state) => ({
        mijozlar: state.mijozlar.filter((m) => m.id !== id)
      })),

      addXodim: (x) => set((state) => ({
        xodimlar: [...state.xodimlar, { ...x, id: state.counters.xodim, status: 'aktiv' }],
        counters: { ...state.counters, xodim: state.counters.xodim + 1 }
      })),
      updateXodim: (id, data) => set((state) => ({
        xodimlar: state.xodimlar.map((x) => x.id === id ? { ...x, ...data } : x)
      })),
      deleteXodim: (id) => set((state) => ({
        xodimlar: state.xodimlar.filter((x) => x.id !== id)
      })),

      addMaosh: (m) => set((state) => ({
        maoshTarixi: [...state.maoshTarixi, { ...m, id: state.counters.maosh }],
        counters: { ...state.counters, maosh: state.counters.maosh + 1 },
        kassa: {
          ...state.kassa,
          [m.method]: state.kassa[m.method] - m.summa
        }
      })),

      addXizmat: (x) => set((state) => ({
        xizmatlar: [...state.xizmatlar, { ...x, id: state.counters.xizmat }],
        counters: { ...state.counters, xizmat: state.counters.xizmat + 1 }
      })),
      updateXizmat: (id, data) => set((state) => ({
        xizmatlar: state.xizmatlar.map((x) => x.id === id ? { ...x, ...data } : x)
      })),
      deleteXizmat: (id) => set((state) => ({
        xizmatlar: state.xizmatlar.filter((x) => x.id !== id)
      })),

      addZapchast: (z) => set((state) => ({
        zapchastlar: [...state.zapchastlar, { ...z, id: state.counters.zap, balance: 0 }],
        counters: { ...state.counters, zap: state.counters.zap + 1 }
      })),
      updateZapchast: (id, data) => set((state) => ({
        zapchastlar: state.zapchastlar.map((z) => z.id === id ? { ...z, ...data } : z)
      })),
      deleteZapchast: (id) => set((state) => ({
        zapchastlar: state.zapchastlar.filter((z) => z.id !== id)
      })),

      addBuyurtma: (b) => set((state) => ({
        buyurtmalar: [...state.buyurtmalar, { ...b, id: state.counters.buyurtma }],
        counters: { ...state.counters, buyurtma: state.counters.buyurtma + 1 }
      })),
      updateBuyurtma: (id, data) => set((state) => ({
        buyurtmalar: state.buyurtmalar.map((b) => b.id === id ? { ...b, ...data } : b)
      })),
      deleteBuyurtma: (id) => set((state) => ({
        buyurtmalar: state.buyurtmalar.filter((b) => b.id !== id)
      })),

      updateKassa: (method, amount, operation) => set((state) => ({
        kassa: {
          ...state.kassa,
          [method]: operation === 'add' ? state.kassa[method] + amount : state.kassa[method] - amount
        }
      })),
      transferKassa: (from, to, amount) => set((state) => ({
        kassa: {
          ...state.kassa,
          [from]: state.kassa[from] - amount,
          [to]: state.kassa[to] + amount
        },
        tashqariOperatsiyalar: [...state.tashqariOperatsiyalar, {
          id: state.counters.cash,
          date: new Date().toISOString().split('T')[0],
          type: 'transfer',
          method: from,
          toMethod: to,
          amount: amount,
          category: 'Перевод между счетами',
          source: 'system'
        }],
        counters: { ...state.counters, cash: state.counters.cash + 1 }
      })),
      addTashqariOperatsiya: (op) => set((state) => ({
        tashqariOperatsiyalar: [...state.tashqariOperatsiyalar, { ...op, id: state.counters.cash }],
        counters: { ...state.counters, cash: state.counters.cash + 1 }
      })),
      deleteTashqariOperatsiya: (id) => set((state) => ({
        tashqariOperatsiyalar: state.tashqariOperatsiyalar.filter((op) => op.id !== id)
      })),
      addPurchase: (p) => set((state) => ({
        purchases: [...state.purchases, { ...p, id: state.counters.purchase }],
        counters: { ...state.counters, purchase: state.counters.purchase + 1 }
      })),
      addMashina: (m) => set((state) => ({
        mashinalar: [...state.mashinalar, m.toUpperCase()].sort()
      }))
    }),
    {
      name: 'avtoservis-pro-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
