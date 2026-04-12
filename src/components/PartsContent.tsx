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
  ChevronDown,
  Box
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

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

export default function PartsContent() {
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
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });

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
    <div className="flex-1 flex flex-col bg-transparent min-h-screen p-10">
      
      {/* ── PAGE HEADER ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-black text-white tracking-tight leading-none">Ehtiyot qismlar</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-2">Ombordagi mavjud zapchastlarni boshqarish va narxlarni kuzatish.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPart(null);
            setFormData({ nom: '', mashina: 'Umumiy', sebestoimost: 0, narx: 0, bir: 'dona', kat: 'Boshqa' });
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-[12px] flex items-center gap-2 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 uppercase tracking-widest"
        >
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      {/* ── FILTERS PANEL ── */}
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl mb-8 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label style={S.label}>Qidiruv</label>
              <div className="relative">
                <input 
                  type="text" placeholder="Zapchast nomi..." 
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  style={S.input} className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label style={S.label}>Mashina</label>
              <div className="relative">
                <select 
                  value={filters.mashina}
                  onChange={(e) => setFilters({...filters, mashina: e.target.value})}
                  style={S.input} className="appearance-none"
                >
                  <option value="">Barchasi</option>
                  <option value="Umumiy">Umumiy</option>
                  {mashinalar.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label style={S.label}>Kategoriya</label>
              <div className="relative">
                <select 
                  value={filters.kat}
                  onChange={(e) => setFilters({...filters, kat: e.target.value})}
                  style={S.input} className="appearance-none"
                >
                  <option value="">Barchasi</option>
                  {['Motor', 'Xodovoy', 'Elektr', 'Kuzov', 'Boshqa'].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 self-end pb-0.5">
             <button 
                onClick={applyFilters}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl text-[12px] transition-all active:scale-95 shadow-lg shadow-emerald-500/10 uppercase tracking-widest"
              >
                Filtr
              </button>
              <button 
                onClick={resetFilters}
                className="p-2.5 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all active:scale-95"
                title="Tozalash"
              >
                <RotateCcw size={16} />
              </button>
          </div>
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
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-xl bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                            <Box size={16} className="text-emerald-500 opacity-60" />
                         </div>
                         <div>
                            <div className="font-bold text-white text-[13px] tracking-tight">{p.nom}</div>
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{p.bir}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5 bg-white/5 ${
                        p.kat === 'Motor' ? 'text-blue-400' :
                        p.kat === 'Xodovoy' ? 'text-amber-400' :
                        p.kat === 'Elektr' ? 'text-indigo-400' :
                        p.kat === 'Kuzov' ? 'text-rose-400' :
                        'text-slate-400'
                      }`}>
                        {p.kat || 'Boshqa'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-400 font-bold tracking-tight">{p.mashina}</span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-600 line-through">
                      {(p.sebestoimost || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-black text-emerald-400 text-[14px]">{(p.narx || 0).toLocaleString()} <span className="text-[10px] text-slate-600 font-bold ml-0.5 uppercase tracking-tighter">uzs</span></span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className={`px-3 py-1 rounded-lg font-black text-[11px] ${
                         p.balance <= 5 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-slate-300'
                       }`}>
                          {p.balance} <span className="text-[9px] opacity-60 uppercase">{p.bir}</span>
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openModal(p); }}
                          style={{ padding: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                          title="Tahrirlash"
                        >
                           <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setDeleteConfirm({ isOpen: true, id: p.id });
                          }}
                          style={{ padding: 7, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 7, cursor: 'pointer', color: '#f43f5e', display: 'flex' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = '#f43f5e')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)')}
                          title="O'chirish"
                        >
                           <Trash2 size={14} />
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

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        title="Zapchastni o'chirish"
        message="Haqiqatdan ham ushbu ehtiyot qismini o'chirib tashlamoqchimisiz? Sklad ma'lumotlari yangilanadi."
        onConfirm={() => {
          if (deleteConfirm.id) deleteZapchast(deleteConfirm.id);
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  );
}
