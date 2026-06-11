'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import SalaryModal from '@/components/SalaryModal';
import WorkerHistoryModal from '@/components/WorkerHistoryModal';
import PageLayout from '@/components/layout/PageLayout';
import ConfirmModal from '@/components/ConfirmModal';
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
  ChevronDown,
  Send
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
  const { xodimlar, addXodim, updateXodim, deleteXodim, buyurtmalar, maoshTarixi, ishxonaOperatsiyalar } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({ search: '' });
  const [appliedFilters, setAppliedFilters] = useState({ search: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [salaryWorker, setSalaryWorker] = useState<any>(null);
  const [historyWorker, setHistoryWorker] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    ism: '',
    tel: '',
    mutax: '',
    foiz: 40,
    role: 'xodim' as 'xodim' | 'sherik' | 'korxona',
    shareType: 'total' as 'total' | 'sub',
    parentId: undefined as number | undefined,
    telegram: ''
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
        role: worker.role || 'xodim',
        shareType: worker.shareType || 'total',
        parentId: worker.parentId,
        telegram: worker.telegram || ''
      });
    } else {
      setEditingWorker(null);
      setFormData({
        ism: '', tel: '', mutax: '', foiz: 40,
        role: 'xodim' as 'xodim' | 'sherik' | 'korxona', shareType: 'total', parentId: undefined,
        telegram: ''
      });
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
    <PageLayout
      title="Xodimlar boshqaruvi"
      subtitle="Ustalar va xodimlarni boshqarish, ularning stavkalari va maoshlarini hisoblash."
      headerActions={
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-[12px] flex items-center gap-2 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
        >
          <Plus size={16} /> Yangi xodim qo'shish
        </button>
      }
      filterPanel={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label style={S.label}>Qidiruv (Ism yoki Mutaxassislik)</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Xodimni qidirish..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
      }
    >
      <div className="flex-1">
        {filteredWorkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-surface/30 border border-dashed border-border rounded-xl">
            <UserCog size={48} className="mb-4 opacity-20" />
            <p className="text-[14px] font-bold">Xodimlar topilmadi</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((x) => {
              const isPartner  = x.role === 'sherik';
              const isKorxona  = x.role === 'korxona';

              let totalDue = 0;
              if (isPartner) {
                // 🏦 SHERIKLAR UCHUN HISOB-KITOB — sof foydadan
                const uniqueOrders = Array.from(new Map(buyurtmalar.map(b => [b.id, b])).values());
                const orderProfit = uniqueOrders
                  .filter(b => b.holat === 'tulangan')
                  .reduce((sum, b) => sum + Math.max(0, Number(b.pribil) || 0), 0);

                // Faqat 2026-05-12 dan boshlab ishxona xarajatlari ayiriladi
                const startDate = new Date('2026-05-12');
                const ishxonaXarajat = ishxonaOperatsiyalar
                  .filter(op => {
                    const opDate = new Date(op.createdAt || op.date || 0);
                    return op.type === 'expense'
                      && op.category !== 'Aylanmadan tashqari'
                      && opDate >= startDate;
                  })
                  .reduce((s, op) => s + op.amount, 0);

                // "Boshqa" kategoriyali kirimlar sherik ulushiga qo'shiladi
                const boshqaKirim = ishxonaOperatsiyalar
                  .filter(op => op.type === 'income' && op.category === 'Boshqa')
                  .reduce((s, op) => s + op.amount, 0);

                // "Korxona xodimi" rolidagi ishchilar oyligi sherik foydadan ayiriladi
                const korxonaIds = xodimlar
                  .filter(w => w.role === 'korxona')
                  .map(w => Number(w.id));
                const sherikOylikXarajat = maoshTarixi
                  .filter(m => korxonaIds.includes(Number(m.xodimId)))
                  .reduce((s, m) => s + (m.summa || 0), 0);

                const sofFoyda = Math.max(0, orderProfit + boshqaKirim - ishxonaXarajat - sherikOylikXarajat);

                if (x.shareType === 'sub') {
                  const parent = xodimlar.find(p => p.id === x.parentId);
                  const parentShare = parent ? sofFoyda * (parent.foiz / 100) : 0;
                  totalDue = parentShare * (x.foiz / 100);
                } else {
                  totalDue = sofFoyda * (x.foiz / 100);
                }
              } else {
                // 🛠️ ODDIY XODIMLAR UCHUN HISOB-KITOB
                totalDue = buyurtmalar.reduce((total, b) => {
                  const srv = (b as any).srv || b.services.reduce((s: number, sv: any) => s + (sv.narx || 0), 0);
                  const zap = (b as any).zap || 0;
                  const final = (b as any).final ?? (b as any).total ?? 0;
                  const ratio = srv > 0 ? Math.min(1, Math.max(0, final - zap) / srv) : 1;
                  return total + b.services
                    .filter(s => s.workerId === x.id)
                    .reduce((sum, s) => {
                      const raw = s.zarplata || Math.round(((s.narx || 0) * (x.foiz || 0)) / 100);
                      return sum + Math.round(raw * ratio);
                    }, 0);
                }, 0);
              }

              const totalPaid = maoshTarixi.filter(m => Number(m.xodimId) === Number(x.id)).reduce((s, m) => s + (m.summa || 0), 0);
              const unpaid = totalDue - totalPaid;

              const fmtDate = (iso?: string) => {
                if (!iso) return '—';
                try { return new Date(iso).toLocaleDateString('ru-RU'); } catch { return iso; }
              };

              const parentPartner = x.parentId ? xodimlar.find(xp => xp.id === x.parentId) : null;

              return (
                <div key={x.id} className={`${isPartner ? 'bg-[#151225] border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.05)]' : 'bg-[#0b1220] border-[#16202b]'} border rounded-2xl p-4 flex flex-col justify-between transition-all hover:translate-y-[-2px]`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${isPartner ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'} border flex items-center justify-center font-black`}>{x.ism.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-white font-bold uppercase">{x.ism}</div>
                          {isKorxona && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 tracking-widest">Korxona xodimi</span>
                          )}
                          {x.telegram && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 mt-0.5">
                              <Send size={8} /> {x.telegram}
                            </div>
                          )}
                            {isPartner && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 tracking-widest">Sherik</span>
                            )}
                          </div>
                          <div className="text-[12px] text-slate-400">
                            {x.mutax || (isPartner ? 'Sarmoyador' : isKorxona ? 'Korxona xodimi' : 'Usta')} •
                            <span className={isPartner ? 'text-indigo-400 ml-1 font-bold' : 'ml-1'}>
                              {x.shareType === 'sub' && parentPartner
                                ? `${x.foiz}% (${parentPartner.ism} ulushidan)`
                                : `${x.foiz}% ${isPartner ? 'Foydadan' : ''}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">{x.tel || '—'}</div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <div className="bg-[#07111a] border border-[#0f1b25] rounded-md py-3">
                        <div className="text-[11px] text-slate-400">{isPartner ? 'Jami ulush' : 'Qo\'shilgan'}</div>
                        <div className="text-white font-bold text-[13px]">
                          {isPartner ? Math.round(totalDue).toLocaleString() : fmtDate(x.createdAt)}
                        </div>
                      </div>
                      <div className="bg-[#07111a] border border-[#0f1b25] rounded-md py-3">
                        <div className="text-[11px] text-slate-400">To'langan</div>
                        <div className="text-slate-200 font-bold">{totalPaid.toLocaleString()}</div>
                      </div>
                      <div className="bg-[#07111a] border border-[#0f1b25] rounded-md py-3">
                        <div className="text-[11px] text-slate-400">Qoldiq</div>
                        <div className={`font-bold ${unpaid < 0 ? 'text-red-400' : 'text-slate-200'}`}>{unpaid.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSalaryWorker(x)} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 text-[12px]">
                        <Banknote size={14} /> Maosh
                      </button>
                      <button onClick={() => setHistoryWorker(x)} className="px-3 py-2 bg-surface2 hover:bg-surface3 text-slate-300 rounded-lg font-bold text-[12px] border border-border">
                        Tarix
                      </button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button onClick={() => openModal(x)} className="px-3 py-2 bg-surface2 hover:bg-surface3 border border-border text-slate-300 rounded-lg font-bold text-[12px]">Tahrirlash</button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, id: x.id })} className="px-3 py-2 bg-[#2b0f14] border border-red-500/20 text-red-500 rounded-lg font-bold text-[12px]">O'chirish</button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                    onChange={(e) => setFormData({ ...formData, ism: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, mutax: e.target.value })}
                      style={{ ...S.input, paddingLeft: '34px' }}
                      placeholder="Usta, elektrik..."
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label style={S.label}>Telegram ID (Brauzer uchun)</label>
                  <div className="relative group">
                    <Send size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text" value={formData.telegram}
                      onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                      style={{ ...S.input, paddingLeft: '34px' }}
                      placeholder="8042807902"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label style={S.label}>Telefon</label>
                  <div className="relative group">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text" value={formData.tel}
                      onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                      style={{ ...S.input, paddingLeft: '34px' }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label style={S.label}>Rol *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    style={S.input}
                  >
                    <option value="xodim">Xodim (Usta)</option>
                    <option value="sherik">Sherik (Boshliq)</option>
                    <option value="korxona">Korxona xodimi (oylik sherikdan)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label style={S.label}>{formData.role === 'sherik' ? 'Ulush (%) *' : formData.role === 'korxona' ? 'Stavka (%)' : 'Komissiya (%) *'}</label>
                  <div className="relative group">
                    <Percent size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${formData.role === 'sherik' ? 'text-indigo-500' : 'text-emerald-500'}`} />
                    <input
                      type="number" required value={formData.foiz}
                      onChange={(e) => setFormData({ ...formData, foiz: parseInt(e.target.value) || 0 })}
                      style={{ ...S.input, paddingLeft: '34px' }}
                    />
                  </div>
                </div>
              </div>

              {formData.role === 'korxona' && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-[12px] text-orange-400">
                  💼 Bu xodimning oyligi sherik foydasi hisoblanishidan <strong>ayiriladi</strong>.
                </div>
              )}

              {formData.role === 'sherik' && (
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="space-y-1.5">
                    <label style={S.label}>Ulush turi</label>
                    <select
                      value={formData.shareType}
                      onChange={(e) => setFormData({ ...formData, shareType: e.target.value as any })}
                      style={S.input}
                    >
                      <option value="total">Jami foydadan</option>
                      <option value="sub">Sherik ulushidan</option>
                    </select>
                  </div>

                  {formData.shareType === 'sub' && (
                    <div className="space-y-1.5">
                      <label style={S.label}>Kimdan olishi</label>
                      <select
                        value={formData.parentId || ''}
                        onChange={(e) => setFormData({ ...formData, parentId: parseInt(e.target.value) || undefined })}
                        style={S.input}
                        required
                      >
                        <option value="">Tanlang...</option>
                        {xodimlar
                          .filter(p => p.role === 'sherik' && p.shareType === 'total' && p.id !== editingWorker?.id)
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.ism}</option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </div>
              )}

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

      {historyWorker && (
        <WorkerHistoryModal worker={historyWorker} onClose={() => setHistoryWorker(null)} />
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Xodimni o'chirish"
        message="Haqiqatdan ham ushbu xodimni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
        onConfirm={() => {
          if (deleteConfirm.id) deleteXodim(deleteConfirm.id);
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </PageLayout>
  );
}
