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
  getServices, createService, updateService, deleteService,
  getKassa, updateKassaState, getOperations, createOperation, deleteOperation, getSalaries, createSalary
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

      addMaosh: async (m) => {
        const tempId = -Date.now();
        const now = new Date().toISOString();
        set((state) => ({
          maoshTarixi: [...state.maoshTarixi, { ...m, id: tempId, createdAt: now }],
          counters: { ...state.counters, maosh: state.counters.maosh + 1 },
          kassa: {
            ...state.kassa,
            [m.method]: state.kassa[m.method] - m.summa
          }
        }));
        
        try {
          const apiData = {
            worker_id: m.xodimId,
            amount: m.summa,
            method: m.method,
            date: m.sana,
            comment: m.izoh || ''
          };
          const created = await createSalary(apiData);
          const newKassa = {
            ...get().kassa,
            [m.method]: get().kassa[m.method]
          };
          await updateKassaState(newKassa);
          
          set((state) => ({
            maoshTarixi: state.maoshTarixi.map(mm => mm.id === tempId ? { ...mm, id: created.id } : mm)
          }));
        } catch (err) {
          console.error("❌ Maosh saqlashda xatolik:", err);
        }
      },

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

      updateKassa: async (method, amount, operation) => {
        const currentKassa = get().kassa;
        const newValue = operation === 'add' ? currentKassa[method] + amount : currentKassa[method] - amount;
        const nextKassa = { ...currentKassa, [method]: newValue };
        
        set({ kassa: nextKassa });
        try {
          await updateKassaState(nextKassa);
        } catch (err) {
          console.error("❌ Kassa yangilashda xatolik:", err);
        }
      },
      transferKassa: async (from, to, amount) => {
        const currentKassa = get().kassa;
        const nextKassa = {
          ...currentKassa,
          [from]: currentKassa[from] - amount,
          [to]: currentKassa[to] + amount
        };
        
        set({
          kassa: nextKassa,
          ishxonaOperatsiyalar: [...get().ishxonaOperatsiyalar, {
            id: -Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'transfer',
            method: from,
            toMethod: to,
            amount: amount,
            category: 'Puldagi o\'tkazma',
            source: 'system',
            createdAt: new Date().toISOString()
          }]
        });

        try {
          await updateKassaState(nextKassa);
          await createOperation({
            date: new Date().toISOString().split('T')[0],
            type: 'transfer',
            method: from,
            toMethod: to,
            amount: amount,
            category: 'Puldagi o\'tkazma',
            source: 'system'
          });
        } catch (err) {
          console.error("❌ Transfer saqlashda xatolik:", err);
        }
      },
      addTashqariOperatsiya: async (op) => {
        const tempId = -Date.now();
        // Always set source='external' so split filter works correctly in Hisobot
        set((state) => ({
          tashqariOperatsiyalar: [...state.tashqariOperatsiyalar, { ...op, id: tempId, source: 'external', createdAt: new Date().toISOString() }],
          counters: { ...state.counters, cash: state.counters.cash + 1 }
        }));
        
        try {
          await createOperation({ ...op, source: 'external' });
        } catch (err) {
          console.error("❌ Tashqari operatsiya saqlashda xatolik:", err);
        }
      },
      addIshxonaOperatsiya: async (op) => {
        const tempId = -Date.now();
        set((state) => ({
          ishxonaOperatsiyalar: [...state.ishxonaOperatsiyalar, { ...op, id: tempId, createdAt: new Date().toISOString() }],
          counters: { ...state.counters, cash: state.counters.cash + 1 }
        }));
        
        try {
          const apiData = {
            date: op.date,
            type: op.type,
            method: op.method,
            amount: op.amount,
            category: op.category,
            comment: op.comment || '',
            source: op.source || 'manual'
          };
          const created = await createOperation(apiData);
          set((state) => ({
            ishxonaOperatsiyalar: state.ishxonaOperatsiyalar.map(o => o.id === tempId ? { ...o, id: created.id } : o)
          }));
        } catch (err) {
          console.error("❌ Operatsiya saqlashda xatolik:", err);
        }
      },
      deleteIshxonaOperatsiya: async (id) => {
        set((state) => ({
          ishxonaOperatsiyalar: state.ishxonaOperatsiyalar.filter((op) => Number(op.id) != Number(id))
        }));
        try {
          await deleteOperation(id);
        } catch (err) {
          console.error("❌ Operatsiya o'chirishda xatolik:", err);
        }
      },
      deleteTashqariOperatsiya: async (id) => {
        set((state) => ({
          tashqariOperatsiyalar: state.tashqariOperatsiyalar.filter((op) => Number(op.id) != Number(id))
        }));
        try {
          await deleteOperation(id);
        } catch (err) {
          console.error("❌ Tashqari operatsiya o'chirishda xatolik:", err);
        }
      },
      addPurchase: (p) => set((state) => ({
        purchases: [...state.purchases, { ...p, id: state.counters.purchase }],
        counters: { ...state.counters, purchase: state.counters.purchase + 1 }
      })),
      addMashina: (m) => set((state) => ({
        mashinalar: [...state.mashinalar, m.toUpperCase()].sort()
      })),
      resetKassa: async () => {
        const nextKassa = { naqd: 0, karta: 0 };
        set({ 
          kassa: nextKassa, 
          tashqariOperatsiyalar: [],
          ishxonaOperatsiyalar: [],
          maoshTarixi: []
        });
        try {
          await updateKassaState(nextKassa);
        } catch (err) {
          console.error("❌ Kassa resetda xatolik:", err);
        }
      },
      loadInitialData: async () => {
        try {
          // Capture local kassa ONLY for first-time migration check
          const localKassa = get().kassa;
          const localHasValue = (localKassa?.naqd || 0) > 0 || (localKassa?.karta || 0) > 0;

          const [clients, orders, workers, parts, cars, services, kassaResult, ops, salaries] = await Promise.all([
            getClients(),
            getOrders(),
            getWorkers(),
            getParts(),
            getCars(),
            getServices(),
            getKassa(),
            getOperations(),
            getSalaries()
          ]);

          const mashinalarList = cars && cars.length > 0 
            ? cars.map((c: any) => `${c.brand} ${c.name}`.toUpperCase()).sort() 
            : [];

          // DB IS ALWAYS THE SOURCE OF TRUTH.
          // Only migrate local kassa to DB on first-ever use (when DB is completely empty).
          const dbKassaEmpty = !kassaResult || (kassaResult.naqd === 0 && kassaResult.karta === 0);
          let finalKassa = kassaResult || { naqd: 0, karta: 0 };
          if (dbKassaEmpty && localHasValue) {
            console.log("🔄 First-time migration: pushing local kassa to DB...");
            await updateKassaState(localKassa);
            finalKassa = localKassa;
          }

          // FIX: Split operations by source to prevent double-listing in Hisobot.
          // source === 'external' => Aylanmadan tashqari (tashqariOperatsiyalar)
          // everything else      => Ishxona ichki operatsiyalar (ishxonaOperatsiyalar)
          const allOps = ops || [];
          const bizOps = allOps.filter((o: any) => o.source !== 'external');
          const extOps = allOps.filter((o: any) => o.source === 'external');

          set(() => ({
            mijozlar: clients || [],
            buyurtmalar: orders || [],
            xodimlar: workers || [],
            zapchastlar: parts || [],
            mashinalar: mashinalarList,
            kassa: finalKassa,
            ishxonaOperatsiyalar: bizOps,
            tashqariOperatsiyalar: extOps,
            maoshTarixi: salaries ? salaries.map((s: any) => ({
              id: s.id,
              xodimId: s.worker_id,
              summa: s.amount,
              method: s.method,
              sana: s.date,
              izoh: s.comment,
              createdAt: s.created_at
            })) : [],
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
