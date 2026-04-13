'use client';
import React, { useState, useEffect } from 'react';
import PhoneInput from '@/components/PhoneInput';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Plus, UserCog, CheckCircle2, Percent, Phone, Briefcase } from 'lucide-react';

export default function AddWorkerPage() {
  const router = useRouter();
  const { addXodim } = useStore();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    ism: '',
    tel: '',
    mutax: '',
    foiz: 40
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ism || formData.foiz === undefined || formData.foiz === null) {
      alert('Ism va ulush foizini kiriting!');
      return;
    }

    addXodim({
      ism: formData.ism,
      tel: formData.tel,
      mutax: formData.mutax,
      foiz: formData.foiz
    });

    router.push('/workers');
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <header className="h-[70px] bg-surface flex items-center justify-between px-8 shrink-0 text-white sticky top-0 z-40">
        <h2 className="text-slate-400 font-bold text-[13px] uppercase tracking-widest flex items-center gap-2">
          <UserCog size={18} className="text-blue-500" /> Xodim qo'shish
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm w-full max-w-lg overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
             <h3 className="font-bold text-slate-800 uppercase text-[12px] tracking-widest">Xodim ma'lumotlari</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Ism Familiya *</label>
              <input 
                type="text" 
                required
                value={formData.ism}
                onChange={(e) => setFormData({...formData, ism: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 text-slate-900 text-[14px] font-bold transition-all"
                placeholder="Xodim ismi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefon</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <PhoneInput
                    value={formData.tel}
                    onChange={(v) => setFormData({...formData, tel: v})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-3 outline-none focus:border-blue-500 text-slate-900 text-[14px] font-bold transition-all"
                    placeholder="+998"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Stavka (%) *</label>
                <div className="relative">
                  <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number" 
                    required
                    value={formData.foiz}
                    onChange={(e) => setFormData({...formData, foiz: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-3 outline-none focus:border-blue-500 text-slate-900 text-[14px] font-black transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Mutaxassislik</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.mutax}
                  onChange={(e) => setFormData({...formData, mutax: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-3 outline-none focus:border-blue-500 text-slate-900 text-[14px] font-bold transition-all"
                  placeholder="Masalan: Elektrik"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-lg text-[13px] transition-all"
              >
                Bekor qilish
              </button>
              <button 
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-[13px] transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Qo'shish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
