'use client';
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { X, CreditCard, Wallet, Banknote, ChevronDown, User } from 'lucide-react';

interface CashModalProps {
  type: 'income' | 'expense';
  onClose: () => void;
}

const CATEGORIES = [
  "Buyurtma uchun to'lov",
  "Ishxona",
  "Ish xaqi",
  "Aylanmadan tashqari",
  "Kategoriya qo'shish"
];

export default function CashModal({ type, onClose }: CashModalProps) {
  const { updateKassa, addTashqariOperatsiya, xodimlar, addMaosh } = useStore();
  const [formData, setFormData] = useState({
    amount: '',
    method: 'naqd' as 'naqd' | 'karta',
    category: CATEGORIES[0],
    customCategory: '',
    comment: '',
    workerId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    const finalCategory = formData.category === "Kategoriya qo'shish" 
      ? formData.customCategory 
      : formData.category;

    if (formData.category === "Ish xaqi" && formData.workerId) {
      // Logic for salary: decreases kassa through addMaosh
      addMaosh({
        sana: new Date().toISOString().split('T')[0],
        xodimId: parseInt(formData.workerId),
        summa: amount,
        method: formData.method,
        izoh: formData.comment || 'Maosh to\'lovi (Kassa orqali)'
      });
    } else {
      // General income/expense
      updateKassa(formData.method, amount, type === 'income' ? 'add' : 'sub');
      addTashqariOperatsiya({
        date: new Date().toISOString().split('T')[0],
        type: type,
        method: formData.method,
        amount: amount,
        category: finalCategory,
        comment: formData.comment,
        source: 'manual'
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[4px] animate-in fade-in duration-300">
      <div className="relative bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl w-full max-w-[480px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1e212b]">
          <h3 className="font-bold text-[15px] text-white uppercase tracking-tight">
            {type === 'income' ? 'PULL KIRIMI' : 'PULL CHIQIMI'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          <div>
            <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">Summa *</label>
            <input 
              type="number" 
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl px-4 py-4 outline-none focus:border-blue-500 text-white text-[18px] font-black transition-all"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">To'lov usuli *</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setFormData({...formData, method: 'naqd'})}
                className={`flex items-center justify-center gap-2 py-4 rounded-xl border text-[13px] font-black transition-all ${
                  formData.method === 'naqd' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                  : 'bg-[#1e212b] border-[#2a2d3d] text-slate-500 hover:border-slate-700'
                }`}
              >
                <Banknote size={16} /> NAQD
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, method: 'karta'})}
                className={`flex items-center justify-center gap-2 py-4 rounded-xl border text-[13px] font-black transition-all ${
                  formData.method === 'karta' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                  : 'bg-[#1e212b] border-[#2a2d3d] text-slate-500 hover:border-slate-700'
                }`}
              >
                <CreditCard size={16} /> PLASTIK
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategoriya *</label>
            <div className="relative">
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 text-white text-[14px] font-bold appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} style={{ background: '#1a1c24' }}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          {formData.category === "Kategoriya qo'shish" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
               <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">Yangi kategoriya nomi *</label>
               <input 
                type="text" required
                value={formData.customCategory}
                onChange={(e) => setFormData({...formData, customCategory: e.target.value})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 text-white text-[14px]"
                placeholder="Kategoriya nomini yozing..."
              />
            </div>
          )}

          {formData.category === "Ish xaqi" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
               <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">Xodimni tanlang *</label>
               <div className="relative">
                 <select 
                  required
                  value={formData.workerId}
                  onChange={(e) => setFormData({...formData, workerId: e.target.value})}
                  className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl px-4 py-3.5 pl-10 outline-none focus:border-emerald-500 text-white text-[14px] font-bold appearance-none cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" style={{ background: '#1a1c24' }}>— Xodimni tanlang —</option>
                  {xodimlar.map(x => (
                    <option key={x.id} value={x.id} style={{ background: '#1a1c24' }}>{x.ism} ({x.mutax || 'Usta'})</option>
                  ))}
                </select>
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
               </div>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">Izoh</label>
            <textarea 
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value })}
              className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 text-white text-[14px] min-h-[80px] resize-none"
              placeholder="Amaliyot haqida qo'shimcha ma'lumot..."
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-[#232631] hover:bg-[#2a2d3d] text-slate-500 font-black py-4 rounded-xl text-[14px] uppercase tracking-widest transition-all"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl text-[14px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98]"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
