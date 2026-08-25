'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, PackageOpen, PackageCheck, CheckCircle2, Car as CarIcon, Plus, X, XCircle, Pencil, Play, Square, Timer } from 'lucide-react';
import { Car, Identity, updateStage, updateCarInfo, toggleWorkSession, stageMeta, fmtTime, fmtDuration } from './botClient';
import PhoneInput from '@/components/PhoneInput';
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
  const [editMode, setEditMode] = useState(false);
  const [editRaqam, setEditRaqam] = useState(car.raqam || '');
  const [editTel, setEditTel] = useState(car.tel || '');
  const [zapNames, setZapNames] = useState<string[]>(['']);
  const meta = stageMeta(car.bosqich);

  // ── Ish vaqti hisoblagichi ──
  // Ochiq sessiya davomida raqam har soniyada yangilanib tursin, aks holda xodim
  // "ishlayaptimi yo'qmi" tushunmaydi va tugatishni unutadi.
  const [openSince, setOpenSince] = useState<string | null>(car.ish_boshlandi);
  const [baseMinutes, setBaseMinutes] = useState<number>(car.ish_daqiqa || 0);
  const [, setTick] = useState(0); // faqat qayta chizish uchun
  const [timerBusy, setTimerBusy] = useState(false);

  useEffect(() => {
    if (!openSince) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [openSince]);

  const openMinutes = openSince ? (Date.now() - new Date(openSince).getTime()) / 60000 : 0;
  const totalMinutes = baseMinutes + openMinutes;

  const toggleTimer = async () => {
    if (timerBusy) return;
    setTimerBusy(true);
    const action = openSince ? 'stop' : 'start';
    try {
      const res = await toggleWorkSession(identity, car.id, action);
      if (!res.ok) {
        toast.error(res.error || 'Xatolik');
        return;
      }
      if (action === 'start') {
        setOpenSince(res.startedAt || new Date().toISOString());
        toast.success('Ish boshlandi ⏱️');
      } else {
        setBaseMinutes((m) => m + openMinutes);
        setOpenSince(null);
        toast.success(`Ish to'xtatildi · ${fmtDuration(res.minutes ?? openMinutes)}`);
      }
    } catch {
      toast.error("Server bilan bog'lanishda xatolik");
    } finally {
      setTimerBusy(false);
    }
  };

  const timerActive = !!openSince;
  const canTrackTime = car.bosqich !== 'topshirildi' && car.bosqich !== 'bekor_qilindi';

  const openEdit = () => {
    setEditRaqam(car.raqam || '');
    setEditTel(car.tel || '');
    setEditMode(true);
  };
  const saveEdit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await updateCarInfo(identity, car.id, { raqam: editRaqam, tel: editTel });
      if (!res.ok) {
        toast.error(res.error || 'Xatolik');
        setBusy(false);
        return;
      }
      toast.success('Saqlandi ✅');
      onDone();
    } catch {
      toast.error("Server bilan bog'lanishda xatolik");
      setBusy(false);
    }
  };

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
      {editMode ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-base font-bold">
            <CarIcon className="w-5 h-5 text-blue-400" /> {car.mashina}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mashina raqami</label>
            <input
              value={editRaqam}
              onChange={(e) => setEditRaqam(e.target.value)}
              placeholder="01 A 123 AA"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2.5 px-3 text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mijoz raqami</label>
            <PhoneInput
              value={editTel}
              onChange={setEditTel}
              placeholder="+998 90 123 45 67"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditMode(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
              Bekor
            </button>
            <button disabled={busy} onClick={saveEdit} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Saqlash'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-2 relative">
          <button onClick={openEdit} className="absolute top-3 right-3 text-gray-400 hover:text-blue-400 p-1" title="Raqam / telefonni tahrirlash">
            <Pencil className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-lg font-bold pr-8">
            <CarIcon className="w-5 h-5 text-blue-400 shrink-0" /> {car.mashina}
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
      )}

      {/* Ish vaqti hisoblagichi — tezlik bali shu vaqtga qarab beriladi */}
      {canTrackTime && !editMode && !zapMode && (
        <div
          className={`rounded-xl p-4 border ${
            timerActive ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-gray-800 border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Timer className={`w-4 h-4 shrink-0 ${timerActive ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-300">Ish vaqti</span>
            </div>
            <span className={`font-black tabular-nums ${timerActive ? 'text-emerald-400' : 'text-gray-200'}`}>
              {fmtDuration(totalMinutes)}
            </span>
          </div>

          <button
            disabled={timerBusy}
            onClick={toggleTimer}
            className={`w-full font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg ${
              timerActive
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-red-950/40'
                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-950/40'
            }`}
          >
            {timerBusy ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : timerActive ? (
              <><Square className="w-4 h-4" /> Ishni to'xtatdim</>
            ) : (
              <><Play className="w-4 h-4" /> Ishni boshladim</>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
            {timerActive
              ? "Ish tugagach to'xtating — ball shu vaqtga qarab beriladi."
              : 'Kalitni qo\'lga olganda bosing. Tushlik yoki zapchast kutishda to\'xtatib turing.'}
          </p>
        </div>
      )}

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
