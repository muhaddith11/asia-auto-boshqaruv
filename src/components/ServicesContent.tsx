'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Plus, 
  Wrench, 
  Trash2, 
  Edit3, 
  Search,
  Filter,
  RotateCcw,
  X,
  Save,
  Coins,
  Car,
  Type,
  LayoutGrid,
  ChevronDown
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

export default function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { xizmatlar, addXizmat, updateXizmat, deleteXizmat, mashinalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    sort: 'nom-asc',
    mashina: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({ search: '', sort: 'nom-asc', mashina: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    nom: '',
    narx: 0,
    mashina: 'Umumiy',
    stavka: 0
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('add') === 'true') {
      setIsModalOpen(true);
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, [searchParams]);

  if (!mounted) return null;

  const openModal = (service: any) => {
    setEditingService(service);
    setFormData({
      nom: service.nom,
      narx: service.narx,
      mashina: service.mashina,
      stavka: service.stavka || 0
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateXizmat(editingService.id, formData);
    } else {
      addXizmat(formData);
    }
    closeModal();
  };

  const applyFilters = () => setAppliedFilters({ ...filters });
  const resetFilters = () => {
    setFilters({ search: '', sort: 'nom-asc', mashina: '' });
    setAppliedFilters({ search: '', sort: 'nom-asc', mashina: '' });
  };

  const filteredServices = xizmatlar
    .filter(s => {
      const sTerm = appliedFilters.search.toLowerCase();
      const matchesSearch = s.nom.toLowerCase().includes(sTerm);
      const matchesCar = !appliedFilters.mashina || s.mashina === appliedFilters.mashina;
      return matchesSearch && matchesCar;
    })
    .sort((a, b) => {
      if (appliedFilters.sort === 'nom-asc') return a.nom.localeCompare(b.nom);
      if (appliedFilters.sort === 'nom-desc') return b.nom.localeCompare(a.nom);
      if (appliedFilters.sort === 'price-asc') return a.narx - b.narx;
      if (appliedFilters.sort === 'price-desc') return b.narx - a.narx;
      return 0;
    });

  return (
    <PageLayout
      title="Xizmatlarni boshqarish"
      subtitle="Avtoservis uchun barcha xizmat turlarini yaratish, tahrirlash va o'chirish."
      headerActions={
        <button 
          onClick={() => {
            setEditingService(null);
            setFormData({ nom: '', narx: 0, mashina: 'Umumiy', stavka: 0 });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-[12px] flex items-center gap-2 transition-all shadow-xl shadow-indigo-900/10 active:scale-95"
        >
          <Plus size={16} /> Yangi xizmat qo'shish
        </button>
      }
      filterPanel={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: Search */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Xizmat nomi bo'yicha qidirish</label>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Xizmat nomini kiriting..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-indigo-500 transition-all text-white text-[14px]"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
            </div>
          </div>

          {/* Column 2: Sort */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Saralash</label>
            <div className="relative group">
              <select 
                value={filters.sort}
                onChange={(e) => setFilters({...filters, sort: e.target.value})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all text-white text-[14px] appearance-none cursor-pointer"
              >
                <option value="nom-asc">Nomi bo'yicha (A-Z)</option>
                <option value="nom-desc">Nomi bo'yicha (Z-A)</option>
                <option value="price-asc">Arzonlari birinchi</option>
                <option value="price-desc">Qimmatlari birinchi</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-500 transition-colors" size={18} />
            </div>
          </div>

          {/* Column 3: Car */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Mashina markasi</label>
            <div className="relative group">
              <select 
                value={filters.mashina}
                onChange={(e) => setFilters({...filters, mashina: e.target.value})}
                className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all text-white text-[14px] appearance-none cursor-pointer"
              >
                <option value="">Barcha markalar</option>
                <option value="Umumiy">Umumiy (Barchasi)</option>
                {mashinalar.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-500 transition-colors" size={18} />
            </div>
          </div>
          
          <div className="col-span-full flex justify-end gap-3 mt-2">
            <button 
              onClick={applyFilters}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-2.5 rounded-xl text-[12px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40 active:scale-95 flex items-center gap-2"
            >
              Filtrlarni qo'llash
            </button>
            <button 
              onClick={resetFilters}
              className="bg-[#232631] hover:bg-[#2a2d3d] text-slate-400 font-bold px-8 py-2.5 rounded-xl text-[12px] uppercase tracking-widest transition-all active:scale-95"
            >
              Tozalash
            </button>
          </div>
        </div>
      }
    >
      <div className="flex-1">
        {filteredServices.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-4 border border-slate-800">
               <Wrench className="text-slate-600" size={32} />
            </div>
            <h3 className="text-white font-bold text-[16px]">Hech qanday xizmat topilmadi</h3>
            <p className="text-slate-500 text-[13px] mt-1">Qidiruv shartlarini o'zgartirib ko'ring</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900/20 text-left border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Nomi</th>
                  <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Kategoriya</th>
                  <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mashina markasi</th>
                  <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Narxi</th>
                  <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Stavka</th>
                  <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span className="text-[14px] font-bold text-white tracking-tight">{service.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-wider border border-red-500/20">
                        Bez kategoriya
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-tight">{service.mashina}</span>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-black text-indigo-400">
                      {service.narx.toLocaleString()} sum
                    </td>
                    <td className="px-6 py-4 text-[13px] font-bold text-slate-300">
                      {service.stavka || 0}%
                    </td>
                    <td className="px-6 py-4">
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openModal(service); }}
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
                            setDeleteConfirm({ isOpen: true, id: service.id });
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

      {/* ── EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[8px] animate-in fade-in duration-300">
           <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-3xl w-full max-w-[540px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] animate-in zoom-in duration-300">
              
              {/* Header */}
              <div className="px-8 py-6 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1f222d]">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                       <Plus size={20} className="text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-[15px] text-white uppercase tracking-tight">Yangi xizmat qo'shish</h3>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Ma'lumotlarni kiriting</p>
                    </div>
                 </div>
                 <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-border">
                   <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 {/* Xizmat Nomi */}
                 <div className="space-y-2">
                    <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Xizmat nomi *</label>
                    <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all group">
                      <Type size={20} className="text-slate-600 group-focus-within:text-indigo-500 transition-colors mr-3" />
                      <input 
                        type="text" required value={formData.nom} 
                        onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                        className="bg-transparent border-none outline-none flex-1 text-white text-[15px] font-semibold placeholder:text-slate-700"
                        placeholder="Masalan: Moy almashtirish"
                      />
                    </div>
                 </div>

                 {/* Narx va Stavka */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Narxi (so'm) *</label>
                       <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all group">
                        <Coins size={20} className="text-slate-600 group-focus-within:text-emerald-500 transition-colors mr-3" />
                        <input 
                          type="number" required value={formData.narx} 
                          onChange={(e) => setFormData({...formData, narx: parseInt(e.target.value) || 0})} 
                          className="bg-transparent border-none outline-none flex-1 text-emerald-400 text-[16px] font-black placeholder:text-slate-700"
                          placeholder="0"
                        />
                       </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Stavka (%) *</label>
                        <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all group">
                          <LayoutGrid size={20} className="text-slate-600 group-focus-within:text-indigo-500 transition-colors mr-3" />
                          <input 
                            type="number" required value={formData.stavka} 
                            onChange={(e) => setFormData({...formData, stavka: parseFloat(e.target.value) || 0})} 
                            className="bg-transparent border-none outline-none flex-1 text-white text-[16px] font-black"
                            placeholder="0"
                          />
                        </div>
                    </div>
                 </div>

                 {/* Mashina Markasi */}
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
        title="Xizmatni o'chirish"
        message="Haqiqatdan ham ushbu xizmat turini o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
        onConfirm={() => {
          if (deleteConfirm.id) deleteXizmat(deleteConfirm.id);
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </PageLayout>
  );
}
