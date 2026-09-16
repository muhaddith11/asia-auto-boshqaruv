import type { CSSProperties } from 'react';

// Rasxod qaytishi sahifasi komponentlari uchun umumiy inline stillar.
// (Dashboard'da Tailwind spacing utilitalari globals.css reset tufayli ishonchsiz —
// shu sabab inline style; fokus/hover — globals.css'dagi .rd-input / .rd-btn.)

export const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

export const COLOR = {
  amber: '#f59e0b',
  green: '#10b981',
  red: '#f43f5e',
  indigo: '#6366f1',
  slate: '#64748b',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  minWidth: 0,
  background: '#121721',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: 13,
  color: 'white',
  outline: 'none',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 800,
  color: 'var(--text3)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
};

type Tone = 'primary' | 'success' | 'danger' | 'neutral';

const TONES: Record<Tone, CSSProperties> = {
  primary: { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
  success: { background: 'rgba(16,185,129,0.12)', color: COLOR.green, border: '1px solid rgba(16,185,129,0.3)' },
  danger: { background: 'rgba(244,63,94,0.08)', color: COLOR.red, border: '1px solid rgba(244,63,94,0.22)' },
  neutral: { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' },
};

export function btn(tone: Tone, size: 'sm' | 'md' = 'md', extra?: CSSProperties): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: size === 'sm' ? 8 : 10,
    padding: size === 'sm' ? '6px 10px' : '9px 16px',
    fontSize: size === 'sm' ? 11.5 : 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'filter 0.15s, opacity 0.15s',
    ...TONES[tone],
    ...extra,
  };
}

export function iconBtn(tone: Tone = 'neutral'): CSSProperties {
  return {
    ...TONES[tone],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    padding: 0,
    borderRadius: 8,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'filter 0.15s, opacity 0.15s',
  };
}

export function errorText(err: unknown, fallback = "Xatolik yuz berdi"): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
