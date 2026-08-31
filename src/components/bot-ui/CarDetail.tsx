'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, PackageOpen, PackageCheck, CheckCircle2, Car as CarIcon, Plus, X, XCircle, Pencil, Play, Timer, Wallet, Receipt } from 'lucide-react';
import { Car, Identity, updateStage, updateCarInfo, toggleWorkSession, addRasxod, stageMeta, fmtTime, fmtDuration } from './botClient';
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
  const [rasxodMode, setRasxodMode] = useState(false);
  const [rasxodRows, setRasxodRows] = useState<{ nom: string; summa: string }[]>([{ nom: '', summa: '' }]);
  const meta = stageMeta(car.bosqich);

  // Rasxod (xarajat) — faqat faol (to'lanmagan) mashinaga qo'shiladi.
  const canRasxod = car.holat !== 'tulangan' && car.bosqich !== 'topshirildi' && car.bosqich !== 'bekor_qilindi';
  const rasxodlar = car.rasxodlar || [];
  const rasxodJami = car.rasxod_jami || 0;

  // ── Ish vaqti hisoblagichi ──
  // Ochiq sessiya davomida raqam har soniyada yangilanib tursin, aks holda xodim
  // "ishlayaptimi yo'qmi" tushunmaydi va tugatishni unutadi.
  const [openSince, setOpenSince] = useState<string | null>(car.ish_boshlandi);
  // To'xtatish tugmasi yo'q — yig'ilgan vaqt faqat serverdan keladi, shuning
  // uchun holat (state) shart emas.
  const baseMinutes = car.ish_daqiqa || 0;
  const [, setTick] = useState(0); // faqat qayta chizish uchun
  const [timerBusy, setTimerBusy] = useState(false);

  useEffect(() => {
    if (!openSince) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [openSince]);

  const openMinutes = openSince ? (Date.now() - new Date(openSince).getTime()) / 60000 : 0;
  const totalMinutes = baseMinutes + openMinutes;

  // Faqat BOSHLASH. To'xtatish tugmasi yo'q — vaqt "Tayyor"/"Zapchast kerak"/
  // "Topshirildi"/"Bekor" bosilganda server tomonda o'zi yopiladi. Ikkita tugma
  // ustalarni chalg'itardi.
  const startTimer = async () => {
    if (timerBusy || openSince) return;
    setTimerBusy(true);
    try {
      const res = await toggleWorkSession(identity, car.id, 'start');
      if (!res.ok) {
        toast.error(res.error || 'Xatolik');
        return;
      }
      setOpenSince(res.startedAt || new Date().toISOString());
      toast.success(baseMinutes > 0 ? 'Davom etyapmiz ⏱️' : 'Ish boshlandi ⏱️');
    } catch {
      toast.error("Server bilan bog'lanishda xatolik");
    } finally {
      setTimerBusy(false);
    }
  };

  const timerActive = !!openSince;
  // Vaqt yig'ilgan, lekin hozir ketmayapti — masalan zapchast kutilgach
  // sessiya avtomatik yopilgan, usta ishga qaytishi kerak.
  const toxtagan = !openSince && baseMinutes > 0;
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

  // ── Rasxod (xarajat) ──────────────────────────────────────────────────────
  const openRasxod = () => {
    setRasxodRows([{ nom: '', summa: '' }]);
    setRasxodMode(true);
  };
  const setRasxodAt = (i: number, field: 'nom' | 'summa', v: string) =>
    setRasxodRows((a) => a.map((x, idx) => (idx === i ? { ...x, [field]: v } : x)));
  const addRasxodRow = () => setRasxodRows((a) => [...a, { nom: '', summa: '' }]);
  const removeRasxodRow = (i: number) => setRasxodRows((a) => a.filter((_, idx) => idx !== i));
  const rasxodValid = rasxodRows.some((r) => r.nom.trim() && Math.round(Number(r.summa) || 0) > 0);
  const rasxodSum = rasxodRows.reduce(
    (s, r) => s + (r.nom.trim() && Number(r.summa) > 0 ? Math.round(Number(r.summa)) : 0),
    0
  );
  const saveRasxod = async () => {
    if (busy) return;
    const items = rasxodRows
      .map((r) => ({ nom: r.nom.trim(), summa: Math.round(Number(r.summa) || 0) }))
      .filter((r) => r.nom && r.summa > 0);
    if (items.length === 0) return;
    setBusy(true);
    try {
      const res = await addRasxod(identity, car.id, items);
      if (!res.ok) {
        toast.error(res.error || 'Xatolik');
        setBusy(false);
        return;
      }
      toast.success(`Rasxod saqlandi — ${rasxodSum.toLocaleString('ru-RU')} so'm kassadan ayirildi`);
      onDone();
    } catch {
      toast.error("Server bilan bog'lanishda xatolik");
      setBusy(false);
    }
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
      {canTrackTime && !editMode && !zapMode && !rasxodMode && (
        <div
          className={`rounded-xl p-4 border ${
            timerActive ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-gray-800 border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Timer className={`w-4 h-4 shrink-0 ${timerActive ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-300">Ish vaqti</span>
              {timerActive && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  KETYAPTI
                </span>
              )}
              {toxtagan && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  {"TO'XTAGAN"}
                </span>
              )}
            </div>
            <span className={`font-black tabular-nums ${timerActive ? 'text-emerald-400' : 'text-gray-200'}`}>
              {fmtDuration(totalMinutes)}
            </span>
          </div>

          {!timerActive && (
            <button
              disabled={timerBusy}
              onClick={startTimer}
              className="w-full font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-950/40"
            >
              {timerBusy ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : toxtagan ? (
                <><Play className="w-4 h-4" /> Ishga qaytdim</>
              ) : (
                <><Play className="w-4 h-4" /> Ishni boshladim</>
              )}
            </button>
          )}

          <p className={`text-xs text-gray-500 leading-relaxed ${timerActive ? '' : 'mt-2.5'}`}>
            {timerActive
              ? "Vaqt ketyapti. Ish tugagach pastdagi «Tayyor» tugmasini bosing — vaqt o'zi to'xtaydi."
              : toxtagan
                ? "Vaqt to'xtagan. Ishga qaytganingizda bosing."
                : "Kalitni qo'lga olganda bosing — ball shu vaqtga qarab beriladi."}
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
      ) : rasxodMode ? (
        // ── Rasxod kiritish — nomi + summa qatorlari ──
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300">Rasxod (xarajat)</label>
            <p className="text-xs text-gray-500 mt-1">
              Summa <b className="text-red-300">naqd</b> kassadan darrov ayiriladi va chek/hisobga qo'shiladi.
            </p>
          </div>

          <div className="space-y-2.5">
            {rasxodRows.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-8 h-11 shrink-0 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-sm text-gray-400 font-bold">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <input
                    autoFocus={i === rasxodRows.length - 1}
                    value={r.nom}
                    onChange={(e) => setRasxodAt(i, 'nom', e.target.value)}
                    placeholder="Nima uchun? Masalan: old tormoz kolodka"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="relative">
                    <input
                      inputMode="numeric"
                      value={r.summa}
                      onChange={(e) => setRasxodAt(i, 'summa', e.target.value.replace(/[^\d]/g, ''))}
                      placeholder="Summa"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">UZS</span>
                  </div>
                </div>
                {rasxodRows.length > 1 && (
                  <button
                    onClick={() => removeRasxodRow(i)}
                    className="w-11 h-11 shrink-0 rounded-xl bg-gray-800 hover:bg-red-500/20 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addRasxodRow}
            className="w-full py-3 rounded-xl flex justify-center items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 text-gray-300 text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Yana rasxod qo'shish
          </button>

          {rasxodSum > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
              <span className="text-sm text-red-200">Kassadan ayiriladi</span>
              <span className="font-black text-red-300 tabular-nums">−{rasxodSum.toLocaleString('ru-RU')} so'm</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setRasxodMode(false)} className={`${btn} bg-gray-800 hover:bg-gray-700 border border-gray-700 shadow-none`}>
              Bekor
            </button>
            <button
              disabled={busy || !rasxodValid}
              onClick={saveRasxod}
              className={`${btn} bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-950/40`}
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Saqlash <Wallet className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      ) : (
        // Bosqichga qarab tugmalar
        <div className="space-y-3">
          {/* Rasxodlar — mavjudlari + qo'shish tugmasi */}
          {canRasxod && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Receipt className="w-4 h-4 shrink-0 text-red-300" />
                  <span className="text-sm font-semibold text-gray-200">Rasxodlar</span>
                </div>
                {rasxodJami > 0 && (
                  <span className="text-sm font-black text-red-300 tabular-nums whitespace-nowrap">
                    −{rasxodJami.toLocaleString('ru-RU')} so'm
                  </span>
                )}
              </div>

              {rasxodlar.length > 0 && (
                <div className="space-y-1.5">
                  {rasxodlar.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-gray-300 truncate">
                        {r.nom}
                        {r.xodim_nomi && <span className="text-gray-500"> · {r.xodim_nomi}</span>}
                      </span>
                      <span className="text-gray-200 font-semibold tabular-nums whitespace-nowrap">
                        {r.summa.toLocaleString('ru-RU')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                disabled={busy}
                onClick={openRasxod}
                className="w-full py-3 rounded-xl flex justify-center items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold transition-colors disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" /> Rasxod qo'shish
              </button>
            </div>
          )}

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
