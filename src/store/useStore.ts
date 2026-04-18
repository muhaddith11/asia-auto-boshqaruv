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

  addMaosh: (m: Omit<MaoshTarixi, 'id' | 'createdAt'>) => void;

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
  addTashqariOperatsiya: (op: Omit<TashqariOperatsiya, 'id' | 'createdAt'>) => void;
  addIshxonaOperatsiya: (op: Omit<TashqariOperatsiya, 'id' | 'createdAt'>) => void;
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

      addMijoz: async (m) => {
        const tempId = -Date.now();
        set((state) => ({
          mijozlar: [...state.mijozlar, { ...m, id: tempId, tashriflar: 0, jami: 0, qarzdorlik: 0 }],
          counters: { ...state.counters, mijoz: state.counters.mijoz + 1 }
        }));
        try {
          const created = await createClient(m as any);
          if (!created || (created as any).error) {
             throw new Error((created as any).error || "Mijozni saqlashda xatolik");
          }
          set((state) => ({
            mijozlar: state.mijozlar.map((mm) => Number(mm.id) === Number(tempId) ? created : mm)
          }));
          console.log("✅ Mijoz bazaga saqlandi:", created.id);
        } catch (err: any) {
          console.error("❌ Mijozni saqlashda xatolik:", err);
          alert("XATOLIK: Mijoz bazada saqlanmadi! \nSabab: " + (err.message || "Server bilan aloqa yo'q"));
          // Optionally revert
          set((state) => ({ 
            mijozlar: state.mijozlar.filter((mm) => mm.id !== tempId),
            counters: { ...get().counters, mijoz: get().counters.mijoz - 1 }
          }));
        }
      },
      updateMijoz: async (id, data) => {
        set((state) => ({
          mijozlar: state.mijozlar.map((m) => Number(m.id) === Number(id) ? { ...m, ...data } : m)
        }));
        try {
          const result = await updateClient(id, data as any);
          if (!result || result.error) {
             throw new Error(result?.error || "Mijozni yangilashda xatolik");
          }
          console.log("✅ Mijoz o'zgarishi saqlandi:", id);
        } catch (err: any) {
          console.error("❌ Mijozni yangilashda xatolik:", err);
          alert("XATOLIK: Mijoz ma'lumotlari bazada yangilanmadi! \nSabab: " + (err.message || "Server xatosi"));
        }
      },
      deleteMijoz: (id) => {
        set((state) => ({ mijozlar: state.mijozlar.filter((m) => Number(m.id) != Number(id)) }));
        deleteClient(id).catch(() => {
          console.warn("API o'chirishda xatolik (Mijoz), lekin lokal o'chirish saqlab qolindi.");
        });
      },

      addXodim: async (x) => {
        const tempId = -Date.now();
        const now = new Date().toISOString();
        
        set((state) => ({
          xodimlar: [...state.xodimlar, { ...x, id: tempId, status: 'aktiv', createdAt: now }],
          counters: { ...state.counters, xodim: state.counters.xodim + 1 }
        }));
        
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

        try {
          const created = await createWorker(apiData as any);
          if (!created || (created as any).error) throw new Error((created as any).error || "Xodimni saqlashda xatolik");
          
          set((state) => ({ 
            xodimlar: state.xodimlar.map((xx) => Number(xx.id) === Number(tempId) ? created : xx) 
          }));
          console.log("✅ Xodim bazaga saqlandi:", created.id);
        } catch (err: any) {
          console.error("❌ Xodim qo'shishda xatolik:", err);
          alert("XATOLIK: Xodim bazada saqlanmadi! \nSabab: " + (err.message || "Server xatosi"));
          set((state) => ({
            xodimlar: state.xodimlar.filter(xx => xx.id !== tempId),
            counters: { ...get().counters, xodim: get().counters.xodim - 1 }
          }));
        }
      },
      updateXodim: async (id, data) => {
        const original = get().xodimlar.find(x => x.id === id);
        set((state) => ({ xodimlar: state.xodimlar.map((x) => x.id === id ? { ...x, ...data } : x) }));
        try {
          const { izoh, ...apiData } = data as any;
          const result = await updateWorker(id, apiData);
          if (!result || result.error) throw new Error(result?.error || "Xodimni yangilashda xatolik");
          console.log("✅ Xodim o'zgarishi saqlandi:", id);
        } catch (err: any) {
          console.error("❌ Xodimni yangilashda xatolik:", err);
          alert("XATOLIK: Xodim ma'lumotlari bazada yangilanmadi! \nSabab: " + (err.message || "Server xatosi"));
          if (original) {
            set((state) => ({ xodimlar: state.xodimlar.map(x => x.id === id ? original : x) }));
          }
        }
      },
      deleteXodim: (id) => {
        set((state) => ({ xodimlar: state.xodimlar.filter((x) => Number(x.id) != Number(id)) }));
        deleteWorker(id).catch(() => {
          console.warn("API o'chirishda xatolik (Xodim), lekin lokal o'chirish saqlab qolindi.");
        });
      },

      addMaosh: (m) => set((state) => ({
        maoshTarixi: [...state.maoshTarixi, { ...m, id: state.counters.maosh, createdAt: new Date().toISOString() }],
        counters: { ...state.counters, maosh: state.counters.maosh + 1 },
        kassa: {
          ...state.kassa,
          [m.method]: state.kassa[m.method] - m.summa
        }
      })),

      addXizmat: async (x) => {
        const tempId = -Date.now();
        set((state) => ({
          xizmatlar: [...state.xizmatlar, { ...x, id: tempId }],
          counters: { ...state.counters, xizmat: state.counters.xizmat + 1 }
        }));
        
        // Map to DB schema
        const parts = x.mashina.split(' ');
        const brand = parts[0] || 'Umumiy';
        const model = parts.slice(1).join(' ') || brand;

        const apiData = {
          name: x.nom,
          price: x.narx,
          brand: brand,
          car_model: model,
          stavka: x.stavka || 0
        };

        try {
          const created = await createService(apiData);
          if (!created || (created as any).error) throw new Error("Server xizmatni qabul qilmadi");
          
          const createdItem = Array.isArray(created) ? created[0] : created;
          const mapped = {
            id: createdItem.id,
            nom: createdItem.name,
            narx: createdItem.price,
            mashina: createdItem.brand === 'Umumiy' ? 'Umumiy' : `${createdItem.brand} ${createdItem.car_model}`.toUpperCase(),
            stavka: createdItem.stavka
          };
          set((state) => ({
            xizmatlar: state.xizmatlar.map((s) => Number(s.id) === Number(tempId) ? mapped : s)
          }));
          console.log("✅ Xizmat bazaga saqlandi:", createdItem.id);
        } catch (err: any) {
          console.error("❌ Xizmat qo'shishda xatolik:", err);
          alert("XATOLIK: Xizmat bazada saqlanmadi! \nSabab: " + (err.message || "Server xatosi"));
          set((state) => ({
            xizmatlar: state.xizmatlar.filter(s => s.id !== tempId),
            counters: { ...get().counters, xizmat: get().counters.xizmat - 1 }
          }));
        }
      },
      updateXizmat: async (id, data) => {
        const original = get().xizmatlar.find(x => x.id === id);
        set((state) => ({
          xizmatlar: state.xizmatlar.map((x) => String(x.id) === String(id) ? { ...x, ...data } : x)
        }));
        
        try {
          const apiData: any = {};
          if (data.nom) apiData.name = data.nom;
          if (data.narx) apiData.price = data.narx;
          if (data.mashina) apiData.car_model = data.mashina;
          if (data.stavka !== undefined) apiData.stavka = data.stavka;

          if (Object.keys(apiData).length > 0) {
            const result = await updateService(id, apiData);
            if (!result || result.error) throw new Error("Xizmatni yangilashda xatolik");
          }
          console.log("✅ Xizmat o'zgarishi saqlandi:", id);
        } catch (err: any) {
          console.error("❌ Xizmatni yangilashda xatolik:", err);
          alert("XATOLIK: Xizmat bazada yangilanmadi! \nSabab: " + (err.message || "Server xatosi"));
          if (original) {
            set((state) => ({ xizmatlar: state.xizmatlar.map(x => x.id === id ? original : x) }));
          }
        }
      },
      deleteXizmat: (id) => {
        set((state) => ({
          xizmatlar: state.xizmatlar.filter((x) => String(x.id) !== String(id))
        }));
        deleteService(id).catch(() => {});
      },

      addZapchast: async (z) => {
        const tempId = -Date.now();
        set((state) => ({
          zapchastlar: [...state.zapchastlar, { ...z, id: tempId, balance: 0 }],
          counters: { ...state.counters, zap: state.counters.zap + 1 }
        }));
        try {
          const created = await createPart(z as any);
          if (!created || (created as any).error) throw new Error((created as any).error || "Zapchastni saqlashda xatolik");
          
          set((state) => ({ zapchastlar: state.zapchastlar.map((zz) => Number(zz.id) === Number(tempId) ? created : zz) }));
          console.log("✅ Zapchast bazaga saqlandi:", created.id);
        } catch (err: any) {
          console.error("❌ Zapchast qo'shishda xatolik:", err);
          alert("XATOLIK: Zapchast bazada saqlanmadi! \nSabab: " + (err.message || "Server xatosi"));
          set((state) => ({
            zapchastlar: state.zapchastlar.filter(zz => zz.id !== tempId),
            counters: { ...get().counters, zap: get().counters.zap - 1 }
          }));
        }
      },
      updateZapchast: async (id, data) => {
        const original = get().zapchastlar.find(z => z.id === id);
        set((state) => ({ zapchastlar: state.zapchastlar.map((z) => z.id === id ? { ...z, ...data } : z) }));
        try {
          const result = await updatePart(id, data as any);
          if (!result || result.error) throw new Error(result?.error || "Zapchastni yangilashda xatolik");
          console.log("✅ Zapchast o'zgarishi saqlandi:", id);
        } catch (err: any) {
          console.error("❌ Zapchastni yangilashda xatolik:", err);
          alert("XATOLIK: Zapchast ma'lumotlari bazada yangilanmadi! \nSabab: " + (err.message || "Server xatosi"));
          if (original) {
            set((state) => ({ zapchastlar: state.zapchastlar.map(z => z.id === id ? original : z) }));
          }
        }
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
          if (!created || (created as any).error) {
            throw new Error((created as any).error || "Buyurtmani saqlashda server xatosi");
          }
          set((state) => ({ 
            buyurtmalar: state.buyurtmalar.map((bb) => String(bb.id) === String(tempId) ? created : bb) 
          }));
          console.log("✅ Buyurtma bazaga saqlandi:", created.id);
        }).catch((err) => {
          console.error("❌ Buyurtmani saqlashda xatolik:", err);
          alert("XATOLIK: Buyurtma bazada saqlanmadi!\nSabab: " + (err.message || "Ulanish xatosi"));
        });
      },
      updateBuyurtma: async (id, data) => {
        // Optimistic update
        set((state) => ({ 
          buyurtmalar: state.buyurtmalar.map((b) => Number(b.id) === Number(id) ? { ...b, ...data } : b) 
        }));
        
        try {
          const result = await updateOrder(id, data as any);
          if (!result || result.error) {
             throw new Error(result?.error || "Noma'lum server xatosi");
          }
          console.log("✅ Buyurtma muvaffaqiyatli yangilandi:", id);
        } catch (err: any) {
          console.error("❌ Buyurtmani yangilashda xatolik:", err);
          alert("DIQQAT: Buyurtma statusi bazada saqlanmadi! \nSabab: " + (err.message || "Server bilan bog'lanishda xato"));
          
          // Revert on failure (optional but recommended for data integrity)
          // For now, alerting is most important so the user knows NOT to trust the GUI state
        }
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
          category: 'Puldagi o\'tkazma',
          source: 'system',
          createdAt: new Date().toISOString()
        }],
        counters: { ...state.counters, cash: state.counters.cash + 1 }
      })),
      addTashqariOperatsiya: (op) => set((state) => ({
        tashqariOperatsiyalar: [...state.tashqariOperatsiyalar, { ...op, id: state.counters.cash, createdAt: new Date().toISOString() }],
        counters: { ...state.counters, cash: state.counters.cash + 1 }
      })),
      addIshxonaOperatsiya: (op) => set((state) => ({
        ishxonaOperatsiyalar: [...state.ishxonaOperatsiyalar, { ...op, id: state.counters.cash, createdAt: new Date().toISOString() }],
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
          // Force fresh data on init
          const [clients, orders, workers, parts, cars, services] = await Promise.all([
            getClients(),
            getOrders(),
            getWorkers(),
            getParts(),
            getCars(),
            getServices()
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
