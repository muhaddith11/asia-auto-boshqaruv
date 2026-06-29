import React from 'react';

// Yangi buyurtma formasi uchun umumiy stillar va status tablari.
export const STATUS_TABS = [
  { key: 'yaratildi', label: 'Yaratildi', color: '#64748b' },
  { key: 'tamirlanmoqda', label: 'Tamirlanmoqda', color: '#6366f1' },
  { key: 'ehtiyot qism kutilyapti', label: 'Ehtiyot qism kutilyapti', color: '#06b6d4' },
  { key: 'tulanmagan', label: "To'lanmagan", color: '#f97316' },
  { key: 'tulangan', label: "To'langan", color: '#10b981' },
  { key: 'bekor qilingan', label: 'Bekor qilingan', color: '#f43f5e' },
];

export const S = {
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 6,
  } as React.CSSProperties,
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  select: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: 'var(--text)',
    outline: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden' as const,
    marginBottom: 20,
  } as React.CSSProperties,
  cardHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.02)',
  } as React.CSSProperties,
  cardBody: {
    padding: 24,
  } as React.CSSProperties,
};

// Forma holati tiplari (sektsiyalar o'rtasida bo'lishiladi)
export interface OrderForm {
  ism: string;
  tel: string;
  mashina: string;
  raqam: string;
  yil: string;
  vin: string;
  muammo: string;
  holat: string;
  chegirma: number;
  chegirmaFoiz: number;
}

export interface Assignment {
  id: number;
  workerId: string;
  serviceId: string;
  customNarx: string;
}

export interface PartRow {
  id: number;
  partId: string;
  qty: number;
}
