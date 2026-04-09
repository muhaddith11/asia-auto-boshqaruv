'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Package, 
  Trash2, 
  Edit3, 
  Search, 
  Car, 
  Filter,
  RotateCcw,
  X,
  Save,
  Coins,
  LayoutGrid,
  ChevronDown,
  Box
} from 'lucide-react';

const S = {
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 12,
    color: 'var(--text)',
    outline: 'none',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text3)',
    marginBottom: 6,
    letterSpacing: '0.02em',
  } as React.CSSProperties,
};

export default function PartsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { zapchastlar, addZapchast, updateZapchast, deleteZapchast, mashinalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    mashina: '',
    kat: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({ search: '', mashina: '', kat: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [formData, setFormData] = useState({
    nom: '',
    mashina: 'Umumiy',
    sebestoimost: 0,
    narx: 0,
    bir: 'dona',
    kat: 'Boshqa'
  });

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('add') === 'true') {
       setEditingPart(null);
       setFormData({ nom: '', mashina: 'Umumiy', sebestoimost: 0, narx: 0, bir: 'dona', kat: 'Boshqa' });
       setIsModalOpen(true);
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, [searchParams]);

  if (!mounted) return null;

  const openModal = (part: any) => {
    setEditingPart(part);
    setFormData({
      nom: part.nom,
      mashina: part.mashina || 'Umumiy',
      sebestoimost: part.sebestoimost || 0,
      narx: part.narx || 0,
      bir: part.bir || 'dona',
      kat: part.kat || 'Boshqa'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPart(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPart) {
      updateZapchast(editingPart.id, formData);
    } else {
      addZapchast(formData);
    }
    closeModal();
  };

  const applyFilters = () => setAppliedFilters({ ...filters });
  const resetFilters = () => {
    setFilters({ search: '', mashina: '', kat: '' });
    setAppliedFilters({ search: '', mashina: '', kat: '' });
  };

  const filteredParts = zapchastlar.filter(p => {
    const sTerm = appliedFilters.search.toLowerCase();
    const matchesSearch = p.nom.toLowerCase().includes(sTerm);
    const matchesCar = !appliedFilters.mashina || p.mashina === appliedFilters.mashina;
    const matchesKat = !appliedFilters.kat || p.kat === appliedFilters.kat;
    return matchesSearch && matchesCar && matchesKat;
  });

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      
      {/* ── PAGE HEADER ── */}
      <div className="px-7 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-white tracking-tight">Ehtiyot qismlar (Sklad)</h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Ombordagi mavjud zapchastlarni boshqarish, narxlarni belgilash va qoldiqni kuzatish.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPart(null);
            setFormData({ nom: '', mashina: 'Umumiy', sebestoimost: 0, narx: 0, bir: 'dona', kat: 'Boshqa' });
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-[12px] flex items-center gap-2 transition-all shadow-xl shadow-emerald-900/10 active:scale-95"
        >
          <Plus size={16} /> Yangi zapchast qo'shish
        </button>
      </div>

      {/* ── FILTERS PANEL ── */}
      <div className="mx-7 mt-4 p-5 bg-surface border border-border rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label style={S.label}>Nomi bo'yicha qidirish</label>
            <div className="relative">
              <input 
                type="text" placeholder="Zapchast nomini kiriting..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                style={S.input} className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <label style={S.label}>Mashina markasi</label>
            <div className="relative">
              <select 
                value={filters.mashina}
                onChange={(e) => setFilters({...filters, mashina: e.target.value})}
                style={S.input} className="appearance-none"
              >
                <option value="">Barcha markalar</option>
                <option value="Umumiy">Umumiy</option>
                {mashinalar.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <label style={S.label}>Kategoriya</label>
            <div className="relative">
              <select 
                value={filters.kat}
                onChange={(e) => setFilters({...filters, kat: e.target.value})}
                style={S.input} className="appearance-none"
              >
                <option value="">Barcha kategoriyalar</option>
                {['Motor', 'Xodovoy', 'Elektr', 'Kuzov', 'Boshqa'].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
           <button 
              onClick={applyFilters}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-lg text-[12px] transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
            >
              Filtrlarni qo'llash
            </button>
            <button 
              onClick={resetFilters}
              className="px-6 border border-border bg-surface2 hover:bg-surface3 text-slate-400 py-2.5 rounded-lg text-[12px] transition-all active:scale-95"
            >
              Tashlash
            </button>
        </div>
      </div>

      {/* ── PARTS TABLE ── */}
      <div className="flex-1 px-7 py-5 overflow-auto">
        {filteredParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-surface/30 border border-dashed border-border rounded-xl">
            <Package size={48} className="mb-4 opacity-20" />
            <p className="text-[14px] font-bold">Hech qanday zapchast topilmadi</p>
            <p className="text-[11px] mt-1 opacity-60">Qidiruv shartlarini o'zgartirib ko'ring</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-[12px] whitespace-nowrap">
              <thead className="bg-[#1e212b] text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-4">ZAPCHAST</th>
                  <th className="px-6 py-4">KATEGORIYA</th>
                  <th className="px-6 py-4">MASHINA</th>
                  <th className="px-6 py-4 text-right">KELISH NARXI</th>
                  <th className="px-6 py-4 text-right">SOTUV NARXI</th>
                  <th className="px-6 py-4 text-center">MAVJUD</th>
                  <th className="px-6 py-4 text-center">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredParts.map((p, idx) => (
                  <tr key={p.id} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'} hover:bg-white/[0.02] transition-colors group`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                         <div>
                            <div className="font-bold text-white">{p.nom}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">{p.bir}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-tighter border border-emerald-500/20">
                        {p.kat || 'Boshqa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 font-medium">{p.mashina}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-500 line-through decoration-slate-700">{(p.sebestoimost || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-emerald-400">{p.narx.toLocaleString()} <span className="text-[10px] text-slate-500 ml-0.5">sum</span></span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`font-black ${p.balance <= 5 ? 'text-red-500' : 'text-slate-300'}`}>
                          {p.balance} <span className="text-[9px] text-slate-500 uppercase">{p.bir}</span>
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openModal(p)}
                          className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-md transition-all shadow-sm"
                        >
                           <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Ochirishni tasdiqlaysizmi?')) deleteZapchast(p.id); }}
                          className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-md transition-all shadow-sm"
                        >
                           <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[8px] animate-in fade-in duration-300">
           <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-3xl w-full max-w-[540px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] animate-in zoom-in duration-300">
              
              {/* Header */}
              <div className="px-8 py-6 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1f222d]">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                       <Package size={20} className="text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-[15px] text-white uppercase tracking-tight">{editingPart ? 'Zapchastni tahrirlash' : 'Yangi ehtiyot qism'}</h3>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Sklad ma'lumotlari</p>
                    </div>
                 </div>
                 <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-xl">
                   <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 {/* Nomi */}
                 <div className="space-y-2">
                    <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Zapchast nomi *</label>
                    <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all group">
                      <Box size={20} className="text-slate-600 group-focus-within:text-emerald-500 transition-colors mr-3" />
                      <input 
                        type="text" required value={formData.nom} 
                        onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                        className="bg-transparent border-none outline-none flex-1 text-white text-[15px] font-semibold"
                        placeholder="Ehtiyot qism nomi"
                      />
                    </div>
                 </div>

                 {/* Kat va Bir */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategoriya</label>
                        <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-indigo-500 transition-all">
                          <select 
                            value={formData.kat} 
                            onChange={(e) => setFormData({...formData, kat: e.target.value})} 
                            className="bg-transparent border-none outline-none flex-1 text-white text-[14px] font-semibold appearance-none cursor-pointer"
                          >
                            {['Motor', 'Xodovoy', 'Elektr', 'Kuzov', 'Boshqa'].map(k => <option key={k} value={k}>{k}</option>)}
                          </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Birligi</label>
                        <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-indigo-500 transition-all">
                          <select 
                            value={formData.bir} 
                            onChange={(e) => setFormData({...formData, bir: e.target.value})} 
                            className="bg-transparent border-none outline-none flex-1 text-white text-[14px] font-semibold appearance-none cursor-pointer"
                          >
                            {['dona', 'litr', 'komplekt', 'metr', 'kg'].map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                    </div>
                 </div>

                 {/* Narxlar */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Kelish narxi (so'm) *</label>
                       <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-red-500/50 transition-all">
                        <input 
                          type="number" required value={formData.sebestoimost} 
                          onChange={(e) => setFormData({...formData, sebestoimost: parseInt(e.target.value) || 0})} 
                          className="bg-transparent border-none outline-none flex-1 text-red-400 text-[16px] font-black"
                        />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Sotish narxi (so'm) *</label>
                       <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-emerald-500/50 transition-all">
                        <input 
                          type="number" required value={formData.narx} 
                          onChange={(e) => setFormData({...formData, narx: parseInt(e.target.value) || 0})} 
                          className="bg-transparent border-none outline-none flex-1 text-emerald-400 text-[16px] font-black"
                        />
                       </div>
                    </div>
                 </div>

                 {/* Mashina */}
                 <div className="space-y-2">
                    <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Mashina markasi</label>
                    <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all group">
                      <Car size={20} className="text-slate-600 group-focus-within:text-amber-500 transition-colors mr-3" />
                      <select 
                        value={formData.mashina} 
                        onChange={(e) => setFormData({...formData, mashina: e.target.value})} 
                        className="bg-transparent border-none outline-none flex-1 text-white text-[15px] font-semibold appearance-none cursor-pointer"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="Umumiy" style={{ background: '#1a1c24', color: 'white' }}>Umumiy (Barcha markalar)</option>
                        {mashinalar.map(m => <option key={m} value={m} style={{ background: '#1a1c24', color: 'white' }}>{m}</option>)}
                      </select>
                    </div>
                 </div>

                 {/* Amallar */}
                 <div className="pt-6 flex gap-4">
                    <button 
                      type="button" onClick={closeModal} 
                      className="flex-1 bg-[#232631] hover:bg-[#2a2d3d] text-slate-500 font-black py-4 rounded-xl text-[14px] uppercase tracking-widest transition-all active:scale-[0.98]"
                    >
                      Bekor qilish
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl text-[14px] uppercase tracking-widest shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <Save size={20} /> Saqlash
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
