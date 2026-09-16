'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Car, LoaderCircle, Plus, Save, Trash2, TriangleAlert, X } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { useStore } from '@/store/useStore';
import { formatDigits, stripToDigits } from '@/lib/numberInput';
import { formatPhone } from '@/lib/phone';
import {
  carStats, parseCarInput, parseItemInput, plateKey, suggestCars, tashkentDate,
  type CarInput, type CarSuggestion, type ItemInput, type RasxodCar,
} from '@/lib/rasxodDaftar';
import { btn, COLOR, fmt, iconBtn, inputStyle, labelStyle } from './styles';

// Mashina qo'shish (ma'lumot + birinchi rasxodlar) yoki tahrirlash (faqat ma'lumot).

interface LineDraft {
  key: number;
  nom: string;
  summa: string; // faqat raqamlar
  sana: string;
}

interface Props {
  car?: RasxodCar; // berilsa — tahrirlash
  existingCars: RasxodCar[];
  onClose: () => void;
  // true — saqlandi (ota komponent modalni yopadi), false — xato (modal ochiq qoladi).
  onSubmit: (car: CarInput, items: ItemInput[]) => Promise<boolean>;
}

export default function RasxodCarModal({ car, existingCars, onClose, onSubmit }: Props) {
  const isEdit = !!car;
  const { buyurtmalar, mijozlar, mashinalar } = useStore();
  const [today] = useState(() => tashkentDate());
  const [initialForm] = useState(() => ({
    raqam: car?.raqam ?? '',
    mashina: car?.mashina ?? '',
    mijoz: car?.mijoz ?? '',
    tel: car?.tel ?? '',
    izoh: car?.izoh ?? '',
  }));
  const [form, setForm] = useState(initialForm);
  const [lines, setLines] = useState<LineDraft[]>(() => [{ key: 1, nom: '', summa: '', sana: today }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);

  // Esc faqat hali hech narsa yozilmagan bo'lsa yopadi — yozilgan ma'lumot tasodifan yo'qolmasin.
  const dirty =
    (Object.keys(form) as (keyof typeof form)[]).some((k) => form[k] !== initialForm[k]) ||
    lines.some((l) => l.nom.trim() || l.summa);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving && !dirty) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving, dirty]);

  // Raqam yozilganda buyurtma/mijoz bazasidan mashina va mijozni taklif qilamiz (eng yangi ma'lumot birinchi).
  const sources = useMemo(
    () => [...[...buyurtmalar].sort((a, b) => Number(b.id) - Number(a.id)), ...mijozlar],
    [buyurtmalar, mijozlar],
  );
  const suggestions = useMemo(
    () => (isEdit ? [] : suggestCars(form.raqam, sources)),
    [isEdit, form.raqam, sources],
  );

  const duplicate = useMemo(() => {
    const key = plateKey(form.raqam);
    return key ? existingCars.find((c) => c.id !== car?.id && plateKey(c.raqam) === key) ?? null : null;
  }, [existingCars, form.raqam, car?.id]);
  const duplicateQoldiq = duplicate ? carStats(duplicate).qoldiq : 0;

  const filledLines = lines.filter((l) => l.nom.trim() || l.summa);
  const linesTotal = filledLines.reduce((sum, l) => sum + (Number(l.summa) || 0), 0);

  const setField = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const applySuggestion = (s: CarSuggestion) => {
    setForm((f) => ({
      ...f,
      raqam: s.raqam,
      mashina: s.mashina || f.mashina,
      mijoz: s.mijoz || f.mijoz,
      tel: s.tel || f.tel,
    }));
    setSuggestOpen(false);
  };

  const updateLine = (key: number, patch: Partial<LineDraft>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const addLine = () =>
    setLines((ls) => [
      ...ls,
      { key: Math.max(0, ...ls.map((l) => l.key)) + 1, nom: '', summa: '', sana: ls[ls.length - 1]?.sana || today },
    ]);
  const removeLine = (key: number) =>
    setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : [{ ...ls[0], nom: '', summa: '' }]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const parsedCar = parseCarInput(form);
    if (!parsedCar.ok) {
      setError(parsedCar.error);
      return;
    }
    const items: ItemInput[] = [];
    if (!isEdit) {
      for (const [i, line] of filledLines.entries()) {
        const parsed = parseItemInput({ nom: line.nom, summa: line.summa, sana: line.sana }, today);
        if (!parsed.ok) {
          setError(filledLines.length > 1 ? `${i + 1}-rasxod: ${parsed.error}` : parsed.error);
          return;
        }
        items.push(parsed.value as ItemInput);
      }
    }

    setError(null);
    setSaving(true);
    const ok = await onSubmit(parsedCar.value as CarInput, items);
    if (!ok) setSaving(false); // muvaffaqiyatda modal yopiladi (unmount)
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rasxod-car-modal-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 150, overflowY: 'auto',
        background: 'rgba(2,6,23,0.78)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6vh 16px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: 620, background: '#161b29',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18,
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        }}
      >
        {/* SARLAVHA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.14)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Car size={18} />
            </div>
            <div>
              <div id="rasxod-car-modal-title" style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>
                {isEdit ? 'Mashinani tahrirlash' : "Mashina qo'shish"}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text3)' }}>
                {isEdit ? "Mashina va mijoz ma'lumotlari" : "Mashina ma'lumotlari va qilingan rasxodlar"}
              </div>
            </div>
          </div>
          <button type="button" className="rd-btn" onClick={onClose} disabled={saving} style={iconBtn()} aria-label="Yopish">
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* RAQAM + MASHINA */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <label style={labelStyle} htmlFor="rd-raqam">Davlat raqami</label>
              <input
                id="rd-raqam"
                className="rd-input"
                value={form.raqam}
                placeholder="01A123BC"
                autoComplete="off"
                autoFocus={!isEdit}
                onChange={(e) => { setField('raqam')(e.target.value); setSuggestOpen(true); }}
                onFocus={() => setSuggestOpen(true)}
                onBlur={() => setSuggestOpen(false)}
                onKeyDown={(e) => {
                  // Esc avval taklif ro'yxatini yopadi, oynani emas
                  if (e.key === 'Escape' && suggestOpen && suggestions.length > 0) {
                    e.stopPropagation();
                    setSuggestOpen(false);
                  }
                }}
                style={{ ...inputStyle, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}
              />
              {suggestOpen && suggestions.length > 0 && (
                <div
                  role="listbox"
                  style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 5,
                    background: '#0f1422', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
                    boxShadow: 'var(--shadow-md)', overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '7px 12px', fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase' }}>
                    Buyurtmalardan topildi
                  </div>
                  {suggestions.map((s) => (
                    <button
                      key={s.raqam}
                      type="button"
                      role="option"
                      aria-selected={false}
                      className="rd-btn"
                      // mousedown — input blur bo'lib ro'yxat yopilishidan oldin tanlash uchun
                      onMouseDown={(e) => { e.preventDefault(); applySuggestion(s); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', borderTop: '1px solid var(--border)', cursor: 'pointer', color: 'white' }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                        {s.raqam} <span style={{ fontWeight: 500, color: 'var(--text2)' }}>· {s.mashina || '—'}</span>
                      </div>
                      {(s.mijoz || s.tel) && (
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                          {[s.mijoz, s.tel && formatPhone(s.tel)].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle} htmlFor="rd-mashina">Mashina</label>
              <input
                id="rd-mashina"
                className="rd-input"
                list="rd-mashina-list"
                value={form.mashina}
                placeholder="Masalan: Chevrolet Malibu"
                autoComplete="off"
                onChange={(e) => setField('mashina')(e.target.value)}
                style={inputStyle}
              />
              <datalist id="rd-mashina-list">
                {mashinalar.map((m) => <option key={m} value={m} />)}
              </datalist>
            </div>
          </div>

          {duplicate && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 12, color: '#fbbf24', lineHeight: 1.5 }}>
              <TriangleAlert size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                {`Bu raqamli mashina daftarda bor: ${duplicate.mashina || duplicate.raqam}`}
                {duplicateQoldiq > 0 ? ` (qoldiq ${fmt(duplicateQoldiq)} so'm)` : ''}
                {isEdit ? '.' : ". Yangi kartochka shart emas — o'sha mashinadagi «Rasxod qo'shish» orqali yozsa ham bo'ladi."}
              </span>
            </div>
          )}

          {/* MIJOZ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            <div>
              <label style={labelStyle} htmlFor="rd-mijoz">Mijoz ismi</label>
              <input
                id="rd-mijoz"
                className="rd-input"
                value={form.mijoz}
                placeholder="Masalan: Aziz aka"
                onChange={(e) => setField('mijoz')(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="rd-tel">Telefon</label>
              <PhoneInput id="rd-tel" className="rd-input" value={form.tel} onChange={setField('tel')} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle} htmlFor="rd-izoh">Izoh</label>
            <input
              id="rd-izoh"
              className="rd-input"
              value={form.izoh}
              placeholder="Ixtiyoriy"
              onChange={(e) => setField('izoh')(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* RASXODLAR (faqat yangi mashinada — keyin kartochkada qo'shiladi) */}
          {!isEdit && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Qilingan rasxodlar</span>
                {linesTotal > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                    Jami: <b style={{ color: 'white' }}>{fmt(linesTotal)}</b> {"so'm"}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lines.map((line, i) => (
                  <div key={line.key} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <input
                      className="rd-input"
                      aria-label={`${i + 1}-rasxod: nima uchun`}
                      value={line.nom}
                      placeholder="Nima uchun (masalan: Akkumulyator)"
                      onChange={(e) => updateLine(line.key, { nom: e.target.value })}
                      style={{ ...inputStyle, flex: '2 1 190px', width: 'auto' }}
                    />
                    <input
                      className="rd-input"
                      aria-label={`${i + 1}-rasxod: summa`}
                      inputMode="numeric"
                      value={formatDigits(line.summa)}
                      placeholder="Summa"
                      onChange={(e) => updateLine(line.key, { summa: stripToDigits(e.target.value) })}
                      style={{ ...inputStyle, flex: '1 1 120px', width: 'auto', textAlign: 'right', fontWeight: 700 }}
                    />
                    <input
                      className="rd-input"
                      aria-label={`${i + 1}-rasxod: sana`}
                      type="date"
                      max={today}
                      value={line.sana}
                      onChange={(e) => updateLine(line.key, { sana: e.target.value })}
                      style={{ ...inputStyle, flex: '0 0 148px', width: 148 }}
                    />
                    <button
                      type="button"
                      className="rd-btn"
                      onClick={() => removeLine(line.key)}
                      style={iconBtn('danger')}
                      aria-label={`${i + 1}-rasxodni olib tashlash`}
                      title="Olib tashlash"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="rd-btn" onClick={addLine} style={btn('neutral', 'sm', { marginTop: 10 })}>
                <Plus size={14} /> Yana rasxod
              </button>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, lineHeight: 1.5 }}>
                {"Rasxodni keyinroq ham kartochkaga qo'shish mumkin. Kassaga ta'sir qilmaydi."}
              </p>
            </div>
          )}

          {error && (
            <div role="alert" style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', color: COLOR.red, fontSize: 12.5, fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
          <button type="button" className="rd-btn" onClick={onClose} disabled={saving} style={btn('neutral')}>
            Bekor qilish
          </button>
          <button type="submit" className="rd-btn" disabled={saving} style={btn('primary')}>
            {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
            Saqlash
          </button>
        </div>
      </form>
    </div>
  );
}
