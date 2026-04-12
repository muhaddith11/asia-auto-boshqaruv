import { create } from 'zustand';

export const useOrderStore = create((set, get) => ({
  brand: '',
  model: '',
  probeg: '',
  plateNumber: '',
  services: [], // { name, price }
  parts: [], // { name, quantity, price }
  
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
