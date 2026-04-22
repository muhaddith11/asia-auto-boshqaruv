'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { X, Save, Coins, Car, Type, Plus } from 'lucide-react';

export default function AddServicePage() {
  const router = useRouter();
  const { addXizmat, mashinalar } = useStore();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    narx: '',
    mashina: 'UMUMIY',
    stavka: '0' // Adding stake as in reference image
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.narx) {
      alert('Xizmat nomi va narxini kiriting!');
      return;
    }

    addXizmat({
      nom: formData.nom,
      narx: parseInt(formData.narx),
      mashina: formData.mashina,
      stavka: parseFloat(formData.stavka || '0')
    });

    router.push('/services');
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0d1220]/60 backdrop-blur-[6px] min-h-screen p-6">
      <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1a1c24]">
          <h3 className="font-bold text-[14px] text-white uppercase tracking-wider flex items-center gap-2">
            <Plus size={18} className="text-indigo-500" /> Xizmat qo'shish
          </h3>
          <button onClick={() => router.back()} className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          
          <div className="space-y-1">
            <label className="block text-[13px] font-bold text-slate-500 mb-1 pl-1">Xizmat nomi *</label>
            <div className="relative group">
              <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" required value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500/50 text-white text-[15px] font-medium transition-all"
                placeholder="Xizmat nomini kiriting"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[13px] font-bold text-slate-500 mb-1 pl-1">Narxi (so'm) *</label>
              <div className="relative group">
                <Coins size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="number" required value={formData.narx}
                  onChange={e => setFormData({...formData, narx: e.target.value})}
                  className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-12 pr-4 py-4 outline-none focus:border-emerald-500/50 text-emerald-400 text-[15px] font-bold transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[13px] font-bold text-slate-500 mb-1 pl-1">Usta foizi (%)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[11px] font-black group-focus-within:text-indigo-400">PRC</div>
                <input 
                  type="number" value={formData.stavka}
                  onChange={e => setFormData({...formData, stavka: e.target.value})}
                  className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500/50 text-white text-[15px] font-bold transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[13px] font-bold text-slate-500 mb-1 pl-1">Avtomobil turi</label>
            <div className="relative group">
              <Car size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
              <select 
                value={formData.mashina}
                onChange={e => setFormData({...formData, mashina: e.target.value})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-12 pr-10 py-4 outline-none focus:border-amber-500/50 text-white text-[15px] font-medium transition-all appearance-none cursor-pointer"
              >
                <option value="UMUMIY">Barcha mashinalar (Umumiy)</option>
                {mashinalar.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" onClick={() => router.back()}
              className="flex-1 bg-[#232631] hover:bg-[#2a2d3d] text-slate-500 font-bold py-3.5 rounded-xl text-[14px] transition-all active:scale-[0.98]"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-[14px] shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Save size={18} /> Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
