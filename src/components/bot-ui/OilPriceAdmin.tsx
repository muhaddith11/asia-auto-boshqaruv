'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, Search, Loader2, Trash2, Pencil, Save, Banknote, Droplet, Car,
} from 'lucide-react';
import {
  Identity, OilPrice, fetchOilPrices, saveOilPrice, deleteOilPriceApi,
} from '@/components/bot-ui/botClient';

interface Props {
  identity: Identity;
  onBack: () => void;
}

const TURI_META: Record<OilPrice['turi'], { label: string; emoji: string; color: string }> = {
  yog: { label: "Yog'", emoji: '🛢️', color: '#f59e0b' },
  yog_filtri: { label: "Yog' filtri", emoji: '🧴', color: '#3b82f6' },
  salon_filtri: { label: 'Salon filtri', emoji: '🌬️', color: '#22c55e' },
};
const TURI_LIST: OilPrice['turi'][] = ['yog', 'yog_filtri', 'salon_filtri'];

const emptyForm = { turi: 'yog' as OilPrice['turi'], nom: '', mashina: '', narx: '', tannarx: '' };

// Narxni "250 000" ko'rinishiga keltiradi.
const fmtSom = (v: number | string | null | undefined) => {
  const n = Number(String(v ?? '').replace(/[^\d]/g, ''));
  return n ? n.toLocaleString('ru-RU') : '';
};

export default function OilPriceAdmin({ identity, onBack }: Props) {
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [prices, setPrices] = useState<OilPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [turiFilter, setTuriFilter] = useState<'all' | OilPrice['turi']>('all');

  const [editing, setEditing] = useState<OilPrice | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchOilPrices(identity);
      if (res.ok) {
        setPrices(res.prices || []);
      } else {
        toast.error(res.error || "Ro'yxat yuklanmadi");
      }
    } catch {
      toast.error("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return prices.filter((p) => {
      const okTuri = turiFilter === 'all' || p.turi === turiFilter;
      const okSearch = !s || (p.nom || '').toLowerCase().includes(s);
      return okTuri && okSearch;
    });
  }, [prices, search, turiFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setMode('form');
  };
  const openEdit = (p: OilPrice) => {
    setEditing(p);
    setForm({
      turi: p.turi,
      nom: p.nom || '',
      mashina: p.mashina && p.mashina !== 'UMUMIY' ? p.mashina : '',
      narx: p.narx != null ? String(p.narx) : '',
      tannarx: p.tannarx != null ? String(p.tannarx) : '',
    });
    setMode('form');
  };

  const save = async () => {
    if (!form.nom.trim()) {
      toast.error('Nomini kiriting');
      return;
    }
    setSaving(true);
    const payload = {
      turi: form.turi,
      nom: form.nom.trim(),
      mashina: form.mashina.trim() || 'UMUMIY',
      narx: form.narx.trim() ? Number(form.narx) : 0,
      tannarx: form.tannarx.trim() ? Number(form.tannarx) : 0,
    };
    try {
      const res = await saveOilPrice(identity, payload, editing?.id);
      if (!res.ok) throw new Error(res.error || "Saqlab bo'lmadi");
      toast.success(editing ? 'Yangilandi ✅' : "Qo'shildi ✅");
      setMode('list');
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error('Xatolik: ' + (e?.message || 'saqlanmadi'));
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async (id: number) => {
    const prev = prices;
    setPrices((l) => l.filter((p) => p.id !== id));
    setConfirmDelete(null);
    try {
      const res = await deleteOilPriceApi(identity, id);
      if (!res.ok) throw new Error(res.error);
      toast.success("O'chirildi");
    } catch (e: any) {
      setPrices(prev);
      toast.error("O'chirishda xatolik: " + (e?.message || ''));
    }
  };

  // ─────────────────────────── FORMA ───────────────────────────
  if (mode === 'form') {
    return (
      <div className="slide-in">
        <button
          onClick={() => !saving && setMode('list')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>

        <h2 className="text-lg font-bold mb-4">{editing ? 'Tahrirlash' : "Yangi yog'/filtr"}</h2>

        {/* Turi */}
        <label className="block text-xs text-gray-400 mb-1">Turi</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {TURI_LIST.map((t) => {
            const meta = TURI_META[t];
            const active = form.turi === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setForm({ ...form, turi: t })}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-xs font-bold border transition-all"
                style={
                  active
                    ? { background: meta.color, borderColor: meta.color, color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af' }
                }
              >
                <span className="text-base">{meta.emoji}</span> {meta.label}
              </button>
            );
          })}
        </div>

        {/* Nom */}
        <label className="block text-xs text-gray-400 mb-1">Nomi</label>
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500">
          <Droplet className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            placeholder="Masalan: Shell Helix HX8 5W-40"
            className="w-full bg-transparent py-3 text-white outline-none"
          />
        </div>

        {/* Sotish narxi */}
        <label className="block text-xs text-gray-400 mb-1">Sotish narxi</label>
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 mb-4 focus-within:ring-2 focus-within:ring-emerald-500">
          <Banknote className="w-4 h-4 text-emerald-500 shrink-0" />
          <input
            value={fmtSom(form.narx)}
            onChange={(e) => setForm({ ...form, narx: e.target.value.replace(/[^\d]/g, '') })}
            inputMode="numeric"
            placeholder="Masalan: 250 000"
            className="w-full bg-transparent py-3 text-white outline-none"
          />
          <span className="text-gray-500 text-sm shrink-0">so'm</span>
        </div>

        {/* Tannarx */}
        <label className="block text-xs text-gray-400 mb-1">Tannarx (sotib olish narxi)</label>
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 mb-4 focus-within:ring-2 focus-within:ring-red-500">
          <Banknote className="w-4 h-4 text-red-400 shrink-0" />
          <input
            value={fmtSom(form.tannarx)}
            onChange={(e) => setForm({ ...form, tannarx: e.target.value.replace(/[^\d]/g, '') })}
            inputMode="numeric"
            placeholder="Masalan: 180 000"
            className="w-full bg-transparent py-3 text-white outline-none"
          />
          <span className="text-gray-500 text-sm shrink-0">so'm</span>
        </div>

        {Number(form.narx) > 0 && (
          <div className="text-xs text-gray-400 mb-4 -mt-2">
            Foyda (bir dona): <span className="text-emerald-400 font-semibold">{(Number(form.narx.replace(/[^\d]/g, '') || 0) - Number(form.tannarx.replace(/[^\d]/g, '') || 0)).toLocaleString('ru-RU')} so'm</span>
          </div>
        )}

        {/* Marka / Model */}
        <label className="block text-xs text-gray-400 mb-1">Marka / Model (ixtiyoriy)</label>
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 mb-6 focus-within:ring-2 focus-within:ring-blue-500">
          <Car className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={form.mashina}
            onChange={(e) => setForm({ ...form, mashina: e.target.value })}
            placeholder="Bo'sh = Umumiy (hamma mashinaga)"
            className="w-full bg-transparent py-3 text-white outline-none"
          />
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => !saving && setMode('list')}
            disabled={saving}
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 font-bold py-3.5 rounded-xl disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            Bekor
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────── RO'YXAT ───────────────────────────
  return (
    <div className="slide-in">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>
        <h2 className="text-base font-bold">Yog' narxlari</h2>
      </div>

      <button
        onClick={openAdd}
        className="w-full mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-blue-950/40"
      >
        <Plus className="w-5 h-5" /> Yangi yog'/filtr
      </button>

      <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 mb-4">
        <Search className="w-4 h-4 text-gray-500 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nomi..."
          className="w-full bg-transparent py-2.5 text-white outline-none text-sm"
        />
      </div>

      {/* Turi bo'yicha filtr */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setTuriFilter('all')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
            turiFilter === 'all' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'
          }`}
        >
          Hammasi
        </button>
        {TURI_LIST.map((t) => {
          const meta = TURI_META[t];
          const active = turiFilter === t;
          const n = prices.filter((p) => p.turi === t).length;
          return (
            <button
              key={t}
              onClick={() => setTuriFilter(t)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
              style={
                active
                  ? { background: meta.color, borderColor: meta.color, color: '#fff' }
                  : { background: meta.color + '18', borderColor: meta.color + '55', color: meta.color }
              }
            >
              {meta.emoji} {meta.label} ({n})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 text-gray-500 bg-gray-800/50 border border-gray-700 rounded-xl">
          <Droplet className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">{prices.length === 0 ? "Hozircha yog'/filtr yo'q" : 'Topilmadi'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p) => {
            const meta = TURI_META[p.turi];
            const margin = (Number(p.narx) || 0) - (Number(p.tannarx) || 0);
            return (
              <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex gap-3">
                <div
                  className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-xl"
                  style={{ background: meta.color + '22' }}
                >
                  {meta.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="font-bold text-sm truncate">{p.nom || '—'}</div>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: meta.color + '22', color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  {p.mashina && p.mashina !== 'UMUMIY' && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                      <Car className="w-3 h-3 shrink-0" /> <span className="truncate">{p.mashina}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[12px] mt-1">
                    <span className="text-emerald-400 font-bold">{fmtSom(p.narx)} so'm</span>
                    <span className="text-gray-500">tannarx {fmtSom(p.tannarx)}</span>
                    <span className={margin >= 0 ? 'text-blue-400' : 'text-red-400'}>foyda {margin.toLocaleString('ru-RU')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-300">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {confirmDelete === p.id ? (
                    <button onClick={() => doDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">
                      Ha?
                    </button>
                  ) : (
                    <button onClick={() => setConfirmDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
