'use client';
import { useState } from 'react';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { Car, Identity, setServicePrices } from './botClient';
import { formatDigits, stripToDigits } from '@/lib/numberInput';

interface Props {
  car: Car;
  identity: Identity;
  onDone: () => void;
  onBack: () => void;
}

// Admin: xodim narxsiz kiritgan xizmatlarga narx qo'yadi va chekni chiqaradi.
export default function PriceEntry({ car, identity, onDone, onBack }: Props) {
  const services = car.services || [];
  const [vals, setVals] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);

  const unpriced = services.map((s, i) => ({ s, i })).filter((x) => x.s.narxsiz);
  const allFilled = unpriced.every((x) => Number(vals[x.i]) > 0);
  const pricedSum = services.reduce((sum, s) => sum + (s.narxsiz ? 0 : Number(s.narx) || 0), 0);
  const enteredSum = unpriced.reduce((sum, x) => sum + (Number(vals[x.i]) || 0), 0);
  const total = pricedSum + enteredSum + (car.zap || 0) + (car.rasxod_jami || 0);

  const submit = async () => {
    if (busy || !allFilled) return;
    setBusy(true);
    try {
      const res = await setServicePrices(
        identity,
        car.id,
        unpriced.map((x) => ({ index: x.i, narx: Number(vals[x.i]) }))
      );
      if (!res.ok) {
        toast.error(res.error || 'Xatolik');
        setBusy(false);
        return;
      }
      toast.success('Chek chiqdi, printerga yuborildi 🖨️');
      onDone();
    } catch {
      toast.error("Server bilan bog'lanishda xatolik");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 slide-in">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-1">
        <div className="text-lg font-bold">{car.mashina}</div>
        {car.raqam && <div className="text-sm text-gray-300">🔢 {car.raqam}</div>}
        <div className="text-xs text-purple-300">👤 {car.qabul_xodim_nomi} · narx kutilyapti</div>
      </div>

      <div className="space-y-3">
        {services.map((s, i) =>
          s.narxsiz ? (
            <div key={i} className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 space-y-2">
              <div className="text-sm font-semibold text-gray-100">{s.nom}</div>
              <div className="relative">
                <input
                  inputMode="numeric"
                  value={formatDigits(vals[i] || '')}
                  onChange={(e) => setVals((v) => ({ ...v, [i]: stripToDigits(e.target.value) }))}
                  placeholder="Narxi"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">UZS</span>
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-between bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm">
              <span className="text-gray-200">{s.nom}</span>
              <span className="text-gray-300 font-mono">{Number(s.narx).toLocaleString()} UZS</span>
            </div>
          )
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-gray-800 border border-gray-700 px-4 py-3">
        <span className="text-sm text-gray-400">Umumiy (zapchast/rasxod bilan)</span>
        <span className="font-black tabular-nums">{total.toLocaleString('ru-RU')} UZS</span>
      </div>

      <button
        disabled={busy || !allFilled}
        onClick={submit}
        className="w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg bg-gradient-to-r from-green-500 to-emerald-600"
      >
        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Printer className="w-5 h-5" /> Chek chiqarish</>}
      </button>
    </div>
  );
}
