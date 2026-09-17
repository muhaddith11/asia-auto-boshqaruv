'use client';

import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CircleCheck, Clock, FileSpreadsheet, Hourglass, Info, LoaderCircle, NotebookPen, Plus, RotateCcw, Search, Wallet,
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { exportToCSV } from '@/lib/export';
import { formatPhone } from '@/lib/phone';
import {
  carStats, fmtSana, itemHolat, kunFarqi, paidAmount, patchCar, qaytishKuni, removeItem, summarizeDaftar, tashkentDate,
  upsertItems, visibleCars,
  type CarInput, type DaftarTab, type ItemInput, type RasxodCar, type RasxodItem,
} from '@/lib/rasxodDaftar';
import {
  addDaftarItem, addDaftarPartialPayment, createDaftarCar, deleteDaftarCar, deleteDaftarItem, fetchDaftar,
  resetDaftarPartialPayment, setDaftarTulov, updateDaftarCar, updateDaftarItem,
} from '@/lib/rasxodDaftarClient';
import RasxodCarCard from './RasxodCarCard';
import RasxodCarModal from './RasxodCarModal';
import { btn, COLOR, errorText, fmt, inputStyle } from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Rasxod daftari — mashinaga qilingan, lekin KASSADAN AYIRILMAGAN rasxodlar.
// Mashina + rasxodlar yoziladi; mijoz pulni qaytarganda "To'landi" qilinadi.
// Kassaga hech qachon tegmaydi. Mantiq: @/lib/rasxodDaftar.
// ─────────────────────────────────────────────────────────────────────────────

type ModalState = { mode: 'create' } | { mode: 'edit'; car: RasxodCar } | null;
type ConfirmState = { kind: 'car'; car: RasxodCar } | { kind: 'item'; car: RasxodCar; item: RasxodItem } | null;

const TABS: { key: DaftarTab; label: string }[] = [
  { key: 'kutilmoqda', label: 'Kutilmoqda' },
  { key: 'tulandi', label: "To'langan" },
  { key: 'all', label: 'Barchasi' },
];

const carName = (car: RasxodCar) => car.mashina || car.raqam || 'Mashina';

export default function RasxodDaftar({ header }: { header: React.ReactNode }) {
  const [cars, setCars] = useState<RasxodCar[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [tab, setTab] = useState<DaftarTab>('kutilmoqda');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDaftar().then(
      (list) => {
        if (cancelled) return;
        setCars(list);
        setNow(new Date());
      },
      (err) => {
        if (!cancelled) setLoadError(errorText(err, "Rasxod daftarini yuklab bo'lmadi"));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Yangi qo'shilgan / tanlangan mashinani ko'rsatib, bir oz yoritib turamiz.
  useEffect(() => {
    if (highlightId === null) return;
    document.getElementById(`rasxod-car-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const summary = useMemo(() => summarizeDaftar(cars ?? [], now), [cars, now]);
  const counts = useMemo(() => {
    const c: Record<DaftarTab, number> = { kutilmoqda: 0, tulandi: 0, all: 0 };
    for (const car of cars ?? []) {
      c.all++;
      if (carStats(car, now).holat === 'tulandi') c.tulandi++;
      else c.kutilmoqda++;
    }
    return c;
  }, [cars, now]);
  const shown = useMemo(() => visibleCars(cars ?? [], tab, search, now), [cars, tab, search, now]);

  // ── Amallar (server javobi kelgach holat yangilanadi) ──

  const handleCreate = async (car: CarInput, items: ItemInput[]) => {
    try {
      const created = await createDaftarCar(car, items);
      setCars((prev) => [created, ...(prev ?? [])]);
      setModal(null);
      setTab((t) => (t === 'tulandi' ? 'kutilmoqda' : t));
      setSearch('');
      setHighlightId(created.id);
      toast.success(`${carName(created)} daftarga qo'shildi`);
      return true;
    } catch (err) {
      toast.error(errorText(err, 'Mashina saqlanmadi'));
      return false;
    }
  };

  const handleEdit = (target: RasxodCar) => async (car: CarInput) => {
    try {
      const row = await updateDaftarCar(target.id, car);
      setCars((prev) => patchCar(prev ?? [], row));
      setModal(null);
      toast.success("Mashina ma'lumotlari saqlandi");
      return true;
    } catch (err) {
      toast.error(errorText(err, 'Mashina saqlanmadi'));
      return false;
    }
  };

  const handleAddItem = async (car: RasxodCar, item: ItemInput) => {
    try {
      const added = await addDaftarItem(car.id, item);
      setCars((prev) => upsertItems(prev ?? [], added));
      toast.success(`Rasxod yozildi: ${item.nom} — ${fmt(item.summa)} so'm`);
      return true;
    } catch (err) {
      toast.error(errorText(err, 'Rasxod saqlanmadi'));
      return false;
    }
  };

  const handleUpdateItem = async (car: RasxodCar, item: RasxodItem, patch: ItemInput) => {
    try {
      const updated = await updateDaftarItem(car.id, item.id, patch);
      setCars((prev) => upsertItems(prev ?? [], [updated]));
      toast.success('Rasxod saqlandi');
      return true;
    } catch (err) {
      toast.error(errorText(err, 'Rasxod saqlanmadi'));
      return false;
    }
  };

  const handleAddPartial = async (car: RasxodCar, item: RasxodItem, summa: number): Promise<boolean> => {
    try {
      const updated = await addDaftarPartialPayment(car.id, item.id, summa);
      setCars((prev) => upsertItems(prev ?? [], [updated]));
      toast.success(
        updated.tulandi
          ? `${item.nom}: qolgan ${fmt(summa)} so'm ham to'landi`
          : `${item.nom}: ${fmt(summa)} so'm qisman to'landi (qoldi ${fmt(updated.summa - updated.tulangan_summa)})`,
      );
      return true;
    } catch (err) {
      toast.error(errorText(err, "To'lov saqlanmadi"));
      return false;
    }
  };

  const handleResetPartial = async (car: RasxodCar, item: RasxodItem): Promise<boolean> => {
    try {
      const updated = await resetDaftarPartialPayment(car.id, item.id);
      setCars((prev) => upsertItems(prev ?? [], [updated]));
      toast.success(`${item.nom}: qisman to'lov bekor qilindi`);
      return true;
    } catch (err) {
      toast.error(errorText(err, "Bekor qilinmadi"));
      return false;
    }
  };

  const handleSetTulov = async (car: RasxodCar, tulandi: boolean, items?: RasxodItem[]): Promise<boolean> => {
    try {
      const changed = await setDaftarTulov(car.id, tulandi, items?.map((i) => i.id));
      setCars((prev) => upsertItems(prev ?? [], changed));
      if (changed.length === 0) {
        toast("Holat allaqachon yangilangan edi");
        return true;
      }
      const summa = fmt(changed.reduce((sum, i) => sum + i.summa, 0));
      if (tulandi) {
        // Xato bosilgan bo'lsa — shu yerning o'zidan qaytarish mumkin.
        toast.success(
          (t) => (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span>{`${carName(car)}: ${summa} so'm to'landi`}</span>
              <button
                type="button"
                className="rd-btn"
                onClick={() => {
                  toast.dismiss(t.id);
                  void handleSetTulov(car, false, changed);
                }}
                style={btn('neutral', 'sm')}
              >
                <RotateCcw size={13} /> Qaytarish
              </button>
            </span>
          ),
          { duration: 7000 },
        );
      } else {
        toast.success(`${carName(car)}: ${summa} so'm yana "Kutilmoqda"ga qaytarildi`);
      }
      return true;
    } catch (err) {
      toast.error(errorText(err, "To'lov holati saqlanmadi"));
      return false;
    }
  };

  const handleConfirmDelete = async (target: NonNullable<ConfirmState>) => {
    try {
      if (target.kind === 'car') {
        await deleteDaftarCar(target.car.id);
        setCars((prev) => (prev ?? []).filter((c) => c.id !== target.car.id));
        toast.success(`${carName(target.car)} daftardan o'chirildi`);
      } else {
        await deleteDaftarItem(target.car.id, target.item.id);
        setCars((prev) => removeItem(prev ?? [], target.car.id, target.item.id));
        toast.success(`Rasxod o'chirildi: ${target.item.nom}`);
      }
    } catch (err) {
      toast.error(errorText(err, "O'chirilmadi"));
    }
  };

  const handleExport = () => {
    const rows = shown.flatMap((car) => car.items.map((item) => ({ car, item })));
    if (rows.length === 0) {
      toast.error("Eksport uchun rasxod yo'q");
      return;
    }
    exportToCSV('rasxod_daftari', rows, [
      { key: 'mashina', label: 'Mashina', format: (r) => r.car.mashina },
      { key: 'raqam', label: 'Raqam', format: (r) => r.car.raqam ?? '' },
      { key: 'mijoz', label: 'Mijoz', format: (r) => r.car.mijoz ?? '' },
      { key: 'tel', label: 'Telefon', format: (r) => (r.car.tel ? formatPhone(r.car.tel) : '') },
      { key: 'sana', label: 'Rasxod sanasi', format: (r) => fmtSana(r.item.sana) },
      { key: 'nom', label: 'Nima uchun', format: (r) => r.item.nom },
      { key: 'summa', label: 'Summa', format: (r) => r.item.summa },
      {
        key: 'holat', label: 'Holat',
        format: (r) => ({ tulandi: "To'langan", qisman: "Qisman to'landi", kutilmoqda: 'Kutilmoqda' })[itemHolat(r.item)],
      },
      { key: 'tulangan_summa', label: "To'langan summa", format: (r) => paidAmount(r.item) },
      {
        key: 'tulangan', label: "Oxirgi to'lov sana",
        format: (r) => (r.item.tulangan_vaqt ? fmtSana(tashkentDate(new Date(r.item.tulangan_vaqt))) : ''),
      },
      { key: 'qaytish', label: 'Necha kunda qaytdi', format: (r) => qaytishKuni(r.item) ?? '' },
      { key: 'kutish', label: 'Necha kun kutmoqda', format: (r) => (r.item.tulandi ? '' : kunFarqi(r.item.sana, now)) },
    ]);
  };

  const engUzoq = summary.engUzoq;
  const engUzoqColor = !engUzoq ? COLOR.slate : engUzoq.kun >= 7 ? COLOR.red : COLOR.amber;

  const confirmTitle = confirm?.kind === 'car' ? "Mashinani o'chirish" : "Rasxodni o'chirish";
  const confirmMessage = !confirm
    ? ''
    : confirm.kind === 'car'
      ? `${carName(confirm.car)}${confirm.car.raqam && confirm.car.mashina ? ` (${confirm.car.raqam})` : ''} va uning ${confirm.car.items.length} ta rasxodi (jami ${fmt(carStats(confirm.car, now).jami)} so'm) daftardan butunlay o'chiriladi.`
      : `"${confirm.item.nom}" — ${fmt(confirm.item.summa)} so'm (${fmtSana(confirm.item.sana)}) daftardan o'chiriladi.`;

  return (
    <>
      {/* SARLAVHA */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
        {header}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="rd-btn" onClick={handleExport} disabled={!cars} style={btn('success')}>
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button type="button" className="rd-btn" onClick={() => setModal({ mode: 'create' })} style={btn('primary')}>
            <Plus size={16} /> {"Mashina qo'shish"}
          </button>
        </div>
      </div>

      {/* STATISTIKA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard
          icon={<Hourglass size={20} />}
          color={COLOR.amber}
          label="Qaytishi kutilmoqda"
          value={fmt(summary.qoldiq)}
          unit="UZS"
          hint={`${summary.kutayotganMashina} ta mashina · ${summary.unpaidCount} ta rasxod`}
        />
        <StatCard
          icon={<CircleCheck size={20} />}
          color={COLOR.green}
          label="Qaytgan"
          value={fmt(summary.tulangan)}
          unit="UZS"
          hint={`${summary.paidCount} ta rasxod${summary.ortachaQaytish !== null ? ` · o'rtacha ${summary.ortachaQaytish} kunda` : ''}`}
        />
        <StatCard
          icon={<Wallet size={20} />}
          color={COLOR.indigo}
          label="Jami yozilgan"
          value={fmt(summary.jami)}
          unit="UZS"
          hint={`${summary.carCount} ta mashina · ${summary.itemCount} ta rasxod`}
        />
        <StatCard
          icon={<Clock size={20} />}
          color={engUzoqColor}
          label="Eng uzoq kutayotgan"
          value={engUzoq ? `${engUzoq.kun} kun` : '—'}
          hint={engUzoq ? [engUzoq.mashina, engUzoq.raqam].filter(Boolean).join(' · ') : "Kutayotgan rasxod yo'q"}
          onClick={engUzoq ? () => { setTab('kutilmoqda'); setSearch(''); setHighlightId(engUzoq.carId); } : undefined}
        />
      </div>

      {/* IZOH */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 20, fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>
        <Info size={15} color="#818cf8" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          {'Bu daftar '}
          <b style={{ color: 'white' }}>kassaga tegmaydi</b>
          {": rasxod yozilganda kassadan ayirilmaydi, «To'landi» bosilganda kassaga qo'shilmaydi. Mashinani va qilgan rasxodlaringizni yozib boring — mijoz pulni qaytarganda «To'landi» deb belgilang."}
        </div>
      </div>

      {/* FILTR + QIDIRUV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div role="tablist" aria-label="Holat bo'yicha" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                className="rd-btn"
                onClick={() => setTab(t.key)}
                style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: active ? 'var(--accent)' : 'var(--surface2)', color: active ? '#fff' : 'var(--text2)' }}
              >
                {t.label}
                <span style={{ marginLeft: 6, opacity: 0.7 }}>{counts[t.key]}</span>
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', flex: '0 1 320px', minWidth: 220 }}>
          <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            className="rd-input"
            type="search"
            aria-label="Qidirish"
            placeholder="Mashina, raqam, mijoz, telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 34 }}
          />
        </div>
      </div>

      {/* RO'YXAT */}
      {loadError ? (
        <div style={{ padding: 24, borderRadius: 14, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', color: COLOR.red, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span>{loadError}</span>
          <button
            type="button"
            className="rd-btn"
            onClick={() => { setLoadError(null); setCars(null); setReloadKey((k) => k + 1); }}
            style={btn('danger', 'sm')}
          >
            <RotateCcw size={13} /> Qayta urinish
          </button>
        </div>
      ) : cars === null ? (
        <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text3)', fontSize: 13 }}>
          <LoaderCircle size={18} className="animate-spin" /> Yuklanmoqda...
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          title={
            cars.length === 0 ? "Daftar hozircha bo'sh"
              : search.trim() ? `"${search.trim()}" bo'yicha hech narsa topilmadi`
                : tab === 'kutilmoqda' ? 'Qaytishi kutilayotgan rasxod yo\'q'
                  : tab === 'tulandi' ? "Hali to'liq qaytgan mashina yo'q"
                    : "Daftar hozircha bo'sh"
          }
          text={cars.length === 0 ? "Kassadan ayirmasdan rasxod qilgan bo'lsangiz — mashinani qo'shing va rasxodlarni yozib boring." : undefined}
          onAdd={cars.length === 0 ? () => setModal({ mode: 'create' }) : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shown.map((car) => (
            <RasxodCarCard
              key={car.id}
              car={car}
              now={now}
              highlighted={highlightId === car.id}
              onEdit={(c) => setModal({ mode: 'edit', car: c })}
              onDelete={(c) => setConfirm({ kind: 'car', car: c })}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={(c, item) => setConfirm({ kind: 'item', car: c, item })}
              onSetTulov={handleSetTulov}
              onAddPartial={handleAddPartial}
              onResetPartial={handleResetPartial}
            />
          ))}
        </div>
      )}

      {modal && (
        <RasxodCarModal
          key={modal.mode === 'edit' ? modal.car.id : 'new'}
          car={modal.mode === 'edit' ? modal.car : undefined}
          existingCars={cars ?? []}
          onClose={() => setModal(null)}
          onSubmit={modal.mode === 'edit' ? handleEdit(modal.car) : handleCreate}
        />
      )}

      <ConfirmModal
        isOpen={confirm !== null}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="O'chirish"
        onConfirm={() => {
          if (confirm) void handleConfirmDelete(confirm);
        }}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}

function StatCard({
  icon, color, label, value, unit, hint, onClick,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  unit?: string;
  hint: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ padding: 8, borderRadius: 8, background: `${color}15`, color, display: 'flex' }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
        {unit && <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}> {unit}</span>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{hint}</div>
    </>
  );
  const style: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22,
    textAlign: 'left', color: 'inherit', font: 'inherit', width: '100%',
  };
  return onClick ? (
    <button type="button" className="rd-btn" onClick={onClick} title="Shu mashinani ko'rsatish" style={{ ...style, cursor: 'pointer' }}>
      {body}
    </button>
  ) : (
    <div style={style}>{body}</div>
  );
}

function EmptyState({ title, text, onAdd }: { title: string; text?: string; onAdd?: () => void }) {
  return (
    <div style={{ padding: '48px 24px', borderRadius: 16, background: 'var(--surface)', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
      <NotebookPen size={34} color="var(--text4)" style={{ margin: '0 auto 12px' }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)' }}>{title}</div>
      {text && <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 6 }}>{text}</div>}
      {onAdd && (
        <button type="button" className="rd-btn" onClick={onAdd} style={btn('primary', 'md', { marginTop: 16 })}>
          <Plus size={16} /> {"Mashina qo'shish"}
        </button>
      )}
    </div>
  );
}
