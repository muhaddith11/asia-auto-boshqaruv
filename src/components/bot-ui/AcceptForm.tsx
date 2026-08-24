'use client';
import { useState } from 'react';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { acceptCar, Identity } from './botClient';
import toast from 'react-hot-toast';

interface Props {
  catalog: any;
  identity: Identity;
  onDone: () => void; // muvaffaqiyatli qabuldan keyin (bosh ekranga)
  onCancel?: () => void; // bo'lsa "Orqaga" tugmasi ko'rsatiladi (alohida ekranда)
}

export default function AcceptForm({ catalog, identity, onDone, onCancel }: Props) {
  const store = useBotOrderStore();
  const [saving, setSaving] = useState(false);

  const brands = (catalog?.brands || []).slice().sort((a: string, b: string) => a.localeCompare(b));
  const models =
    store.brand && catalog?.catalog?.[store.brand]
      ? Object.keys(catalog.catalog[store.brand]).sort((a: string, b: string) => a.localeCompare(b))
      : [];

  const canAccept = store.brand && store.model;

  const handleAccept = async () => {
    if (!canAccept || saving) return;
    setSaving(true);
    try {
      const res = await acceptCar(identity, {
        brand: store.brand,
        model: store.model,
        plateNumber: store.plateNumber,
        customerPhone: store.customerPhone,
      });
      if (!res.ok) {
        toast.error(res.error || 'Xatolik');
        setSaving(false);
        return;
      }
      toast.success('Mashina qabul qilindi ✅');
      store.reset();
      onDone();
    } catch {
      toast.error("Server bilan bog'lanishda xatolik");
      setSaving(false);
    }
  };

  const selCls =
    'w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50 transition-colors';
  const inCls =
    'w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';

  return (
    <div className="space-y-3 slide-in">
      {onCancel && (
        <button onClick={onCancel} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>
      )}

      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
          <Check className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold">Mashina qabul qilish</h2>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Marka</label>
        <select
          className={selCls}
          value={store.brand}
          onChange={(e) => store.setCarInfo({ brand: e.target.value, model: '' })}
        >
          <option value="">Tanlang...</option>
          {brands.map((b: string) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Rusum (model)</label>
        <select
          disabled={!store.brand}
          className={selCls}
          value={store.model}
          onChange={(e) => store.setCarInfo({ model: e.target.value })}
        >
          <option value="">Tanlang...</option>
          {models.map((m: string) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Mashina raqami</label>
        <input
          type="text"
          placeholder="01 A 123 AA"
          className={`${inCls} uppercase`}
          value={store.plateNumber}
          onChange={(e) => store.setCarInfo({ plateNumber: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Mijoz raqami</label>
        <PhoneInput
          value={store.customerPhone}
          onChange={(v) => store.setCarInfo({ customerPhone: v })}
          className={inCls}
          placeholder="+998 90 123 45 67"
        />
      </div>

      <button
        disabled={!canAccept || saving}
        onClick={handleAccept}
        className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-emerald-950/40"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Qabul qildim <Check className="w-5 h-5" /></>}
      </button>
    </div>
  );
}
