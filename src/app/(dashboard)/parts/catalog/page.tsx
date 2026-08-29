'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, X, Save, Search, Trash2, Edit3, Package, Car, Hash,
  ImagePlus, Camera, Loader2, ChevronDown, Layers,
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

// ─────────────────────────────────────────────────────────────────────────────
// Zapchastlar katalogi — admin sahifa.
// Har bir zapchast: rasm(lar) + detal nomeri (artikul) + qaysi mashina.
// Ombor (`parts`) dan alohida — bu vizual ma'lumotnoma.
// ─────────────────────────────────────────────────────────────────────────────

interface SparePart {
  id: number;
  nom: string;
  artikul: string | null;
  brand: string | null;
  mashina: string | null;
  rasmlar: string[];
  izoh: string | null;
  created_at?: string;
}

interface CarRow {
  brand: string;
  name: string;
}

const UMUMIY = 'UMUMIY';

const emptyForm = {
  nom: '',
  artikul: '',
  brand: UMUMIY,
  mashina: UMUMIY,
  izoh: '',
  rasmlar: [] as string[],
};

// Rasmni brauzerda siqib, JPEG data URL qaytaradi (yuklashni tez qiladi).
function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas mavjud emas'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error("Rasm o'qib bo'lmadi"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Fayl o'qib bo'lmadi"));
    reader.readAsDataURL(file);
  });
}

export default function SparePartsCatalogPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [cars, setCars] = useState<CarRow[]>([]);

  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<SparePart | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [lightbox, setLightbox] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ── Ma'lumotlarni yuklash ──
  const loadParts = useCallback(async () => {
    try {
      const res = await fetch('/api/spare-parts', { cache: 'no-store' });
      if (!res.ok) throw new Error('Yuklab bo\'lmadi');
      const data = await res.json();
      setParts(Array.isArray(data) ? data.map((p: any) => ({ ...p, rasmlar: Array.isArray(p.rasmlar) ? p.rasmlar : [] })) : []);
    } catch (e: any) {
      toast.error('Katalogni yuklashda xatolik');
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    (async () => {
      setLoading(true);
      await Promise.all([
        loadParts(),
        (async () => {
          try {
            const res = await fetch('/api/cars', { cache: 'no-store' });
            const data = await res.json();
            if (Array.isArray(data)) setCars(data);
          } catch { /* mashinalar tanlovsiz ham ishlaydi */ }
        })(),
      ]);
      setLoading(false);
    })();
  }, [loadParts]);

  // ── Mashina brend/model tuzilmasi ──
  const brands = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.brand).filter(Boolean))).sort();
  }, [cars]);

  const modelsByBrand = useMemo(() => {
    const map: Record<string, string[]> = {};
    cars.forEach((c) => {
      if (!c.brand) return;
      (map[c.brand] ||= []).push(c.name);
    });
    Object.values(map).forEach((arr) => arr.sort());
    return map;
  }, [cars]);

  // ── Filtrlangan ro'yxat ──
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return parts.filter((p) => {
      const matchesSearch =
        !s ||
        (p.nom || '').toLowerCase().includes(s) ||
        (p.artikul || '').toLowerCase().includes(s);
      const matchesBrand = !brandFilter || p.brand === brandFilter;
      return matchesSearch && matchesBrand;
    });
  }, [parts, search, brandFilter]);

  // ── Modal ──
  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setIsModalOpen(true);
  };

  const openEdit = (p: SparePart) => {
    setEditing(p);
    setForm({
      nom: p.nom || '',
      artikul: p.artikul || '',
      brand: p.brand || UMUMIY,
      mashina: p.mashina || UMUMIY,
      izoh: p.izoh || '',
      rasmlar: Array.isArray(p.rasmlar) ? [...p.rasmlar] : [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving || uploading > 0) return;
    setIsModalOpen(false);
    setEditing(null);
  };

  // ── Rasm yuklash ──
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name}: rasm emas`);
          continue;
        }
        const dataUrl = await compressImage(file);
        const res = await fetch('/api/spare-parts/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl }),
        });
        const json = await res.json();
        if (!res.ok || !json.url) throw new Error(json.error || 'Yuklab bo\'lmadi');
        setForm((f) => ({ ...f, rasmlar: [...f.rasmlar, json.url] }));
      } catch (e: any) {
        toast.error('Rasm yuklanmadi: ' + (e?.message || ''));
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, rasmlar: f.rasmlar.filter((r) => r !== url) }));
  };

  // ── Saqlash ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() && !form.artikul.trim()) {
      toast.error('Zapchast nomi yoki detal nomerini kiriting');
      return;
    }
    if (uploading > 0) {
      toast.error('Rasmlar yuklanmoqda, kuting...');
      return;
    }
    setSaving(true);
    const payload = {
      nom: form.nom.trim(),
      artikul: form.artikul.trim() || null,
      brand: form.brand === UMUMIY ? null : form.brand,
      mashina: form.brand === UMUMIY ? UMUMIY : form.mashina,
      izoh: form.izoh.trim() || null,
      rasmlar: form.rasmlar,
    };
    try {
      const url = editing ? `/api/spare-parts/${editing.id}` : '/api/spare-parts';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || 'Saqlab bo\'lmadi');
      toast.success(editing ? 'Yangilandi' : 'Qo\'shildi');
      setIsModalOpen(false);
      setEditing(null);
      await loadParts();
    } catch (e: any) {
      toast.error('Xatolik: ' + (e?.message || 'saqlanmadi'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Optimistik: darhol ro'yxatdan olib tashlaymiz
    const prev = parts;
    setParts((list) => list.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/spare-parts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('O\'chirildi');
    } catch {
      setParts(prev);
      toast.error('O\'chirishda xatolik');
    }
  };

  if (!mounted) return null;

  const carLabel = (p: SparePart) => {
    if (!p.brand && (!p.mashina || p.mashina === UMUMIY)) return 'Umumiy';
    if (p.brand && (!p.mashina || p.mashina === UMUMIY)) return `${p.brand} — barcha`;
    return [p.brand, p.mashina].filter(Boolean).join(' ');
  };

  const modelOptions = form.brand === UMUMIY ? [] : (modelsByBrand[form.brand] || []);

  return (
    <div className="flex-1 flex flex-col bg-transparent min-h-screen p-6 md:p-10">
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-black text-white tracking-tight leading-none flex items-center gap-3">
            <Layers size={24} className="text-indigo-500" /> Zapchastlar katalogi
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-2">
            Zapchast rasmi, detal nomeri va qaysi mashinaga tegishliligini kiritish.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-[12px] flex items-center gap-2 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 uppercase tracking-widest"
        >
          <Plus size={16} /> Yangi zapchast
        </button>
      </div>

      {/* ── FILTERS ── */}
      <div className="p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-2xl mb-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <input
            type="text"
            placeholder="Nom yoki detal nomeri bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-11 pr-4 py-3 outline-none focus:border-indigo-500/50 text-white text-[14px] transition-all"
          />
        </div>
        <div className="relative md:w-64">
          <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl pl-11 pr-9 py-3 outline-none focus:border-indigo-500/50 text-white text-[14px] appearance-none cursor-pointer transition-all"
            style={{ colorScheme: 'dark' }}
          >
            <option value="">Barcha markalar</option>
            {brands.map((b) => (
              <option key={b} value={b} style={{ background: '#1a1c24' }}>{b}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={16} />
        </div>
      </div>

      {/* ── GRID ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 py-24">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 border border-dashed border-[#2a2d3d] rounded-2xl">
          <Package size={48} className="mb-4 opacity-20" />
          <p className="text-[14px] font-bold">Zapchast topilmadi</p>
          <p className="text-[11px] mt-1 opacity-60">
            {parts.length === 0 ? "«Yangi zapchast» tugmasi orqali qo'shing" : 'Qidiruvni o\'zgartiring'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
          {filtered.map((p) => {
            const img = p.rasmlar?.[0];
            return (
              <div
                key={p.id}
                className="group bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all flex flex-col"
              >
                {/* Rasm */}
                <div
                  className="relative aspect-[4/3] bg-[#12141c] flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => img && setLightbox(img)}
                >
                  {img ? (
                    <img src={img} alt={p.nom} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Package size={36} className="text-slate-700" />
                  )}
                  {p.rasmlar?.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      +{p.rasmlar.length - 1}
                    </span>
                  )}
                </div>
                {/* Ma'lumot */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="font-bold text-white text-[14px] leading-tight line-clamp-2 min-h-[34px]">
                    {p.nom || '—'}
                  </div>
                  {p.artikul && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-1 self-start">
                      <Hash size={11} /> {p.artikul}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                    <Car size={12} className="text-slate-500 shrink-0" />
                    <span className="truncate">{carLabel(p)}</span>
                  </div>
                  {p.izoh && (
                    <div className="mt-2 text-[11px] text-slate-500 line-clamp-2">{p.izoh}</div>
                  )}
                  {/* Amallar */}
                  <div className="mt-3 pt-3 border-t border-[#2a2d3d] flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.07] border border-[#2a2d3d] text-slate-300 text-[11px] font-bold py-2 rounded-lg transition-all"
                    >
                      <Edit3 size={13} /> Tahrir
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, id: p.id })}
                      className="px-3 flex items-center justify-center bg-rose-500/[0.08] hover:bg-rose-500/[0.15] border border-rose-500/20 text-rose-400 rounded-lg transition-all"
                      title="O'chirish"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[8px]">
          <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-3xl w-full max-w-[560px] max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-5 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1f222d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Layers size={20} className="text-indigo-500" />
                </div>
                <h3 className="font-black text-[15px] text-white uppercase tracking-tight">
                  {editing ? 'Zapchastni tahrirlash' : 'Yangi zapchast'}
                </h3>
              </div>
              <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Rasmlar */}
              <div className="space-y-2">
                <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Rasmlar</label>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                  {form.rasmlar.map((url) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-[#2a2d3d] group/img">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-all"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  {/* Yuklanayotgan placeholderlar */}
                  {Array.from({ length: uploading }).map((_, i) => (
                    <div key={`up-${i}`} className="aspect-square rounded-xl border border-dashed border-[#2a2d3d] flex items-center justify-center bg-[#12141c]">
                      <Loader2 size={20} className="animate-spin text-indigo-400" />
                    </div>
                  ))}
                  {/* Qo'shish tugmalari */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-[#2a2d3d] hover:border-indigo-500/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-400 transition-all"
                  >
                    <ImagePlus size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Galereya</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-[#2a2d3d] hover:border-indigo-500/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-400 transition-all"
                  >
                    <Camera size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Kamera</span>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
              </div>

              {/* Nom */}
              <div className="space-y-2">
                <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Zapchast nomi</label>
                <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-3.5 focus-within:border-indigo-500 transition-all">
                  <Package size={18} className="text-slate-600 mr-3" />
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="bg-transparent border-none outline-none flex-1 text-white text-[15px] font-semibold"
                    placeholder="Masalan: Old tormoz kolodkasi"
                  />
                </div>
              </div>

              {/* Detal nomeri */}
              <div className="space-y-2">
                <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Detal nomeri (artikul)</label>
                <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-4 py-3.5 focus-within:border-indigo-500 transition-all">
                  <Hash size={18} className="text-slate-600 mr-3" />
                  <input
                    type="text"
                    value={form.artikul}
                    onChange={(e) => setForm({ ...form, artikul: e.target.value })}
                    className="bg-transparent border-none outline-none flex-1 text-white text-[15px] font-mono font-semibold"
                    placeholder="Masalan: 96967680"
                  />
                </div>
              </div>

              {/* Mashina: brend + model */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Marka</label>
                  <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-3 py-3.5 focus-within:border-amber-500 transition-all">
                    <Car size={18} className="text-slate-600 mr-2" />
                    <select
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value, mashina: UMUMIY })}
                      className="bg-transparent border-none outline-none flex-1 text-white text-[14px] font-semibold appearance-none cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value={UMUMIY} style={{ background: '#1a1c24' }}>Umumiy</option>
                      {brands.map((b) => (
                        <option key={b} value={b} style={{ background: '#1a1c24' }}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Model</label>
                  <div className={`bg-[#1e212b] border border-[#2a2d3d] rounded-xl flex items-center px-3 py-3.5 transition-all ${form.brand === UMUMIY ? 'opacity-40' : 'focus-within:border-amber-500'}`}>
                    <select
                      value={form.mashina}
                      onChange={(e) => setForm({ ...form, mashina: e.target.value })}
                      disabled={form.brand === UMUMIY}
                      className="bg-transparent border-none outline-none flex-1 text-white text-[14px] font-semibold appearance-none cursor-pointer disabled:cursor-not-allowed"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value={UMUMIY} style={{ background: '#1a1c24' }}>Barcha modellar</option>
                      {/* Saqlangan model ro'yxatda bo'lmasa ham ko'rsatamiz (qiymat yo'qolmasin) */}
                      {form.mashina !== UMUMIY && !modelOptions.includes(form.mashina) && (
                        <option value={form.mashina} style={{ background: '#1a1c24' }}>{form.mashina}</option>
                      )}
                      {modelOptions.map((m) => (
                        <option key={m} value={m} style={{ background: '#1a1c24' }}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Izoh */}
              <div className="space-y-2">
                <label className="block text-[12px] font-black text-slate-500 uppercase tracking-widest ml-1">Izoh (ixtiyoriy)</label>
                <textarea
                  value={form.izoh}
                  onChange={(e) => setForm({ ...form, izoh: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1e212b] border border-[#2a2d3d] rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-white text-[14px] resize-none transition-all"
                  placeholder="Qo'shimcha ma'lumot..."
                />
              </div>

              {/* Amallar */}
              <div className="pt-2 flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploading > 0}
                  className="flex-1 bg-[#232631] hover:bg-[#2a2d3d] text-slate-400 font-black py-3.5 rounded-xl text-[13px] uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading > 0}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 rounded-xl text-[13px] uppercase tracking-widest shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {uploading > 0 ? 'Rasm yuklanmoqda...' : saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-2xl" />
          <button className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
            <X size={22} />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Zapchastni o'chirish"
        message="Haqiqatan ham ushbu zapchastni katalogdan o'chirmoqchimisiz?"
        onConfirm={() => { if (deleteConfirm.id != null) handleDelete(deleteConfirm.id); }}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  );
}
