'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import {
  Search, Eye, Trash2, ClipboardList, Plus,
  Filter, RotateCcw, MoreVertical, Clock, Printer, Send,
  Edit3, History, CreditCard
} from 'lucide-react';
import InvoiceModal from '@/components/InvoiceModal';
import PaymentModal from '@/components/PaymentModal';
import SMSModal from '@/components/SMSModal';
import HistoryModal from '@/components/HistoryModal';
import ConfirmModal from '@/components/ConfirmModal';
import { Buyurtma } from '@/types';
import { sendSMS, getStatusMessage } from '@/services/smsService';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  yaratildi:              { label: 'Yaratildi',             bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
  tamirlanmoqda:          { label: 'Tamirlanmoqda',         bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
  'ehtiyot qism kutilyapti': { label: 'Ehtiyot qism kutilyapti', bg: 'rgba(6,182,212,0.15)',   color: '#22d3ee' },
  tulanmagan:             { label: "To'lanmagan",           bg: 'rgba(249,115,22,0.15)',  color: '#f97316' },
  tulangan:               { label: "To'langan",             bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
  'bekor qilingan':       { label: 'Bekor qilingan',        bg: 'rgba(244,63,94,0.15)',   color: '#fb7185' },
};

const ALL_STATUSES = ['', ...Object.keys(STATUS_CONFIG)];

const S = {
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 12,
    color: 'var(--text)',
    outline: 'none',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text3)',
    marginBottom: 5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
};

export default function OrdersPage() {
  const router = useRouter();
  const { buyurtmalar, deleteBuyurtma } = useStore();
  const [mounted, setMounted] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Buyurtma | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Buyurtma | null>(null);
  const [smsOrder, setSmsOrder] = useState<Buyurtma | null>(null);
  const [historyOrder, setHistoryOrder] = useState<Buyurtma | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [isSendingSms, setIsSendingSms] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });

  // Filter state
  const [f, setF] = useState({
    tel: '', ism: '', mashina: '', raqam: '', vin: '', status: '',
  });
  const [applied, setApplied] = useState({ tel: '', ism: '', mashina: '', raqam: '', vin: '', status: '' });

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const filtered = [...buyurtmalar]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .filter(b => {
    if (applied.tel && (!b.tel || !b.tel.includes(applied.tel))) return false;
    if (applied.ism    && !b.ism.toLowerCase().includes(applied.ism.toLowerCase())) return false;
    if (applied.mashina && !b.mashina.toLowerCase().includes(applied.mashina.toLowerCase())) return false;
    if (applied.raqam  && !b.raqam.toLowerCase().includes(applied.raqam.toLowerCase())) return false;
    if (applied.vin    && !b.vin?.toLowerCase().includes(applied.vin.toLowerCase()))  return false;
    if (applied.status && b.holat !== applied.status)                         return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const applyFilters = () => {
    setApplied({ ...f });
    setCurrentPage(1);
  };
  const resetFilters = () => {
    const empty = { tel: '', ism: '', mashina: '', raqam: '', vin: '', status: '' };
    setF(empty);
    setApplied(empty);
    setCurrentPage(1);
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const dateStr = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      return (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
          <span style={{ fontWeight: 600, fontSize: 12 }}>{dateStr}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeStr}</span>
        </div>
      );
    } catch { return iso; }
  };

  const handleSendSMS = async (b: Buyurtma) => {
    if (!b.tel) return alert('Telefon raqami kiritilmagan!');
    setIsSendingSms(b.id.toString());
    try {
      const msg = getStatusMessage(b.holat, b.id.toString(), b.mashina);
      await sendSMS(b.tel, msg);
      alert('SMS muvaffaqiyatli yuborildi!');
    } catch (err) {
      alert('SMS yuborishda xatolik yuz berdi!');
    } finally {
      setIsSendingSms(null);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{
        padding: '20px 28px 0',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.03em' }}>
            Buyurtmalar
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text3)', margin: '4px 0 0', fontWeight: 500 }}>
            Barcha buyurtmalarni boshqarish — {buyurtmalar.length} ta jami
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Status quick filter */}
          <select
            value={applied.status}
            onChange={e => setApplied({ ...applied, status: e.target.value })}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 600,
              color: 'var(--text)', outline: 'none', cursor: 'pointer', minWidth: 140,
            }}
          >
            <option value="">Barcha statuslar</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <Link href="/orders/new" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'var(--accent)', color: 'white',
            borderRadius: 9, padding: '8px 18px', fontSize: 12, fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          }}>
            <Plus size={14} /> Yangi buyurtma
          </Link>
        </div>
      </div>

      {/* ── FILTERS PANEL ── */}
      <div style={{
        margin: '16px 28px 0',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <Search size={14} color="var(--accent)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Buyurtmalarni qidirish
          </span>
        </div>

        {/* Row 1: 4 fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={S.label}>Telefon raqami</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }}>📞</span>
              <input style={{ ...S.input, paddingLeft: 28 }} type="text" placeholder="Telefon raqamini kiriting"
                value={f.tel} onChange={e => setF({ ...f, tel: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          </div>
          <div>
            <label style={S.label}>Mijoz ismi</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }}>👤</span>
              <input style={{ ...S.input, paddingLeft: 28 }} type="text" placeholder="Ism yoki familiyani kiriting"
                value={f.ism} onChange={e => setF({ ...f, ism: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          </div>
          <div>
            <label style={S.label}>Mashina markasi</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }}>🚗</span>
              <input style={{ ...S.input, paddingLeft: 28 }} type="text" placeholder="Mashina markasini kiriting"
                value={f.mashina} onChange={e => setF({ ...f, mashina: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          </div>
          <div>
            <label style={S.label}>Mashina raqami</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }}>🔢</span>
              <input style={{ ...S.input, paddingLeft: 28 }} type="text" placeholder="Davlat raqamini kiriting"
                value={f.raqam} onChange={e => setF({ ...f, raqam: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          </div>
        </div>

        {/* Row 2: VIN + Status + Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={S.label}>VIN kod</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', fontSize: 11 }}>VIN</span>
              <input style={{ ...S.input, paddingLeft: 34, fontFamily: 'monospace' }} type="text" placeholder="VIN kodni kiriting"
                value={f.vin} onChange={e => setF({ ...f, vin: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
          </div>
          <div>
            <label style={S.label}>Buyurtma statusii</label>
            <select
              style={{ ...S.input, cursor: 'pointer' }}
              value={f.status}
              onChange={e => setF({ ...f, status: e.target.value })}
            >
              <option value="">Barcha statuslar</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div />
          <button
            onClick={applyFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--accent)', color: 'white', border: 'none',
              borderRadius: 8, padding: '9px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}
          >
            <Filter size={13} /> Filtr qo'llash
          </button>
          <button
            onClick={resetFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
            }}
          >
            <RotateCcw size={13} /> Tozalash
          </button>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{ flex: 1, overflowX: 'auto', padding: '16px 28px 28px' }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '50vh', gap: 14, color: 'var(--text4)',
          }}>
            <ClipboardList size={56} color="var(--surface3)" />
            <span style={{ fontSize: 15, fontWeight: 500 }}>Buyurtmalar topilmadi</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Filtrlarni o'zgartirib ko'ring yoki yangi buyurtma qo'shing</span>
            <Link href="/orders/new" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent)', color: 'white', borderRadius: 8,
              padding: '9px 18px', fontSize: 12, fontWeight: 700, textDecoration: 'none',
              marginTop: 8,
            }}>
              <Plus size={14} /> Yangi buyurtma
            </Link>
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>
                Jami: <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> ta buyurtma
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)' }}>
                    {['ID', 'Mijoz', 'Mashina', 'Raqami', 'Yaratilgan', "O'zgartirilgan", 'Status', 'Xizmatlar', 'Zapchast', "To'lov", 'Maosh', 'Foyda', 'Amallar'].map(h => (
                      <th key={h} style={{
                        padding: '11px 14px', textAlign: h === 'ID' ? 'center' : 'left',
                        fontSize: 10, fontWeight: 700, color: 'var(--text3)',
                        textTransform: 'uppercase', letterSpacing: '0.07em',
                        borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((b, idx) => {
                    const sc = STATUS_CONFIG[b.holat] || { label: b.holat, bg: 'transparent', color: 'var(--text3)' };
                    const profit = b.pribil || 0;
                    const srv = b.srv || 0;

                    return (
                      <tr
                        key={b.id}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                          transition: 'background 0.15s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                      >
                        {/* ID */}
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>
                            {Number(b.id) < 0 ? '#...' : `#${b.id}`}
                          </span>
                        </td>

                        {/* Mijoz */}
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 11, whiteSpace: 'nowrap' }}>{b.ism}</div>
                          {b.tel && <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 1 }}>{b.tel}</div>}
                        </td>

                        {/* Mashina */}
                        <td style={{ padding: '8px 10px' }}>
                          {(() => {
                            const [brand, ...rest] = (b.mashina || '').split(' ');
                            const model = rest.join(' ');
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                <span style={{ fontWeight: 600, fontSize: 11, color: 'var(--text)' }}>{brand}</span>
                                {model && <span style={{ fontWeight: 600, fontSize: 11, color: 'var(--text)' }}>{model}</span>}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Raqam */}
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            background: 'var(--surface2)', border: '1px solid var(--border)',
                            padding: '1px 6px', borderRadius: 4, fontSize: 10,
                            fontWeight: 700, color: 'var(--text)', letterSpacing: '0.05em',
                          }}>
                            {b.raqam?.toUpperCase()}
                          </span>
                        </td>

                        {/* Yaratilgan */}
                        <td style={{ padding: '8px 10px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                          {fmtDate(b.createdAt || b.sana)}
                        </td>

                        {/* O'zgartirilgan */}
                        <td style={{ padding: '8px 10px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                          {fmtDate(b.createdAt || b.sana)}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            background: sc.bg, color: sc.color,
                            padding: '2px 8px', borderRadius: 20, fontSize: 10,
                            fontWeight: 700, whiteSpace: 'nowrap',
                          }}>
                            {sc.label}
                          </span>
                        </td>

                        {/* Xizmatlar */}
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text2)', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 11 }}>
                          {srv.toLocaleString()} so'm
                        </td>

                        {/* Zapchast */}
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text2)', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 11 }}>
                          {(b.zap || 0).toLocaleString()} so'm
                        </td>

                        {/* To'lov */}
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', fontSize: 11 }}>
                          {(b.final || 0).toLocaleString()} so'm
                        </td>

                        {/* Maosh */}
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--red)', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 11 }}>
                          {(b.zarplata || 0).toLocaleString()} so'm
                        </td>

                        {/* Foyda */}
                        <td style={{ padding: '8px 10px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 11 }}>
                          <span style={{
                            fontWeight: 800,
                            color: profit > 0 ? 'var(--green)' : profit < 0 ? 'var(--red)' : 'var(--text4)',
                          }}>
                            {profit.toLocaleString()} so'm
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: '4px',
                            width: 'fit-content',
                            margin: '0 auto'
                          }}>
                            {/* NEW ACTIONS */}
                            <button
                              title="Tahrirlash"
                              onClick={(e) => { e.stopPropagation(); router.push(`/orders/edit/${b.id}`); }}
                              style={{ padding: 7, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 7, cursor: 'pointer', color: '#6366f1', display: 'flex' }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)')}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              title="Tarix"
                              onClick={(e) => { e.stopPropagation(); setHistoryOrder(b); }}
                              style={{ padding: 7, background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 7, cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = '#94a3b8')}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)')}
                            >
                              <History size={14} />
                            </button>
                             <button
                               title="To'lov qilish"
                               disabled={b.holat === 'tulangan' || b.holat === 'bekor qilingan'}
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 if (b.holat !== 'tulangan') setPaymentOrder(b); 
                               }}
                               style={{ 
                                 padding: 7, 
                                 background: (b.holat !== 'tulangan' && b.holat !== 'bekor qilingan') ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', 
                                 border: (b.holat !== 'tulangan' && b.holat !== 'bekor qilingan') ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(255,255,255,0.05)', 
                                 borderRadius: 7, 
                                 cursor: (b.holat !== 'tulangan' && b.holat !== 'bekor qilingan') ? 'pointer' : 'not-allowed', 
                                 color: (b.holat !== 'tulangan' && b.holat !== 'bekor qilingan') ? '#10b981' : '#475569', 
                                 display: 'flex',
                                 opacity: (b.holat !== 'tulangan' && b.holat !== 'bekor qilingan') ? 1 : 0.4
                               }}
                               onMouseEnter={e => (b.holat !== 'tulangan' && b.holat !== 'bekor qilingan') && (e.currentTarget.style.borderColor = '#10b981')}
                               onMouseLeave={e => (b.holat !== 'tulangan' && b.holat !== 'bekor qilingan') && (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)')}
                             >
                               <CreditCard size={14} />
                             </button>

                            {/* EXISTING ACTIONS */}
                            <button
                              title="SMS yuborish"
                              onClick={(e) => { e.stopPropagation(); setSmsOrder(b); }}
                              disabled={isSendingSms === b.id.toString()}
                              style={{ padding: 7, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 7, cursor: 'pointer', color: '#10b981', display: 'flex' }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = '#10b981')}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)')}
                            >
                              <Send size={14} className={isSendingSms === b.id.toString() ? 'animate-pulse' : ''} />
                            </button>
                            <button
                              title="Check chiqarish"
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(b); }}
                              style={{ padding: 7, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 7, cursor: 'pointer', color: '#3b82f6', display: 'flex' }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)')}
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              title="O'chirish"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setDeleteConfirm({ isOpen: true, id: b.id });
                              }}
                              style={{ padding: 7, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 7, cursor: 'pointer', color: '#f43f5e', display: 'flex' }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = '#f43f5e')}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, marginTop: 24, paddingBottom: 20
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px', borderRadius: 8, background: 'var(--surface)',
                border: '1px solid var(--border)', color: 'var(--text2)',
                fontSize: 12, fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Oldingi
            </button>
            
            {Array.from({ length: Math.ceil(filtered.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: currentPage === page ? 'var(--accent)' : 'var(--surface)',
                  border: '1px solid' + (currentPage === page ? 'var(--accent)' : 'var(--border)'),
                  color: currentPage === page ? 'white' : 'var(--text2)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filtered.length / ITEMS_PER_PAGE), p + 1))}
              disabled={currentPage === Math.ceil(filtered.length / ITEMS_PER_PAGE)}
              style={{
                padding: '8px 16px', borderRadius: 8, background: 'var(--surface)',
                border: '1px solid var(--border)', color: 'var(--text2)',
                fontSize: 12, fontWeight: 600, cursor: currentPage === Math.ceil(filtered.length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer',
                opacity: currentPage === Math.ceil(filtered.length / ITEMS_PER_PAGE) ? 0.5 : 1
              }}
            >
              Keyingi
            </button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <InvoiceModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}

      {paymentOrder && (
        <PaymentModal 
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
        />
      )}

      {smsOrder && (
        <SMSModal 
          order={smsOrder}
          onClose={() => setSmsOrder(null)}
        />
      )}

      {historyOrder && (
        <HistoryModal 
          order={historyOrder}
          onClose={() => setHistoryOrder(null)}
        />
      )}

      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        title="Buyurtmani o'chirish"
        message="Haqiqatdan ham ushbu buyurtmani o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
        onConfirm={() => {
          if (deleteConfirm.id) deleteBuyurtma(deleteConfirm.id);
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  );
}
