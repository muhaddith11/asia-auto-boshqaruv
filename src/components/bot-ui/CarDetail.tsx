'use client';
import { useState } from 'react';
import { ArrowLeft, Loader2, PackageOpen, PackageCheck, CheckCircle2, Car as CarIcon, Plus, X, XCircle } from 'lucide-react';
import { Car, Identity, updateStage, stageMeta, fmtTime } from './botClient';
import toast from 'react-hot-toast';

interface Props {
  car: Car;
  identity: Identity;
  onDone: () => void; // bosqich o'zgardi → bosh ekran
  onComplete: () => void; // topshirishga o'tish
  onBack: () => void;
}

export default function CarDetail({ car, identity, onDone, onComplete, onBack }: Props) {
  const [busy, setBusy] = useState(false);
  const [zapMode, setZapMode] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [zapNames, setZapNames] = useState<string[]>(['']);
  const meta = stageMeta(car.bosqich);

  const openZap = () => {
    setZapNames(['']);
    setZapMode(true);
  };
  const setZapAt = (i: number, v: string) => setZapNames((a) => a.map((x, idx) => (idx === i ? v : x)));
  const addZapRow = () => setZapNames((a) => [...a, '']);
  const removeZapRow = (i: number) => setZapNames((a) => a.filter((_, idx) => idx !== i));
  const zapValid = zapNames.some((z) => z.trim());
  const saveZap = () => {
    const list = zapNames.map((s) => s.trim()).filter(Boolean);
    doStage('zapchast_kerak', list.join(', '));
  };

  const doStage = async (
    action: 'zapchast_kerak' | 'zapchast_keldi' | 'tayyor' | 'topshirildi' | 'bekor',
    nomi?: string,
    okMsg = 'Saqlandi ✅'
  ) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await updateStage(identity, car.id, action, nomi);
      if (!res.ok) {
        toast.error(res.error || 'Xatolik');
        setBusy(false);
        return;
      }
      toast.success(okMsg);
      onDone();
    } catch {
      toast.error("Server bilan bog'lanishda xatolik");
      setBusy(false);
    }
  };

  const btn =
    'w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg';

  return (
    <div className="space-y-5 slide-in">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      {/* Mashina kartasi */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-lg font-bold">
          <CarIcon className="w-5 h-5 text-blue-400" /> {car.mashina}
        </div>
        {car.raqam && <div className="text-sm text-gray-300">🔢 {car.raqam}</div>}
        {car.tel && car.tel.replace(/\D/g, '').length > 3 && (
          <div className="text-sm text-gray-300">
            📞 <a href={`tel:${car.tel}`} className="text-blue-400 hover:underline">{car.tel}</a>
          </div>
        )}
        <div className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg" style={{ background: meta.color + '22', color: meta.color }}>
          {meta.emoji} {meta.label}
        </div>
        <div className="text-xs text-gray-400 pt-1">Qabul: {fmtTime(car.qabul_vaqti)}</div>
        {car.zapchast_nomi && car.bosqich === 'zapchast_kutilmoqda' && (
          <div className="text-xs text-orange-300">📦 Kutilayotgan zapchast: <b>{car.zapchast_nomi}</b> ({fmtTime(car.zapchast_vaqti)})</div>
        )}
      </div>

      {/* Zapchast nomlarini kiritish — ko'p qatorli */}
      {zapMode ? (
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-300">Qaysi zapchast(lar) kerak?</label>

          <div className="space-y-2.5">
            {zapNames.map((z, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-8 h-11 shrink-0 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-sm text-gray-400 font-bold">
                  {i + 1}
                </span>
                <input
                  autoFocus={i === zapNames.length - 1}
                  value={z}
                  onChange={(e) => setZapAt(i, e.target.value)}
                  placeholder="Masalan: old tormoz kolodka"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {zapNames.length > 1 && (
                  <button
                    onClick={() => removeZapRow(i)}
                    className="w-11 h-11 shrink-0 rounded-xl bg-gray-800 hover:bg-red-500/20 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addZapRow}
            className="w-full py-3 rounded-xl flex justify-center items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 text-gray-300 text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Yana zapchast qo'shish
          </button>

          <div className="flex gap-2 pt-1">
            <button onClick={() => setZapMode(false)} className={`${btn} bg-gray-800 hover:bg-gray-700 border border-gray-700 shadow-none`}>
              Bekor
            </button>
            <button
              disabled={busy || !zapValid}
              onClick={saveZap}
              className={`${btn} bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-950/40`}
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Saqlash <PackageOpen className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      ) : (
        // Bosqichga qarab tugmalar
        <div className="space-y-3">
          {(car.bosqich === 'qabul_qilindi' || car.bosqich === 'tamirlanmoqda') && (
            <>
              <button disabled={busy} onClick={openZap} className={`${btn} bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-950/40`}>
                <PackageOpen className="w-5 h-5" /> Zapchast kerak
              </button>
              <button onClick={onComplete} className={`${btn} bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-950/40`}>
                <CheckCircle2 className="w-5 h-5" /> Tayyor (xizmat/chek)
              </button>
            </>
          )}

          {car.bosqich === 'zapchast_kutilmoqda' && (
            <button disabled={busy} onClick={() => doStage('zapchast_keldi')} className={`${btn} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40`}>
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PackageCheck className="w-5 h-5" /> Zapchast keldi</>}
            </button>
          )}

          {car.bosqich === 'tayyor' && (
            <button disabled={busy} onClick={() => doStage('topshirildi', undefined, 'Mijozga topshirildi 🚗')} className={`${btn} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40`}>
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Topshirildi (mijoz oldi)</>}
            </button>
          )}

          {/* Bekor qilish — mijoz mashinani xizmatsiz qaytarib oldi */}
          <div className="pt-3 mt-1 border-t border-gray-700/60">
            {confirmCancel ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 space-y-3">
                <p className="text-sm text-red-200 text-center">
                  Mijoz mashinani qaytarib oldimi? Ish bekor qilinadi.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 transition-colors"
                  >
                    Yo'q
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => doStage('bekor', undefined, 'Bekor qilindi ❌')}
                    className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ha, bekor qilish'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full py-3 rounded-xl text-sm font-semibold border border-red-500/30 text-red-300 hover:bg-red-500/10 flex items-center justify-center gap-2 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Bekor qilish (mijoz olib ketdi)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
