'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Banknote, CreditCard, Wallet, Plus, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import CashModal from '@/components/CashModal';
import TransferModal from '@/components/TransferModal';

export default function GlobalNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { kassa } = useStore();
  const [mounted, setMounted] = useState(false);
  const [cashModal, setCashModal] = useState<{ open: boolean; type: 'income' | 'expense' }>({ open: false, type: 'income' });
  const [transferOpen, setTransferOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalBalance = mounted ? kassa.naqd + kassa.karta : 0;
  const isHome = pathname === '/';

  return (
    <>
      <header style={{
        height: 73,
        background: '#0d1220',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!isHome && (
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700,
                color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            >
              ← Orqaga
            </button>
          )}
          {pathname === '/orders/new' && (
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
              Buyurtma yaratish
            </h2>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Naqd */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 9, padding: '5px 12px',
            }}>
              <Banknote size={13} color="var(--green)" />
              <div>
                <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>Naqd</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                  {mounted ? kassa.naqd.toLocaleString() : '—'}
                </div>
              </div>
            </div>

            {/* Karta */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 9, padding: '5px 12px',
            }}>
              <CreditCard size={13} color="var(--cyan)" />
              <div>
                <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>Karta</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                  {mounted ? kassa.karta.toLocaleString() : '—'}
                </div>
              </div>
            </div>

            {/* Jami */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 9, padding: '5px 12px',
            }}>
              <Wallet size={13} color="var(--accent)" />
              <div>
                <div style={{ fontSize: 9, color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>Jami</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#a5b4fc', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                  {mounted ? totalBalance.toLocaleString() : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 2px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Xarajat */}
            <button
              onClick={() => setCashModal({ open: true, type: 'expense' })}
              style={{
                background: 'rgba(244,63,94,0.12)', color: 'var(--red)',
                border: '1px solid rgba(244,63,94,0.25)', borderRadius: 9,
                padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.12)')}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
              Xarajat
            </button>

            {/* O'tkazma */}
            <button
              onClick={() => setTransferOpen(true)}
              style={{
                background: 'rgba(99,102,241,0.12)', color: 'var(--accent)',
                border: '1px solid rgba(99,102,241,0.25)', borderRadius: 9,
                padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
            >
              <RefreshCw size={12} /> O'tkazma
            </button>

            {/* Kirim */}
            <button
              onClick={() => setCashModal({ open: true, type: 'income' })}
              style={{
                background: 'rgba(16,185,129,0.12)', color: 'var(--green)',
                border: '1px solid rgba(16,185,129,0.3)', borderRadius: 9,
                padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.12)')}
            >
              <Plus size={13} /> Kirim
            </button>
            {/* Sync */}
            <button
              onClick={async () => {
                const store = useStore.getState();
                await store.loadInitialData();
                alert('Baza muvaffaqiyatli sinxronizatsiya qilindi!');
              }}
              style={{
                background: 'rgba(234,179,8,0.12)', color: '#eab308',
                border: '1px solid rgba(234,179,8,0.3)', borderRadius: 9,
                padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(234,179,8,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(234,179,8,0.12)')}
            >
              <RefreshCw size={13} /> Yangilash
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      {cashModal.open && (
        <CashModal type={cashModal.type} onClose={() => setCashModal({ ...cashModal, open: false })} />
      )}
      {transferOpen && <TransferModal onClose={() => setTransferOpen(false)} />}
    </>
  );
}
