'use client';
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  X, Banknote, CreditCard, ChevronDown, User, Hash, 
  Tag, Briefcase, FileText, Plus, Save, Info, Wallet
} from 'lucide-react';

interface CashModalProps {
  type: 'income' | 'expense';
  onClose: () => void;
}

const CATEGORIES_INCOME = [
  "Buyurtma to'lovi",
  "Aylanmadan tashqari",
  "Qaytarilgan mablag'lar",
  "Boshqa",
  "🆕 Yangi kategoriya qo'shish"
];

const CATEGORIES_EXPENSE = [
  "Buyurtma bo'yicha to'lov",
  "Ish xaqi",
  "Ishxona",
  "Aylanmadan tashqari",
  "Ta'minotchiga to'lov",
  "Ijaraga",
  "Kommunal to'lovlar",
  "🆕 Yangi kategoriya qo'shish"
];

const OPERATION_TYPES = [
  "Naqd (Kassa)",
  "Plastik (Karta)",
  "O'tkazma"
];

const S = {
  overlay: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-[8px] animate-in fade-in duration-300",
  card: "relative bg-[#1a1c24] border border-[#2e323d] rounded-2xl w-full max-w-[420px] overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] animate-in zoom-in duration-200",
  header: "px-6 py-5 border-b border-[#2e323d] flex items-center justify-between",
  body: "p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar",
  label: "block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2",
  input: "w-full bg-[#232631] border border-[#2e323d] rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-[13px] font-bold placeholder:text-slate-600",
  select: "w-full bg-[#232631] border border-[#2e323d] rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white text-[13px] font-bold appearance-none cursor-pointer",
};

export default function CashModal({ type, onClose }: CashModalProps) {
  const { updateKassa, addTashqariOperatsiya, addIshxonaOperatsiya, mijozlar, xodimlar, addMaosh } = useStore();
  
  const [formData, setFormData] = useState({
    amount: '',
    method: 'naqd' as 'naqd' | 'karta',
    category: type === 'income' ? CATEGORIES_INCOME[0] : CATEGORIES_EXPENSE[0],
    source: '',
    opType: OPERATION_TYPES[0],
    comment: '',
    customCategory: ''
  });

  const categories = type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    const finalCategory = formData.category === "🆕 Yangi kategoriya qo'shish" 
      ? formData.customCategory 
      : formData.category;

    if (formData.category === "Ish xaqi" || (formData.category === "🆕 Yangi kategoriya qo'shish" && formData.customCategory === "Ish xaqi")) {
      const worker = xodimlar.find(x => x.ism === formData.source);
      addMaosh({
        sana: new Date().toISOString().split('T')[0],
        davr: new Date().toISOString().substring(0, 7),
        xodimId: worker?.id || 0,
        summa: amount,
        method: formData.method,
        izoh: formData.comment || "Maosh to'lovi"
      });
    } else {
      updateKassa(formData.method, amount, type === 'income' ? 'add' : 'sub');
      const op = {
        date: new Date().toISOString().split('T')[0],
        type: type,
        method: formData.method,
        amount: amount,
        category: finalCategory,
        comment: formData.comment,
        source: formData.source || 'manual'
      };

      if (finalCategory === 'Aylanmadan tashqari') {
        addTashqariOperatsiya(op as any);
      } else {
        addIshxonaOperatsiya(op as any);
      }
    }
    
    onClose();
  };

  return (
    <div className={S.overlay}>
      <div className={S.card}>
        
        {/* Header (Matching Image 2 Style) */}
        <div className={S.header}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              {type === 'income' ? <Plus className="text-indigo-400" size={24} /> : <div className="w-6 h-[2px] bg-red-400" />}
            </div>
            <div>
              <h3 className="font-black text-[15px] text-white tracking-widest uppercase m-0 leading-tight">
                {type === 'income' ? 'KIRIM' : 'CHIQIM'}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Ma'lumotlarni kiriting
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[#232631] text-slate-400 hover:text-white transition-all rounded-full border-none cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={S.body}>
          
          {/* Summa */}
          <div className="space-y-1.5 px-1">
            <label className={S.label}>Summa *</label>
            <div className="relative">
              <input 
                type="number" required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className={S.input}
                placeholder="Summani kiriting..."
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-500 text-[12px] uppercase">UZS</span>
            </div>
          </div>

          {/* Kategoriya */}
          <div className="space-y-1.5 px-1">
            <label className={S.label}>Kategoriya *</label>
            <div className="relative">
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value, source: ''})}
                className={S.select}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          {formData.category === "🆕 Yangi kategoriya qo'shish" && (
            <div className="space-y-1.5 px-1 animate-in slide-in-from-top-2 duration-200">
              <label className={S.label}>Yangi kategoriya nomi *</label>
              <div className="relative">
                <input 
                  type="text" required
                  value={formData.customCategory}
                  onChange={(e) => setFormData({...formData, customCategory: e.target.value})}
                  className={S.input}
                  placeholder="Kategoriya nomi..."
                />
                <Tag className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              </div>
            </div>
          )}

          {/* Istoshnik/Poluchatel - Filtered based on request logic */}
          {formData.category !== "Ishxona" && (
            <div className="space-y-1.5 px-1">
              <label className={S.label}>Manba / Qabul qiluvchi *</label>
              <div className="relative">
                <select 
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className={S.select}
                  required
                >
                  <option value="">Tanlang...</option>
                  {formData.category === "Aylanmadan tashqari" ? (
                    <option value="Yahyo aka">👤 Yahyo aka</option>
                  ) : formData.category === "Ish xaqi" ? (
                    xodimlar.map(x => <option key={x.id} value={x.ism}>🛠️ {x.ism} - Sotrudnik</option>)
                  ) : (type === 'income' && formData.category === "Buyurtma to'lovi") ? (
                    mijozlar.map(m => <option key={m.id} value={m.ism}>👤 {m.ism} - Klient</option>)
                  ) : (
                    <>
                      {mijozlar.map(m => <option key={m.id} value={m.ism}>👤 {m.ism} - Klient</option>)}
                      {xodimlar.map(x => <option key={x.id} value={x.ism}>🛠️ {x.ism} - Sotrudnik</option>)}
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              </div>
            </div>
          )}
          

          {/* Tip operatsii */}
          <div className="space-y-1.5 px-1">
            <label className={S.label}>Operatsiya turi *</label>
            <div className="relative">
              <select 
                value={formData.opType}
                onChange={(e) => setFormData({...formData, opType: e.target.value})}
                className={S.select}
              >
                {OPERATION_TYPES.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <Wallet className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Kommentariy */}
          <div className="space-y-1.5 px-1">
            <label className={S.label}>Izoh</label>
            <div className="relative">
              <textarea 
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value })}
                className={`${S.input} min-h-[90px] resize-none pt-4`}
                placeholder="Qo'shimcha ma'lumot..."
              />
              <Info className="absolute right-5 top-4 text-slate-500" size={18} />
            </div>
          </div>

          {/* Actions (Matching Image 2 Style) */}
          <div className="pt-4 flex gap-4">
            <button 
              type="button" onClick={onClose}
              className="flex-1 bg-[#232631] hover:bg-[#2a2d3d] text-slate-400 font-black py-4 rounded-xl text-[12px] uppercase tracking-widest transition-all active:scale-[0.98] border-none cursor-pointer"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl text-[12px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] border-none cursor-pointer flex items-center justify-center gap-3"
            >
              <Save size={18} />
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
