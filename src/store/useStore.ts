import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Mijoz, Xodim, Xizmat, Zapchast, Buyurtma,
  MaoshTarixi, TashqariOperatsiya, Kassa, Counters, ZapPurchase
} from '@/types';
import {
  getClients, getOrders, getWorkers, getParts,
  createClient, updateClient, deleteClient,
  createWorker, updateWorker, deleteWorker,
  createOrder, updateOrder, deleteOrder,
  createPart, updatePart, deletePart,
  getCars,
  getServices, createService, updateService, deleteService,
  getKassa, updateKassaState, getOperations, createOperation, deleteOperation, getSalaries, createSalary,
  getPurchases, createPurchase, createCar
} from '@/lib/api';

export const normalize = (str: string) => {
  if (!str) return '';
  const homoglyphs: Record<string, string> = {
    'е': 'e', 'а': 'a', 'о': 'o', 'с': 'c', 'р': 'p', 'х': 'x', 'у': 'y', 'к': 'k', 'і': 'i', 'м': 'm', 'т': 't', 'в': 'v',
    'Е': 'E', 'А': 'A', 'О': 'O', 'С': 'C', 'Р': 'P', 'Х': 'X', 'У': 'Y', 'К': 'K', 'І': 'I', 'М': 'M', 'Т': 'T', 'В': 'V',
    'Н': 'H', 'Ь': '', 'ъ': ''
  };
  return str
    .replace(/[еаосрхукімтвЕАОСРХУКІМТВНЬъ]/g, m => homoglyphs[m] || m)
    .replace(/Chevolet/gi, 'Chevrolet')
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters like dots, commas, dashes for cleaner matching
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
};

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
        const originalKassa = { ...get().kassa };

        // Optimistic Update
        set((state) => ({
          maoshTarixi: [{ ...m, id: tempId, createdAt: now }, ...state.maoshTarixi],
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
          if (!created || created.error) throw new Error(created?.error || "Maoshni saqlashda xatolik");

          // Sync Kassa with DB
          const nextKassa = {
            ...get().kassa,
            [m.method]: get().kassa[m.method]
          };
          await updateKassaState(nextKassa);

          set((state) => ({
            maoshTarixi: state.maoshTarixi.map(mm => mm.id === tempId ? {
              id: created.id,
              xodimId: created.worker_id,
              summa: created.amount,
              method: created.method,
              sana: created.date,
              davr: m.davr,
              izoh: created.comment,
              createdAt: created.created_at
            } : mm)
          }));
          console.log("✅ Maosh bazaga saqlandi:", created.id);
        } catch (err: any) {
          console.error("❌ Maosh saqlashda xatolik:", err);
          alert("XATOLIK: Maosh bazada saqlanmadi!\nSabab: " + (err.message || "Ulanish xatosi"));
          // Revert
          set((state) => ({
            maoshTarixi: state.maoshTarixi.filter(mm => mm.id !== tempId),
            kassa: originalKassa
          }));
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
        const brand = parts[0] || 'UMUMIY';
        const model = parts.slice(1).join(' ') || '';

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
            mashina: createdItem.brand === 'UMUMIY' || createdItem.brand === 'Umumiy' ? 'UMUMIY' : `${createdItem.brand} ${createdItem.car_model}`.toUpperCase(),
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
        deleteService(id).catch(() => { });
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
          buyurtmalar: [{ ...b, id: tempId }, ...state.buyurtmalar],
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
          if (result && result.error) {
             throw new Error(result.error);
          }
          console.log("✅ Buyurtma bazada yangilandi:", id);
        } catch (err: any) {
          console.error("❌ Buyurtmani bazada yangilashda xatolik:", err);
          alert("DIQQAT: Ma'lumot bazada saqlanmadi! \nSabab: " + (err.message || "Ulanish xatosi"));
          // Revert logic could go here if needed, but for now we need the alert
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
          console.log("✅ Tashqari operatsiya saqlandi");
        } catch (err: any) {
          console.error("❌ Tashqari operatsiya saqlashda xatolik:", err);
          alert("XATOLIK: Operatsiya bazada saqlanmadi!\nSabab: " + (err.message || "Ulanish xatosi"));
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
          if (!created || (created as any).error) throw new Error((created as any).error || "Server xatosi");
          
          set((state) => ({
            ishxonaOperatsiyalar: state.ishxonaOperatsiyalar.map(o => o.id === tempId ? { ...o, id: created.id } : o)
          }));
          console.log("✅ Ishxona operatsiyasi saqlandi:", created.id);
        } catch (err: any) {
          console.error("❌ Operatsiya saqlashda xatolik:", err);
          alert("XATOLIK: Amaliyot bazada saqlanmadi!\nSabab: " + (err.message || "Ulanish xatosi"));
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
      addPurchase: async (p) => {
        const tempId = -Date.now();
        set((state) => ({
          purchases: [...state.purchases, { ...p, id: tempId }],
          counters: { ...state.counters, purchase: state.counters.purchase + 1 }
        }));
        try {
          const created = await createPurchase(p);
          set((state) => ({
            purchases: state.purchases.map(pp => pp.id === tempId ? created : pp)
          }));
        } catch (err) {
          console.error("❌ Xarid saqlashda xatolik:", err);
        }
      },
      addMashina: async (m) => {
        const parts = m.split(' ');
        const brand = parts[0] || 'BOSHQA';
        const name = parts.slice(1).join(' ') || m;

        set((state) => ({
          mashinalar: [...state.mashinalar, m.toUpperCase()].sort()
        }));

        try {
          await createCar(brand, name);
        } catch (err) {
          console.error("❌ Mashina saqlashda xatolik:", err);
        }
      },
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
        console.log('🔄 Store: Ma\'lumotlar yuklanmoqda...');
        try {
          // Use allSettled to prevent one failing API from blocking others
          const results = await Promise.allSettled([
            getClients(), getOrders(), getWorkers(), getParts(), getCars(),
            getServices(), getKassa(), getOperations(), getSalaries(), getPurchases()
          ]);

          const [
            clientsRes, ordersRes, workersRes, partsRes, carsRes,
            servicesRes, kassaRes, opsRes, salariesRes, purchasesRes
          ] = results;

          const getData = (res: any) => res.status === 'fulfilled' ? res.value : null;

          const clients = getData(clientsRes);
          const orders = getData(ordersRes);
          const workers = getData(workersRes);
          const parts = getData(partsRes);
          const cars = getData(carsRes);
          const services = getData(servicesRes);
          const kassaResult = getData(kassaRes);
          const ops = getData(opsRes);
          const salaries = getData(salariesRes);
          const purchases = getData(purchasesRes);

          if (servicesRes.status === 'rejected') {
            console.error('❌ Xizmatlarni yuklashda xatolik:', servicesRes.reason);
          }

          const mashinalarList: string[] = cars && cars.length > 0
            ? Array.from(new Set(cars.map((c: any) => normalize(`${c.brand} ${c.name}`)))).sort() as string[]
            : [];

          const finalKassa = kassaResult || { naqd: 0, karta: 0 };
          const allOps = ops || [];
          const bizOps = allOps.filter((o: any) => o.source !== 'external');
          const extOps = allOps.filter((o: any) => o.source === 'external');

          set((state) => ({
            ...state,
            mijozlar: clients || [],
            buyurtmalar: orders || [],
            xodimlar: workers || [],
            zapchastlar: parts || [],
            mashinalar: mashinalarList,
            kassa: finalKassa,
            ishxonaOperatsiyalar: bizOps,
            tashqariOperatsiyalar: extOps,
            maoshTarixi: salaries ? salaries.map((s: any) => ({
              id: s.id, xodimId: s.worker_id, summa: s.amount, method: s.method,
              sana: s.date, izoh: s.comment, createdAt: s.created_at
            })) : [],
            purchases: purchases || [],
            xizmatlar: services ? (() => {
              const uniqueMap = new Map();
              services.forEach((s: any) => {
                const normName = normalize(s.name);
                const normCar = normalize(s.brand === 'UMUMIY' || s.brand === 'Umumiy' || !s.brand ? 'UMUMIY' : `${s.brand} ${s.car_model || ''}`);
                const key = `${normName}_${normCar}`;
                uniqueMap.set(key, {
                  id: s.id,
                  nom: s.name,
                  narx: s.price,
                  mashina: normCar === 'UMUMIY' ? 'UMUMIY' : normCar,
                  stavka: s.stavka
                });
              });
              return Array.from(uniqueMap.values()) as any[];
            })() : []
          }));
          console.log(`✅ Store yuklandi: ${clients?.length || 0} mijoz, ${services?.length || 0} xizmat.`);
        } catch (err) {
          console.error('❌ Store: loadInitialData kutilmagan xato:', err);
        }
      }
    }),
    {
      name: 'avtoservis-pro-storage',
      storage: createJSONStorage(() => localStorage),
      // ONLY persist UI-level data. Everything financial MUST come from DB.
      // This prevents stale localStorage from overwriting correct DB values.
      partialize: (state) => ({
        counters: state.counters,
        mashinalar: state.mashinalar,
      }),
    }
  )
);
