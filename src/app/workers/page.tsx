'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import SalaryModal from '@/components/SalaryModal';
import { 
  UserCog, 
  Trash2, 
  Edit3, 
  Phone, 
  Percent, 
  User as UserIcon,
  Banknote,
  Search,
  Plus,
  RotateCcw,
  Filter,
  X,
  Save,
  Briefcase,
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

export default function WorkersPage() {
  const { xodimlar, addXodim, updateXodim, deleteXodim, buyurtmalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({ search: '' });
  const [appliedFilters, setAppliedFilters] = useState({ search: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [salaryWorker, setSalaryWorker] = useState<any>(null);

  const [formData, setFormData] = useState({
    ism: '',
    tel: '',
    mutax: '',
    foiz: 40,
    izoh: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const openModal = (worker: any = null) => {
    if (worker) {
      setEditingWorker(worker);
      setFormData({
        ism: worker.ism,
        tel: worker.tel || '',
        mutax: worker.mutax || '',
        foiz: worker.foiz || 40,
        izoh: worker.izoh || ''
      });
    } else {
      setEditingWorker(null);
      setFormData({ ism: '', tel: '', mutax: '', foiz: 40, izoh: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWorker(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker) {
      updateXodim(editingWorker.id, formData);
    } else {
      addXodim(formData);
    }
    closeModal();
  };

  const applyFilters = () => setAppliedFilters({ ...filters });
  const resetFilters = () => {
    setFilters({ search: '' });
    setAppliedFilters({ search: '' });
  };

  const filteredWorkers = xodimlar.filter(x => 
    x.ism.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
    (x.mutax && x.mutax.toLowerCase().includes(appliedFilters.search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      
      {/* ── PAGE HEADER ── */}
      <div className="px-7 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-white tracking-tight">Xodimlar boshqaruvi</h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Ustalar va xodimlarni boshqarish, ularning stavkalari va maoshlarini hisoblash.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-[12px] flex items-center gap-2 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
        >
          <Plus size={16} /> Yangi xodim qo'shish
        </button>
      </div>

      {/* ── FILTERS PANEL ── */}
      <div className="mx-7 mt-4 p-5 bg-surface border border-border rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label style={S.label}>Qidiruv (Ism yoki Mutaxassislik)</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Xodimni qidirish..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                style={{ ...S.input, paddingLeft: '34px' }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 items-end">
             <button 
                onClick={applyFilters}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg text-[12px] transition-all active:scale-95 shadow-lg shadow-blue-500/10"
              >
                Qidirish
              </button>
              <button 
                onClick={resetFilters}
                className="px-6 border border-border bg-surface2 hover:bg-surface3 text-slate-400 py-2.5 rounded-lg text-[12px] transition-all active:scale-95"
              >
                <RotateCcw size={14} />
              </button>
          </div>
        </div>
      </div>

      {/* ── WORKERS TABLE ── */}
      <div className="flex-1 px-7 py-5 overflow-auto">
        {filteredWorkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-surface/30 border border-dashed border-border rounded-xl">
            <UserCog size={48} className="mb-4 opacity-20" />
            <p className="text-[14px] font-bold">Xodimlar topilmadi</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-[12px] whitespace-nowrap">
              <thead className="bg-[#1e212b] text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-4">XODIM</th>
                  <th className="px-6 py-4">MUTAXASSISLIK</th>
                  <th className="px-6 py-4">TELEFON</th>
                  <th className="px-6 py-4 text-center">STAVKA</th>
                  <th className="px-6 py-4 text-right">AYLANMA</th>
                  <th className="px-6 py-4 text-right">MAOSH (HISOB)</th>
                  <th className="px-6 py-4 text-center">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredWorkers.map((x, idx) => {
                  const workerOrders = buyurtmalar.filter(b => b.services.some(s => s.workerId === x.id));
                  const workerTurnover = workerOrders.reduce((sum, b) => 
                    sum + b.services.filter(s => s.workerId === x.id).reduce((sSum, s) => sSum + (s.narx || 0), 0), 0
                  );
                  const workerEarned = Math.round(workerTurnover * x.foiz / 100);

                  return (
                    <tr key={x.id} className={`${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'} hover:bg-white/[0.02] transition-colors group`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                             {x.ism.charAt(0).toUpperCase()}
                           </div>
                           <span className="font-bold text-white uppercase">{x.ism}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-medium uppercase tracking-tight">{x.mutax || 'Usta'}</td>
                      <td className="px-6 py-4 text-slate-300 font-bold">{x.tel || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20">{x.foiz}%</span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 font-bold">{workerTurnover.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-black text-emerald-500">{workerEarned.toLocaleString()} <span className="text-[9px] text-slate-500">UZS</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSalaryWorker(x)}
                            className="p-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/20 rounded-md transition-all shadow-sm flex items-center gap-1.5 px-3"
                            title="Maosh hisoblash"
                          >
                             <Banknote size={12} /> <span className="text-[10px] font-black uppercase">Maosh</span>
                          </button>
                          <button 
                            onClick={() => openModal(x)}
                            className="p-1.5 bg-white/5 text-slate-400 hover:text-white border border-border rounded-md transition-all"
                          >
                             <Edit3 size={12} />
                          </button>
                          <button 
                            onClick={() => { if(confirm('Ochirishni tasdiqlaysizmi?')) deleteXodim(x.id); }}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-md transition-all"
                          >
                             <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              
              <div className="px-6 py-5 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1e212b]">
                 <h3 className="font-bold text-[14px] text-white tracking-wide uppercase">
                    {editingWorker ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}
                 </h3>
                 <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full">
                   <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                 <div className="space-y-1.5">
                    <label style={S.label}>Ism Familiya *</label>
                    <div className="relative group">
                      <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" required value={formData.ism} 
                        onChange={(e) => setFormData({...formData, ism: e.target.value})} 
                        style={{ ...S.input, paddingLeft: '34px' }}
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label style={S.label}>Mutaxassislik</label>
                        <div className="relative group">
                          <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                          <input 
                            type="text" value={formData.mutax} 
                            onChange={(e) => setFormData({...formData, mutax: e.target.value})} 
                            style={{ ...S.input, paddingLeft: '34px' }}
                            placeholder="Usta, elektrik..."
                          />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label style={S.label}>Telefon</label>
                        <div className="relative group">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                          <input 
                            type="text" value={formData.tel} 
                            onChange={(e) => setFormData({...formData, tel: e.target.value})} 
                            style={{ ...S.input, paddingLeft: '34px' }}
                          />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label style={S.label}>Komissiya stavkasi (%) *</label>
                    <div className="relative group">
                      <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="number" required value={formData.foiz} 
                        onChange={(e) => setFormData({...formData, foiz: parseInt(e.target.value) || 0})} 
                        style={{ ...S.input, paddingLeft: '34px' }}
                      />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 bg-[#232631] hover:bg-[#2a2d3d] text-slate-400 font-bold py-3.5 rounded-xl text-[13px] border border-[#303342] transition-all">Bekor qilish</button>
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-[13px] shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 transition-all">
                      <Save size={18} /> Saqlash
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {salaryWorker && (
        <SalaryModal 
          worker={salaryWorker} 
          onClose={() => setSalaryWorker(null)} 
        />
      )}
    </div>
  );
}
