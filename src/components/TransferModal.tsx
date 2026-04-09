'use client';
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { X, ArrowRightLeft, CreditCard, Banknote } from 'lucide-react';

interface TransferModalProps {
  onClose: () => void;
}

export default function TransferModal({ onClose }: TransferModalProps) {
  const { kassa, transferKassa } = useStore();
  const [formData, setFormData] = useState({
    amount: '',
    from: 'naqd' as 'naqd' | 'karta',
    to: 'karta' as 'naqd' | 'karta',
    comment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount <= 0 || amount > kassa[formData.from]) {
      alert('Недостаточно средств или неверная сумма!');
      return;
    }

    transferKassa(formData.from, formData.to, amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[4px] animate-in fade-in duration-300">
      <div className="relative bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl w-full max-w-[420px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1e212b]">
          <h3 className="font-bold text-[15px] text-white uppercase tracking-tight flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-blue-500" />
            O'TKAZMA (KASSA)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Откуда</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, from: 'naqd', to: 'karta'})}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border text-[13px] font-bold transition-all ${
                  formData.from === 'naqd' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <Banknote size={16} /> Нал.
              </button>
            </div>
            <div className="mt-6 text-slate-300">
              <ArrowRightLeft size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Куда</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, from: 'karta', to: 'naqd'})}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border text-[13px] font-bold transition-all ${
                  formData.from === 'karta' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CreditCard size={16} /> Карта
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-500 mb-2">Сумма перевода *</label>
            <input 
              type="number" 
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 text-slate-900 text-lg font-black transition-all"
              placeholder="0"
            />
            <div className="mt-1 text-[11px] text-slate-400 font-medium">
              Доступно: <span className="text-slate-700">{kassa[formData.from].toLocaleString()} сум</span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-lg text-[14px] transition-all"
            >
              Отмена
            </button>
            <button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-[14px] transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Перевести
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
