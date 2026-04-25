'use client';
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { User, CreditCard, Wallet, X, Banknote, Save } from 'lucide-react';
import { Xodim } from '@/types';

interface SalaryModalProps {
  worker: Xodim;
  onClose: () => void;
}

const S = {
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 14,
    color: 'var(--text)',
    outline: 'none',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text3)',
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
};

export default function SalaryModal({ worker, onClose }: SalaryModalProps) {
  const { addMaosh } = useStore();
  const [formData, setFormData] = useState({
    amount: '',
    method: 'naqd' as 'naqd' | 'karta',
    comment: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    addMaosh({
      xodimId: worker.id,
      summa: amount,
      davr: new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
      method: formData.method,
      sana: formData.date || new Date().toISOString().split('T')[0],
      izoh: formData.comment
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[4px] animate-in fade-in duration-300">
      <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1e212b]">
          <h3 className="font-bold text-[14px] text-white tracking-wide uppercase flex items-center gap-2">
            <Banknote size={18} className="text-blue-500" /> Maosh to'lash
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Worker Info Card */}
          <div className="bg-[#1e212b] p-4 rounded-xl border border-[#2a2d3d] shadow-inner">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                 {worker.ism.charAt(0).toUpperCase()}
               </div>
               <div>
                  <div className="text-white font-bold text-[14px] uppercase">{worker.ism}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{worker.mutax || 'Usta'} • {worker.foiz}% Stavka</div>
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <label style={S.label}>To'lov summasi (UZS) *</label>
            <input 
              type="number" 
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              style={S.input}
              className="font-black text-lg focus:border-blue-500/50 transition-all text-emerald-400"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label style={S.label}>To'lov usuli</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setFormData({...formData, method: 'naqd'})}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-[12px] font-bold ${
                  formData.method === 'naqd' 
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                  : 'bg-[#1e212b] border-[#2a2d3d] text-slate-500 hover:bg-[#232631]'
                }`}
              >
                <Wallet size={16} /> Naqd
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, method: 'karta'})}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-[12px] font-bold ${
                  formData.method === 'karta' 
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                  : 'bg-[#1e212b] border-[#2a2d3d] text-slate-500 hover:bg-[#232631]'
                }`}
              >
                <CreditCard size={16} /> Karta
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label style={S.label}>To'lov sanasi</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              style={S.input}
              className="text-[13px]"
            />
          </div>

          <div className="space-y-2">
            <label style={S.label}>Izoh (Ixtiyoriy)</label>
            <textarea 
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              style={S.input}
              className="min-h-[60px] resize-none text-[13px]"
              placeholder="Avans, bonus yoki boshqa izoh..."
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-[#232631] hover:bg-[#2a2d3d] text-slate-400 font-bold py-3.5 rounded-xl text-[12px] border border-[#303342] transition-all"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-[12px] shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Save size={16} /> Tasdiqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
