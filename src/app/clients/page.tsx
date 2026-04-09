'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Car, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Users,
  Filter,
  RotateCcw,
  X,
  Save,
  Percent,
  Coins,
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

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mijozlar, addMijoz, updateMijoz, deleteMijoz } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'barchasi',
    debt: 'barchasi',
  });
  const [appliedFilters, setAppliedFilters] = useState({ search: '', status: 'barchasi', debt: 'barchasi' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const [formData, setFormData] = useState({
    ism: '',
    tel: '',
    tel2: '',
    skidka: 0,
    mashina: '',
    raqam: '',
    yil: '',
    vin: '',
  });

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

  const filteredClients = mijozlar.filter(m => {
    const sTerm = appliedFilters.search.toLowerCase();
    const matchesSearch = 
      m.ism.toLowerCase().includes(sTerm) ||
      (m.tel && m.tel.includes(sTerm));
    
    const matchesStatus = appliedFilters.status === 'barchasi' || m.status === appliedFilters.status;
    const matchesDebt = appliedFilters.debt === 'barchasi' ? true : 
                        appliedFilters.debt === 'qarzdorlar' ? (m.qarzdorlik > 0) : 
                        (m.qarzdorlik <= 0);

    return matchesSearch && matchesStatus && matchesDebt;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateMijoz(editingClient.id, formData);
    } else {
      addMijoz({
        ism: formData.ism,
        tel: formData.tel,
        tel2: formData.tel2,
        skidka: formData.skidka,
        mashina: formData.mashina,
        raqam: formData.raqam,
        yil: formData.yil,
        vin: formData.vin,
        status: 'aktiv',
        manzil: ''
      });
    }
    closeModal();
  };

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        ism: (client as any).ism,
        tel: (client as any).tel || '',
        tel2: (client as any).tel2 || '',
        skidka: (client as any).skidka || 0,
        mashina: (client as any).mashina || '',
        raqam: (client as any).raqam || '',
        yil: (client as any).yil || '',
        vin: (client as any).vin || '',
      });
    } else {
      setEditingClient(null);
      setFormData({ ism: '', tel: '', tel2: '', skidka: 0, mashina: '', raqam: '', yil: '', vin: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const applyFilters = () => setAppliedFilters({ ...filters });
  const resetFilters = () => {
    const defaultF = { search: '', status: 'barchasi', debt: 'barchasi' };
    setFilters(defaultF);
    setAppliedFilters(defaultF);
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      
      {/* ── PAGE HEADER ── */}
      <div className="px-7 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-white tracking-tight">Mijozlarni boshqarish</h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Mijozlar bazasini boshqarish, ularning qarzdorligi va xizmatlar tarixini kuzatish.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-[12px] flex items-center gap-2 transition-all shadow-xl shadow-indigo-900/10 active:scale-95"
        >
          <Plus size={16} /> Yangi mijoz qo'shish
        </button>
      </div>

      {/* ── FILTERS PANEL ── */}
      <div className="mx-7 mt-4 p-5 bg-surface border border-border rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label style={S.label}>Qidiruv (Ism yoki Telefon)</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Mijoz ismi yoki tel..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                style={S.input}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <label style={S.label}>Holati</label>
            <div className="relative">
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                style={S.input}
                className="appearance-none"
              >
                <option value="barchasi">Barchasi</option>
                <option value="aktiv">Aktiv</option>
                <option value="noaktiv">Aktiv emas</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <label style={S.label}>Qarzdorlik</label>
            <div className="relative">
              <select 
                value={filters.debt}
                onChange={(e) => setFilters({...filters, debt: e.target.value})}
                style={S.input}
                className="appearance-none"
              >
                <option value="barchasi">Barchasi</option>
                <option value="qarzdorlar">Faqat qarzdorlar</option>
                <option value="qarzi_yuqlar">Qarzi yo'qlar</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
           <button 
              onClick={applyFilters}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-lg text-[12px] transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
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

      {/* ── CLIENTS TABLE ── */}
      <div className="flex-1 px-7 py-5 overflow-auto">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-surface/30 border border-dashed border-border rounded-xl">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="text-[14px] font-bold">Mijozlar topilmadi</p>
            <p className="text-[11px] mt-1 opacity-60">Qidiruv shartlarini o'zgartirib ko'ring</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-[12px] whitespace-nowrap">
              <thead className="bg-[#1e212b] text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-4">MIJOZ</th>
                  <th className="px-6 py-4">TELEFON</th>
                  <th className="px-6 py-4">MASHINA</th>
                  <th className="px-6 py-4">RAQAM</th>
                  <th className="px-6 py-4 text-right">QARZ</th>
                  <th className="px-6 py-4 text-right">JAMI</th>
                  <th className="px-6 py-4 text-center">STATUS</th>
                  <th className="px-6 py-4 text-center">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((m, idx) => (
                  <tr key={m.id} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'} hover:bg-white/[0.02] transition-colors group`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                         <span className="font-bold text-white uppercase">{m.ism}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{m.tel || '—'}</td>
                    <td className="px-6 py-4 text-slate-300 font-bold uppercase">{m.mashina || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 text-[10px] font-black tracking-widest border border-slate-500/20">
                        {m.raqam || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-black ${m.qarzdorlik > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                        {m.qarzdorlik.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-500">
                       {m.jami.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                         m.status === 'aktiv' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                       }`}>
                         {m.status === 'aktiv' ? 'Aktiv' : 'Noaktiv'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openModal(m as any)}
                          className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 rounded-md transition-all shadow-sm"
                        >
                           <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Ochirishni tasdiqlaysizmi?')) deleteMijoz(m.id); }}
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
                     <Plus size={20} className="text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-[15px] text-white uppercase tracking-tight">{editingClient ? 'Mijozni tahrirlash' : 'Yangi mijoz qo\'shish'}</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Mijoz ma'lumotlari</p>
                  </div>
               </div>
               <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-xl">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Ism Familiya *</label>
                  <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all group">
                     <User size={20} className="text-slate-600 group-focus-within:text-indigo-400 transition-colors mr-3" />
                     <input 
                      type="text" required value={formData.ism} 
                      onChange={(e) => setFormData({...formData, ism: e.target.value})} 
                      className="bg-transparent border-none outline-none flex-1 text-white text-[15px] font-semibold"
                      placeholder="Mijoz ismi"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefon</label>
                  <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all group">
                     <Phone size={20} className="text-slate-600 group-focus-within:text-emerald-400 transition-colors mr-3" />
                     <input 
                      type="text" value={formData.tel} 
                      onChange={(e) => setFormData({...formData, tel: e.target.value})} 
                      className="bg-transparent border-none outline-none flex-1 text-emerald-400 text-[15px] font-black"
                      placeholder="+998"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Skidka %</label>
                <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all group">
                   <Percent size={20} className="text-slate-600 group-focus-within:text-indigo-400 transition-colors mr-3" />
                   <input 
                    type="number" value={formData.skidka} 
                    onChange={(e) => setFormData({...formData, skidka: parseInt(e.target.value) || 0})} 
                    className="bg-transparent border-none outline-none flex-1 text-white text-[16px] font-black"
                  />
                </div>
              </div>

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
