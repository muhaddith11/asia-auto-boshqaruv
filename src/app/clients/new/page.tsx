'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { X, Save, User, Phone, Percent, Plus } from 'lucide-react';

export default function AddClientPage() {
  const router = useRouter();
  const { addMijoz } = useStore();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    ism: '',
    tel: '',
    skidka: 0,
    status: 'aktiv' as 'aktiv' | 'noaktiv'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ism || !formData.tel) {
      alert('Ism va telefon raqamini kiriting!');
      return;
    }

    addMijoz({
      ism: formData.ism,
      tel: formData.tel,
      skidka: formData.skidka,
      status: formData.status
    });

    router.push('/clients');
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0d1220]/60 backdrop-blur-[6px] min-h-screen p-6">
      <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1a1c24]">
          <h3 className="font-bold text-[14px] text-white uppercase tracking-wider flex items-center gap-2">
             <Plus size={18} className="text-indigo-500" /> Mijoz qo'shish
          </h3>
          <button onClick={() => router.back()} className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          
          <div className="space-y-1">
            <label className="block text-[13px] font-bold text-slate-500 mb-1 pl-1">Ism Familiya *</label>
            <div className="relative group">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" required value={formData.ism}
                onChange={e => setFormData({...formData, ism: e.target.value})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500/50 text-white text-[15px] font-medium transition-all"
                placeholder="Mijoz ismi va familiyasi"
              />
            </div>
          </div>
 
          <div className="space-y-1">
            <label className="block text-[13px] font-bold text-slate-500 mb-1 pl-1">Telefon raqami *</label>
            <div className="relative group">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="text" required value={formData.tel}
                onChange={e => setFormData({...formData, tel: e.target.value})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-12 pr-4 py-4 outline-none focus:border-emerald-500/50 text-emerald-400 text-[15px] font-bold transition-all"
                placeholder="+998"
              />
            </div>
          </div>
 
          <div className="space-y-1">
            <label className="block text-[13px] font-bold text-slate-500 mb-1 pl-1">Doimiy skidka (%)</label>
            <div className="relative group">
              <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
              <input 
                type="number" value={formData.skidka}
                onChange={e => setFormData({...formData, skidka: parseInt(e.target.value) || 0})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-12 pr-4 py-4 outline-none focus:border-amber-500/50 text-white text-[15px] font-black transition-all"
                placeholder="0"
              />
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
