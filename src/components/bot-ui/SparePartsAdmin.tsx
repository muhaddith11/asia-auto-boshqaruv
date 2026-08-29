'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, Search, Camera, Image as ImageIcon, X, Loader2,
  Trash2, Pencil, Package, Hash, Car, Save,
} from 'lucide-react';
import {
  Identity, SparePart, fetchSpareParts, saveSparePart, deleteSparePartApi,
  uploadSparePartImage, compressImageFile,
} from '@/components/bot-ui/botClient';

interface Props {
  identity: Identity;
  onBack: () => void;
}

const emptyForm = { nom: '', artikul: '', mashina: '', izoh: '', rasmlar: [] as string[] };

export default function SparePartsAdmin({ identity, onBack }: Props) {
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [editing, setEditing] = useState<SparePart | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchSpareParts(identity);
      if (res.ok) {
        setParts((res.parts || []).map((p: any) => ({ ...p, rasmlar: Array.isArray(p.rasmlar) ? p.rasmlar : [] })));
      } else {
        toast.error(res.error || "Ro'yxat yuklanmadi");
      }
    } catch {
      toast.error('Server bilan bog\'lanishda xatolik');
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
    if (!s) return parts;
    return parts.filter(
      (p) => (p.nom || '').toLowerCase().includes(s) || (p.artikul || '').toLowerCase().includes(s)
    );
  }, [parts, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setMode('form');
  };
  const openEdit = (p: SparePart) => {
    setEditing(p);
    setForm({
      nom: p.nom || '',
      artikul: p.artikul || '',
      // Eski yozuvlarda brand+mashina alohida bo'lishi mumkin — bitta maydonga birlashtiramiz
      mashina: [p.brand, p.mashina && p.mashina !== 'UMUMIY' ? p.mashina : ''].filter(Boolean).join(' '),
      izoh: p.izoh || '',
      rasmlar: Array.isArray(p.rasmlar) ? [...p.rasmlar] : [],
    });
    setMode('form');
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await compressImageFile(file);
        const res = await uploadSparePartImage(identity, dataUrl);
        if (!res.ok || !res.url) throw new Error(res.error || 'Yuklab bo\'lmadi');
        setForm((f) => ({ ...f, rasmlar: [...f.rasmlar, res.url] }));
      } catch (e: any) {
        toast.error('Rasm yuklanmadi: ' + (e?.message || ''));
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
  };

  const removeImage = (url: string) => setForm((f) => ({ ...f, rasmlar: f.rasmlar.filter((r) => r !== url) }));

  const save = async () => {
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
      brand: null,
      mashina: form.mashina.trim() || 'UMUMIY',
      izoh: form.izoh.trim() || null,
      rasmlar: form.rasmlar,
    };
    try {
      const res = await saveSparePart(identity, payload, editing?.id);
      if (!res.ok) throw new Error(res.error || 'Saqlab bo\'lmadi');
      toast.success(editing ? 'Yangilandi ✅' : 'Qo\'shildi ✅');
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
    const prev = parts;
    setParts((l) => l.filter((p) => p.id !== id));
    setConfirmDelete(null);
    try {
      const res = await deleteSparePartApi(identity, id);
      if (!res.ok) throw new Error(res.error);
      toast.success("O'chirildi");
    } catch (e: any) {
      setParts(prev);
      toast.error("O'chirishda xatolik: " + (e?.message || ''));
    }
  };

  const carLabel = (p: SparePart) => {
    if (!p.brand && (!p.mashina || p.mashina === 'UMUMIY')) return 'Umumiy';
    if (p.brand && (!p.mashina || p.mashina === 'UMUMIY')) return `${p.brand} — barcha`;
    return [p.brand, p.mashina].filter(Boolean).join(' ');
  };

  // ─────────────────────────── FORMA ───────────────────────────
  if (mode === 'form') {
    const busy = saving || uploading > 0;
    return (
      <div className="slide-in">
        <button
          onClick={() => !busy && setMode('list')}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>

        <h2 className="text-lg font-bold mb-4">{editing ? 'Zapchastni tahrirlash' : 'Yangi zapchast'}</h2>

        {/* Rasmlar */}
        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Rasmlar</label>
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {form.rasmlar.map((url) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-700">
              <img src={url} alt="" className="w-full h-full object-cover" onClick={() => setLightbox(url)} />
              <button
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center active:bg-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div key={`u${i}`} className="aspect-square rounded-xl border border-dashed border-gray-700 flex items-center justify-center bg-gray-800">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl active:scale-[0.98] transition-all"
          >
            <Camera className="w-5 h-5" /> Rasmga olish
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold py-3 rounded-xl active:scale-[0.98] transition-all"
          >
            <ImageIcon className="w-5 h-5" /> Galereya
          </button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
        <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />

        {/* Nom */}
        <label className="block text-xs text-gray-400 mb-1">Zapchast nomi</label>
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500">
          <Package className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            placeholder="Masalan: Old tormoz kolodkasi"
            className="w-full bg-transparent py-3 text-white outline-none"
          />
        </div>

        {/* Artikul */}
        <label className="block text-xs text-gray-400 mb-1">Detal nomeri (artikul)</label>
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500">
          <Hash className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={form.artikul}
            onChange={(e) => setForm({ ...form, artikul: e.target.value })}
            placeholder="Masalan: 96967680"
            className="w-full bg-transparent py-3 text-white outline-none font-mono"
          />
        </div>

        {/* Marka / Model — qo'lda yoziladi */}
        <label className="block text-xs text-gray-400 mb-1">Marka / Model (mashina)</label>
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 mb-4 focus-within:ring-2 focus-within:ring-blue-500">
          <Car className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={form.mashina}
            onChange={(e) => setForm({ ...form, mashina: e.target.value })}
            placeholder="Masalan: Chevrolet Gentra (bo'sh = Umumiy)"
            className="w-full bg-transparent py-3 text-white outline-none"
          />
        </div>

        {/* Izoh */}
        <label className="block text-xs text-gray-400 mb-1">Izoh (ixtiyoriy)</label>
        <textarea
          value={form.izoh}
          onChange={(e) => setForm({ ...form, izoh: e.target.value })}
          rows={2}
          placeholder="Qo'shimcha ma'lumot..."
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-3 text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-6"
        />

        <div className="flex gap-2.5">
          <button
            onClick={() => !busy && setMode('list')}
            disabled={busy}
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 font-bold py-3.5 rounded-xl disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            Bekor
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {uploading > 0 ? 'Rasm yuklanmoqda...' : saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>

        {lightbox && (
          <div className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
          </div>
        )}
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
        <h2 className="text-base font-bold">Zapchastlar katalogi</h2>
      </div>

      <button
        onClick={openAdd}
        className="w-full mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-blue-950/40"
      >
        <Plus className="w-5 h-5" /> Yangi zapchast
      </button>

      <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 mb-4">
        <Search className="w-4 h-4 text-gray-500 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom yoki detal nomeri..."
          className="w-full bg-transparent py-2.5 text-white outline-none text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 text-gray-500 bg-gray-800/50 border border-gray-700 rounded-xl">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">{parts.length === 0 ? 'Hozircha zapchast yo\'q' : 'Topilmadi'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p) => {
            const img = p.rasmlar?.[0];
            return (
              <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex gap-3">
                <div
                  className="w-16 h-16 rounded-lg bg-gray-900 shrink-0 overflow-hidden flex items-center justify-center"
                  onClick={() => img && setLightbox(img)}
                >
                  {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-700" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{p.nom || '—'}</div>
                  {p.artikul && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5 mt-1">
                      <Hash className="w-2.5 h-2.5" />{p.artikul}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                    <Car className="w-3 h-3 shrink-0" /> <span className="truncate">{carLabel(p)}</span>
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

      {lightbox && (
        <div className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}
