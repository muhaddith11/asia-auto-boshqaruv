import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Mijoz, Xodim, Xizmat, Zapchast, Buyurtma, 
  MaoshTarixi, TashqariOperatsiya, Kassa, Counters, ZapPurchase 
} from '@/types';
import { getClients, getOrders, getWorkers, getParts,
  createClient, updateClient, deleteClient,
  createWorker, updateWorker, deleteWorker,
  createOrder, updateOrder, deleteOrder,
  createPart, updatePart, deletePart,
  getCars,
  getServices, createService, updateService, deleteService
} from '@/lib/api';

interface AutoServisStore {
  mijozlar: Mijoz[];
  xodimlar: Xodim[];
  xizmatlar: Xizmat[];
  zapchastlar: Zapchast[];
  buyurtmalar: Buyurtma[];
  purchases: ZapPurchase[]; // New
  maoshTarixi: MaoshTarixi[];
  tashqariOperatsiyalar: TashqariOperatsiya[];
  ishxonaOperatsiyalar: TashqariOperatsiya[];
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
  addIshxonaOperatsiya: (op: Omit<TashqariOperatsiya, 'id'>) => void;
  deleteIshxonaOperatsiya: (id: number) => void;
  deleteTashqariOperatsiya: (id: number) => void;
  
  addPurchase: (p: Omit<ZapPurchase, 'id'>) => void; 
  addMashina: (m: string) => void;
  resetKassa: () => void;
  loadInitialData: () => Promise<void>;
}

const defaultMashinalar: string[] = [];

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
      ishxonaOperatsiyalar: [],
      mashinalar: defaultMashinalar,
      kassa: { naqd: 0, karta: 0 },
      counters: { mijoz: 1, xodim: 1, xizmat: 10, zap: 10, buyurtma: 1, cash: 1, maosh: 1, purchase: 1 },

      addMijoz: (m) => {
        const tempId = -Date.now();
        set((state) => ({
          mijozlar: [...state.mijozlar, { ...m, id: tempId, tashriflar: 0, jami: 0, qarzdorlik: 0 }],
          counters: { ...state.counters, mijoz: state.counters.mijoz + 1 }
        }));
        createClient(m as any).then((created) => {
          if (!created) return;
          set((state) => ({
            mijozlar: state.mijozlar.map((mm) => mm.id === tempId ? created : mm)
          }));
        }).catch(() => {
          // keep local item if server fails
        });
      },
      updateMijoz: (id, data) => {
        set((state) => ({
          mijozlar: state.mijozlar.map((m) => m.id === id ? { ...m, ...data } : m)
        }));
        updateClient(id, data as any).catch(() => {
          // optionally reload or revert on failure
        });
      },
      deleteMijoz: (id) => {
        set((state) => ({ mijozlar: state.mijozlar.filter((m) => Number(m.id) != Number(id)) }));
        deleteClient(id).catch(() => {
          console.warn("API o'chirishda xatolik (Mijoz), lekin lokal o'chirish saqlab qolindi.");
        });
      },

      addXodim: (x) => {
        const tempId = -Date.now();
        const now = new Date().toISOString();
        
        // Optimistic update
        set((state) => ({
          xodimlar: [...state.xodimlar, { ...x, id: tempId, status: 'aktiv', createdAt: now }],
          counters: { ...state.counters, xodim: state.counters.xodim + 1 }
        }));

        // ALL mandatory fields for Supabase (EXCLUDING 'izoh' as it doesn't exist in DB)
        const apiData = {
          ism: x.ism,
          tel: x.tel || '',
          mutax: x.mutax || '',
          foiz: Number(x.foiz) || 0,
          role: x.role || 'xodim',
          shareType: x.shareType || 'total',
          status: 'aktiv',
          parentId: x.parentId || null
        };

        createWorker(apiData as any).then((created) => {
          if (!created) throw new Error("Server xodimni qabul qilmadi");
          
          set((state) => ({ 
            xodimlar: state.xodimlar.map((xx) => xx.id === tempId ? created : xx) 
          }));
        }).catch((err) => {
          console.error("Xodim qo'shishda xatolik:", err);
          alert("Xodimni bazaga saqlab bo'lmadi! Sabab: " + (err.message || "Noma'lum xato"));
          // Rollback local state
          set((state) => ({
            xodimlar: state.xodimlar.filter(xx => xx.id !== tempId)
          }));
        });
      },
      updateXodim: (id, data) => {
        set((state) => ({ xodimlar: state.xodimlar.map((x) => x.id === id ? { ...x, ...data } : x) }));
        
        // Remove 'izoh' if it exists in data before sending to Supabase
        const { izoh, ...apiData } = data as any;
        updateWorker(id, apiData).catch(() => {});
      },
      deleteXodim: (id) => {
        set((state) => ({ xodimlar: state.xodimlar.filter((x) => Number(x.id) != Number(id)) }));
        deleteWorker(id).catch(() => {
          console.warn("API o'chirishda xatolik (Xodim), lekin lokal o'chirish saqlab qolindi.");
        });
      },

      addMaosh: (m) => set((state) => ({
        maoshTarixi: [...state.maoshTarixi, { ...m, id: state.counters.maosh }],
        counters: { ...state.counters, maosh: state.counters.maosh + 1 },
        kassa: {
          ...state.kassa,
          [m.method]: state.kassa[m.method] - m.summa
        }
      })),

      addXizmat: (x) => {
        const tempId = -Date.now();
        set((state) => ({
          xizmatlar: [...state.xizmatlar, { ...x, id: tempId }],
          counters: { ...state.counters, xizmat: state.counters.xizmat + 1 }
        }));
        
        // Map to DB schema (best guess for brand/model from 'mashina' string)
        const parts = x.mashina.split(' ');
        const brand = parts[0] || 'Umumiy';
        const model = parts.slice(1).join(' ') || '';

        const apiData = {
          name: x.nom,
          price: x.narx,
          brand: brand,
          car_model: model || brand, // fallback
          stavka: x.stavka || 0
        };

        createService(apiData).then((created) => {
          if (!created) return;
          const mapped = {
            id: created.id,
            nom: created.name,
            narx: created.price,
            mashina: created.brand === 'Umumiy' ? 'Umumiy' : `${created.brand} ${created.car_model}`.toUpperCase(),
            stavka: created.stavka
          };
          set((state) => ({
            xizmatlar: state.xizmatlar.map((s) => s.id === tempId ? mapped : s)
          }));
        }).catch(() => {});
      },
      updateXizmat: (id, data) => {
        set((state) => ({
          xizmatlar: state.xizmatlar.map((x) => String(x.id) === String(id) ? { ...x, ...data } : x)
        }));
        
        // Map to DB schema if those fields were updated
        const apiData: any = {};
        if (data.nom) apiData.name = data.nom;
        if (data.narx) apiData.price = data.narx;
        if (data.mashina) apiData.car_model = data.mashina;
        if (data.stavka !== undefined) apiData.stavka = data.stavka;

        if (Object.keys(apiData).length > 0) {
          updateService(id, apiData).catch(() => {});
        }
      },
      deleteXizmat: (id) => {
        set((state) => ({
          xizmatlar: state.xizmatlar.filter((x) => String(x.id) !== String(id))
        }));
        deleteService(id).catch(() => {});
      },

      addZapchast: (z) => {
        const tempId = -Date.now();
        set((state) => ({
          zapchastlar: [...state.zapchastlar, { ...z, id: tempId, balance: 0 }],
          counters: { ...state.counters, zap: state.counters.zap + 1 }
        }));
        createPart(z as any).then((created) => {
          if (!created) return;
          set((state) => ({ zapchastlar: state.zapchastlar.map((zz) => zz.id === tempId ? created : zz) }));
        }).catch(() => {});
      },
      updateZapchast: (id, data) => {
        set((state) => ({ zapchastlar: state.zapchastlar.map((z) => z.id === id ? { ...z, ...data } : z) }));
        updatePart(id, data as any).catch(() => {});
      },
      deleteZapchast: (id) => {
        set((state) => ({ zapchastlar: state.zapchastlar.filter((z) => Number(z.id) != Number(id)) }));
        deletePart(id).catch(() => {
          console.warn("API o'chirishda xatolik (Zapchast), lekin lokal o'chirish saqlab qolindi.");
        });
      },

      addBuyurtma: (b) => {
        const tempId = -Date.now();
        set((state) => ({
          buyurtmalar: [...state.buyurtmalar, { ...b, id: tempId }],
          counters: { ...state.counters, buyurtma: state.counters.buyurtma + 1 }
        }));
        createOrder(b as any).then((created) => {
          if (!created) return;
          set((state) => ({ buyurtmalar: state.buyurtmalar.map((bb) => bb.id === tempId ? created : bb) }));
        }).catch(() => {});
      },
      updateBuyurtma: (id, data) => {
        set((state) => ({ buyurtmalar: state.buyurtmalar.map((b) => b.id === id ? { ...b, ...data } : b) }));
        updateOrder(id, data as any).catch(() => {});
      },
      deleteBuyurtma: (id) => {
        set((state) => ({ buyurtmalar: state.buyurtmalar.filter((b) => Number(b.id) != Number(id)) }));
        deleteOrder(id).catch(() => {
          console.warn("API o'chirishda xatolik, lekin lokal o'chirish saqlab qolindi.");
        });
      },

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
      addIshxonaOperatsiya: (op) => set((state) => ({
        ishxonaOperatsiyalar: [...state.ishxonaOperatsiyalar, { ...op, id: state.counters.cash }],
        counters: { ...state.counters, cash: state.counters.cash + 1 }
      })),
      deleteIshxonaOperatsiya: (id) => set((state) => ({
        ishxonaOperatsiyalar: state.ishxonaOperatsiyalar.filter((op) => Number(op.id) != Number(id))
      })),
      deleteTashqariOperatsiya: (id) => set((state) => ({
        tashqariOperatsiyalar: state.tashqariOperatsiyalar.filter((op) => Number(op.id) != Number(id))
      })),
      addPurchase: (p) => set((state) => ({
        purchases: [...state.purchases, { ...p, id: state.counters.purchase }],
        counters: { ...state.counters, purchase: state.counters.purchase + 1 }
      })),
      addMashina: (m) => set((state) => ({
        mashinalar: [...state.mashinalar, m.toUpperCase()].sort()
      })),
      resetKassa: () => set({ 
        kassa: { naqd: 0, karta: 0 }, 
        tashqariOperatsiyalar: [],
        ishxonaOperatsiyalar: [],
        maoshTarixi: []
      }),
      loadInitialData: async () => {
        try {
          console.log('📡 API: Ma\'lumotlarni so\'rash boshlandi...');
          const [clients, orders, workers, parts, cars, services] = await Promise.all([
            getClients().catch(() => []),
            getOrders().catch(() => []),
            getWorkers().catch(() => []),
            getParts().catch(() => []),
            getCars().catch(() => []),
            getServices().catch(() => [])
          ]);

          console.log(`📦 API: Yuklandi: ${clients.length} mijoz, ${orders.length} buyurtma, ${workers.length} xodim, ${parts.length} zapchast, ${cars.length} mashina, ${services.length} xizmat.`);

          // Fallback if cars are empty but we expect them (optional safety)
          const mashinalarList = cars && cars.length > 0 
            ? cars.map((c: any) => `${c.brand} ${c.name}`.toUpperCase()).sort() 
            : [];

          if (mashinalarList.length > 0) {
             console.log('🚗 CAR_DATA_LOADED: Mashinalar ro\'yxati tayyor.');
          } else {
             console.warn('⚠️ CAR_DATA_EMPTY: Mashinalar ro\'yxati bo\'sh qaytdi.');
          }

          set(() => ({
            mijozlar: clients || [],
            buyurtmalar: orders || [],
            xodimlar: workers || [],
            zapchastlar: parts || [],
            mashinalar: mashinalarList,
            xizmatlar: services ? services.map((s: any) => ({
              id: s.id,
              nom: s.name,
              narx: s.price,
              mashina: s.brand === 'Umumiy' ? 'Umumiy' : `${s.brand} ${s.car_model}`.toUpperCase(),
              stavka: s.stavka
            })) : []
          }));
        } catch (err) {
          console.error('❌ Store: loadInitialData xatosi:', err);
        }
      }
    }),
    {
      name: 'avtoservis-pro-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
