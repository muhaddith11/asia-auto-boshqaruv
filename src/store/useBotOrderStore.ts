import { create } from 'zustand';

interface BotOrderState {
  brand: string;
  model: string;
  probeg: string;
  plateNumber: string;
  services: { name: string; price: number | string; isCustom?: boolean }[];
  parts: { name: string; quantity: number | string; price: number | string; isCustom?: boolean }[];
  
  setCarInfo: (info: Partial<BotOrderState>) => void;
  addService: (service: { name: string; price: number | string; isCustom?: boolean }) => void;
  removeService: (idx: number) => void;
  addPart: (part: { name: string; quantity: number | string; price: number | string; isCustom?: boolean }) => void;
  removePart: (idx: number) => void;
  getTotalAmount: () => number;
  reset: () => void;
}

export const useBotOrderStore = create<BotOrderState>((set, get) => ({
  brand: '',
  model: '',
  probeg: '',
  plateNumber: '',
  services: [],
  parts: [],
  
  setCarInfo: (info) => set((state) => ({ ...state, ...info })),
  
  addService: (service) => set((state) => ({ 
    services: [...state.services, service] 
  })),
  
  removeService: (idx) => set((state) => ({
    services: state.services.filter((_, i) => i !== idx)
  })),
  
  addPart: (part) => set((state) => ({
    parts: [...state.parts, part]
  })),
  
  removePart: (idx) => set((state) => ({
    parts: state.parts.filter((_, i) => i !== idx)
  })),

  getTotalAmount: () => {
    const { services, parts } = get();
    const sTotal = services.reduce((sum, s) => sum + Number(s.price), 0);
    const pTotal = parts.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);
    return sTotal + pTotal;
  },

  reset: () => set({
    brand: '', model: '', probeg: '', plateNumber: '', services: [], parts: []
  })
}));
