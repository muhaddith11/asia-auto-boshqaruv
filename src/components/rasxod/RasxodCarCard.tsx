'use client';

import React, { useState } from 'react';
import {
  Car, Check, CheckCheck, CircleCheck, LoaderCircle, Pencil, Phone, Plus, StickyNote, Trash2, Undo2, User,
} from 'lucide-react';
import { formatDigits, stripToDigits } from '@/lib/numberInput';
import { formatPhone } from '@/lib/phone';
import {
  carStats, fmtSana, itemHolat, kunFarqi, paidAmount, parseItemInput, qaytishKuni, tashkentDate,
  type CarHolat, type ItemInput, type RasxodCar, type RasxodItem,
} from '@/lib/rasxodDaftar';
import { btn, COLOR, fmt, iconBtn, inputStyle } from './styles';

// Daftardagi bitta mashina: ma'lumoti, jami/to'langan/qoldiq va rasxod qatorlari.
// Amallar ota komponentda (API + holat); true — muvaffaqiyatli.

export interface CarCardActions {
  onEdit: (car: RasxodCar) => void;
  onDelete: (car: RasxodCar) => void;
  onAddItem: (car: RasxodCar, item: ItemInput) => Promise<boolean>;
  onUpdateItem: (car: RasxodCar, item: RasxodItem, patch: ItemInput) => Promise<boolean>;
  onDeleteItem: (car: RasxodCar, item: RasxodItem) => void;
  // items berilmasa — mashinaning barcha qatorlari
  onSetTulov: (car: RasxodCar, tulandi: boolean, items?: RasxodItem[]) => Promise<boolean>;
  // Qisman to'lov: summa qatorning qoldig'iga qo'shiladi (to'liq to'lansa avtomatik "tulandi").
  onAddPartial: (car: RasxodCar, item: RasxodItem, summa: number) => Promise<boolean>;
  onResetPartial: (car: RasxodCar, item: RasxodItem) => Promise<boolean>;
}

interface Props extends CarCardActions {
  car: RasxodCar;
  now: Date;
  highlighted: boolean;
}

const HOLAT: Record<CarHolat, { label: string; color: string }> = {
  bosh: { label: 'Rasxod yozilmagan', color: COLOR.slate },
  kutilmoqda: { label: 'Kutilmoqda', color: COLOR.amber },
  qisman: { label: "Qisman to'landi", color: COLOR.amber },
  tulandi: { label: "To'landi", color: COLOR.green },
};

const spinner = <LoaderCircle size={14} className="animate-spin" />;

export default function RasxodCarCard({
  car, now, highlighted, onEdit, onDelete, onAddItem, onUpdateItem, onDeleteItem, onSetTulov, onAddPartial, onResetPartial,
}: Props) {
  const st = carStats(car, now);
  const today = tashkentDate(now);
  const meta = HOLAT[st.holat];
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, action: () => Promise<boolean>) => {
    setBusy(key);
    try {
      return await action();
    } finally {
      setBusy(null);
    }
  };

  const waitLabel = st.kutishKuni === null ? '' : ` · ${st.kutishKuni === 0 ? 'bugun' : `${st.kutishKuni} kun`}`;
  const showAddForm = adding || car.items.length === 0;

  return (
    <div
      id={`rasxod-car-${car.id}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: highlighted ? '0 0 0 2px rgba(99,102,241,0.6), 0 8px 30px rgba(99,102,241,0.18)' : 'none',
        transition: 'box-shadow 0.4s',
      }}
    >
      {/* MASHINA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 24px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 280px', minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${meta.color}1f`, color: meta.color }}>
            <Car size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{car.mashina || 'Mashina'}</span>
              {car.raqam && (
                <span style={{ padding: '1px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)', fontSize: 11.5, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.05em' }}>
                  {car.raqam}
                </span>
              )}
              <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 800, background: `${meta.color}1f`, color: meta.color, whiteSpace: 'nowrap' }}>
                {meta.label}{waitLabel}
              </span>
            </div>
            {(car.mijoz || car.tel || car.izoh) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 5, fontSize: 12, color: 'var(--text3)' }}>
                {car.mijoz && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><User size={12} /> {car.mijoz}</span>}
                {car.tel && (
                  <a href={`tel:${car.tel}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text2)', textDecoration: 'none' }}>
                    <Phone size={12} /> {formatPhone(car.tel)}
                  </a>
                )}
                {car.izoh && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><StickyNote size={12} /> {car.izoh}</span>}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          <Total label="Jami" value={st.jami} color="var(--text)" />
          <Total label="To'langan" value={st.tulangan} color={st.tulangan > 0 ? COLOR.green : 'var(--text3)'} />
          <Total label="Qoldiq" value={st.qoldiq} color={st.qoldiq > 0 ? COLOR.amber : 'var(--text3)'} />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          {st.unpaidCount > 0 && (
            <button
              type="button"
              className="rd-btn"
              disabled={busy !== null}
              onClick={() => run('pay-all', () => onSetTulov(car, true))}
              title="Mijoz shu mashina bo'yicha barcha rasxodni qaytardi"
              style={btn('success', 'sm', { padding: '7px 12px' })}
            >
              {busy === 'pay-all' ? spinner : <CheckCheck size={14} />} {"Hammasi to'landi"}
            </button>
          )}
          <button type="button" className="rd-btn" onClick={() => onEdit(car)} style={iconBtn()} title="Mashinani tahrirlash" aria-label="Mashinani tahrirlash">
            <Pencil size={14} />
          </button>
          <button type="button" className="rd-btn" onClick={() => onDelete(car)} style={iconBtn('danger')} title="Mashinani o'chirish" aria-label="Mashinani o'chirish">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* RASXODLAR */}
      <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.14)' }}>
        {car.items.map((item) => {
          if (editingId === item.id) {
            return (
              <ItemEditor
                key={item.id}
                initial={item}
                today={today}
                busy={busy === `edit-${item.id}`}
                submitLabel="Saqlash"
                autoFocus
                onCancel={() => setEditingId(null)}
                onSubmit={async (patch) => {
                  if (await run(`edit-${item.id}`, () => onUpdateItem(car, item, patch))) setEditingId(null);
                }}
              />
            );
          }
          const ih = itemHolat(item);
          const paid = paidAmount(item);
          const qoldiq = item.summa - paid;
          const payBusy = busy === `pay-${item.id}`;
          const partialBusy = busy === `partial-${item.id}`;
          const resetBusy = busy === `reset-${item.id}`;
          const days = ih === 'tulandi' ? qaytishKuni(item) : kunFarqi(item.sana, now);
          return (
            // Ikki guruh: [sana · nom · summa] va [holat · tugmalar] — tor ekranda ikkinchisi butunlay pastga tushadi.
            <div key={item.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ flex: '0 0 78px', fontSize: 12, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>{fmtSana(item.sana)}</span>
                <span style={{ flex: '1 1 auto', minWidth: 0, fontSize: 13, fontWeight: 600, color: ih === 'tulandi' ? 'var(--text2)' : 'white', overflowWrap: 'anywhere' }}>
                  {item.nom}
                </span>
                <span style={{ flex: '0 0 auto', textAlign: 'right', fontSize: 13.5, fontWeight: 800, color: ih === 'tulandi' ? 'var(--text3)' : 'white', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {fmt(item.summa)}
                </span>
              </div>
              {payingId === item.id ? (
                <PartialAmountForm
                  max={qoldiq}
                  busy={partialBusy}
                  onCancel={() => setPayingId(null)}
                  onSubmit={async (summa) => {
                    if (await run(`partial-${item.id}`, () => onAddPartial(car, item, summa))) setPayingId(null);
                  }}
                />
              ) : (
                <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                  {ih === 'tulandi' ? (
                    <>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: COLOR.green, whiteSpace: 'nowrap' }}>
                        <CircleCheck size={14} />
                        {"To'landi"}
                        {item.tulangan_vaqt ? ` · ${fmtSana(tashkentDate(new Date(item.tulangan_vaqt)))}` : ''}
                      </span>
                      {days !== null && (
                        <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                          {days === 0 ? 'shu kuni qaytdi' : `${days} kunda qaytdi`}
                        </span>
                      )}
                      <button
                        type="button"
                        className="rd-btn"
                        disabled={busy !== null}
                        onClick={() => run(`pay-${item.id}`, () => onSetTulov(car, false, [item]))}
                        style={iconBtn()}
                        title="Xato belgilangan — to'lanmagan deb qaytarish"
                        aria-label="To'lanmagan deb qaytarish"
                      >
                        {payBusy ? spinner : <Undo2 size={14} />}
                      </button>
                    </>
                  ) : (
                    <>
                      {ih === 'qisman' ? (
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: COLOR.amber, whiteSpace: 'nowrap' }}>
                          {"Qisman to'landi: "}{fmt(paid)} / {fmt(item.summa)} <span style={{ opacity: 0.75 }}>· qoldi {fmt(qoldiq)}</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: COLOR.amber, whiteSpace: 'nowrap' }}>
                          {days === 0 ? 'Bugun yozildi' : `${days} kun kutmoqda`}
                        </span>
                      )}
                      <button
                        type="button"
                        className="rd-btn"
                        disabled={busy !== null}
                        onClick={() => run(`pay-${item.id}`, () => onSetTulov(car, true, [item]))}
                        style={btn('success', 'sm')}
                        title="Mijoz shu rasxodning qolgan pulini ham qaytardi"
                      >
                        {payBusy ? spinner : <Check size={14} />} {ih === 'qisman' ? "Qolganini to'landi" : "To'landi"}
                      </button>
                      <button
                        type="button"
                        className="rd-btn"
                        disabled={busy !== null}
                        onClick={() => { setEditingId(null); setPayingId(item.id); }}
                        style={btn('neutral', 'sm')}
                        title="Mijoz shu rasxodning bir qismini qaytardi"
                      >
                        <Plus size={13} /> {"Qisman to'lov"}
                      </button>
                      {ih === 'qisman' && (
                        <button
                          type="button"
                          className="rd-btn"
                          disabled={busy !== null}
                          onClick={() => run(`reset-${item.id}`, () => onResetPartial(car, item))}
                          style={iconBtn()}
                          title="Qisman to'lovni bekor qilish"
                          aria-label="Qisman to'lovni bekor qilish"
                        >
                          {resetBusy ? spinner : <Undo2 size={14} />}
                        </button>
                      )}
                    </>
                  )}
                  <span style={{ display: 'inline-flex', gap: 6, marginLeft: 4 }}>
                    <button
                      type="button"
                      className="rd-btn"
                      onClick={() => { setAdding(false); setPayingId(null); setEditingId(item.id); }}
                      style={iconBtn()}
                      title="Tahrirlash"
                      aria-label="Rasxodni tahrirlash"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      className="rd-btn"
                      onClick={() => onDeleteItem(car, item)}
                      style={iconBtn('danger')}
                      title="O'chirish"
                      aria-label="Rasxodni o'chirish"
                    >
                      <Trash2 size={13} />
                    </button>
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {showAddForm ? (
          <ItemEditor
            today={today}
            busy={busy === 'add'}
            submitLabel="Qo'shish"
            autoFocus={adding}
            onCancel={car.items.length > 0 ? () => setAdding(false) : undefined}
            onSubmit={async (item) => {
              if (await run('add', () => onAddItem(car, item))) setAdding(false);
            }}
          />
        ) : (
          <button
            type="button"
            className="rd-btn"
            onClick={() => { setEditingId(null); setAdding(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '10px 20px', background: 'transparent', border: 'none', color: '#818cf8', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={14} /> {"Rasxod qo'shish"}
          </button>
        )}
      </div>
    </div>
  );
}

function Total({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{fmt(value)}</div>
    </div>
  );
}

// Rasxod qo'shish / tahrirlash qatori. Enter — saqlash, Esc — bekor.
function ItemEditor({
  initial, today, busy, submitLabel, autoFocus, onSubmit, onCancel,
}: {
  initial?: RasxodItem;
  today: string;
  busy: boolean;
  submitLabel: string;
  autoFocus?: boolean;
  onSubmit: (item: ItemInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [nom, setNom] = useState(initial?.nom ?? '');
  const [summa, setSumma] = useState(initial ? String(initial.summa) : '');
  const [sana, setSana] = useState(initial?.sana ?? today);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    const parsed = parseItemInput({ nom, summa, sana }, today);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    await onSubmit(parsed.value as ItemInput);
  };

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); void submit(); }
        if (e.key === 'Escape' && onCancel) { e.preventDefault(); onCancel(); }
      }}
      style={{ padding: '10px 20px', background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <input
          className="rd-input"
          type="date"
          aria-label="Sana"
          max={today}
          value={sana}
          onChange={(e) => setSana(e.target.value)}
          style={{ ...inputStyle, flex: '0 0 148px', width: 148 }}
        />
        <input
          className="rd-input"
          aria-label="Nima uchun"
          placeholder="Nima uchun (masalan: Akkumulyator)"
          autoFocus={autoFocus}
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          style={{ ...inputStyle, flex: '2 1 200px', width: 'auto' }}
        />
        <input
          className="rd-input"
          aria-label="Summa"
          inputMode="numeric"
          placeholder="Summa"
          value={formatDigits(summa)}
          onChange={(e) => setSumma(stripToDigits(e.target.value))}
          style={{ ...inputStyle, flex: '1 1 120px', width: 'auto', textAlign: 'right', fontWeight: 700 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="rd-btn" disabled={busy} onClick={() => void submit()} style={btn('primary', 'sm', { padding: '8px 14px' })}>
            {busy ? spinner : <Check size={14} />} {submitLabel}
          </button>
          {onCancel && (
            <button type="button" className="rd-btn" disabled={busy} onClick={onCancel} style={btn('neutral', 'sm', { padding: '8px 12px' })}>
              Bekor
            </button>
          )}
        </div>
      </div>
      {error && <div role="alert" style={{ marginTop: 6, fontSize: 11.5, fontWeight: 600, color: COLOR.red }}>{error}</div>}
    </div>
  );
}

// Qisman to'lov summasini kiritish — qatorning qoldig'idan oshib ketmasligi shu yerda ham tekshiriladi
// (server qat'iy tekshiradi). Enter — yuborish, Esc — bekor.
function PartialAmountForm({
  max, busy, onSubmit, onCancel,
}: {
  max: number;
  busy: boolean;
  onSubmit: (summa: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    const n = Number(value);
    if (!value || !Number.isFinite(n) || n <= 0) {
      setError("To'lov summasini to'g'ri kiriting");
      return;
    }
    if (Math.round(n) > max) {
      setError(`Qoldiqdan (${fmt(max)}) ko'p bo'lishi mumkin emas`);
      return;
    }
    setError(null);
    await onSubmit(Math.round(n));
  };

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); void submit(); }
        if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
      }}
      style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Qoldiq: {fmt(max)}</span>
        <input
          className="rd-input"
          aria-label="Qisman to'lov summasi"
          inputMode="numeric"
          placeholder="Necha so'm to'ladi"
          autoFocus
          value={formatDigits(value)}
          onChange={(e) => setValue(stripToDigits(e.target.value))}
          style={{ ...inputStyle, flex: '0 0 150px', width: 150, textAlign: 'right', fontWeight: 700 }}
        />
        <button type="button" className="rd-btn" disabled={busy} onClick={() => void submit()} style={btn('success', 'sm')}>
          {busy ? spinner : <Check size={14} />} {"To'lov qildim"}
        </button>
        <button type="button" className="rd-btn" disabled={busy} onClick={onCancel} style={btn('neutral', 'sm')}>
          Bekor
        </button>
      </div>
      {error && <div role="alert" style={{ fontSize: 11, fontWeight: 600, color: COLOR.red }}>{error}</div>}
    </div>
  );
}
