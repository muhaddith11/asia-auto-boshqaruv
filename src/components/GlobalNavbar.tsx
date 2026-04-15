'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Banknote, CreditCard, Wallet, Plus, RefreshCcw, ArrowLeft, Settings2 } from 'lucide-react';
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
        {/* LEFT SECTION: Logo yoki Orqaga tugmasi (Markazni ushlab turish uchun kengligi belgilangan) */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          {!isHome ? (
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700,
                color: 'white', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <ArrowLeft size={16} /> Orqaga
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings2 size={18} color="white" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AsiaAuto <span style={{ color: 'var(--text3)' }}>Service</span>
              </div>
            </div>
          )}
        </div>

        {/* CENTER SECTION: Hisobotlar / Balanslar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Naqd */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: '6px 14px' }}>
            <Banknote size={13} color="var(--green)" />
            <div>
              <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>Naqd</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white', lineHeight: 1.3 }}>{mounted ? kassa.naqd.toLocaleString() : '0'}</div>
            </div>
          </div>
          {/* Karta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(6,182,212,0.03)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 10, padding: '6px 14px' }}>
            <CreditCard size={13} color="var(--cyan)" />
            <div>
              <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>Karta</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white', lineHeight: 1.3 }}>{mounted ? kassa.karta.toLocaleString() : '0'}</div>
            </div>
          </div>
          {/* Jami */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.02))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '6px 14px' }}>
            <Wallet size={13} color="var(--accent)" />
            <div>
              <div style={{ fontSize: 9, color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>Jami</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#a5b4fc', lineHeight: 1.3 }}>{mounted ? totalBalance.toLocaleString() : '0'}</div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200, justifyContent: 'flex-end' }}>
          <button
            onClick={() => setCashModal({ open: true, type: 'expense' })}
            style={{
              background: 'rgba(244,63,94,0.1)', color: 'var(--red)',
              border: '1px solid rgba(244,63,94,0.2)', borderRadius: 11,
              width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Xarajat"
          >
            <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
          </button>

          <button
            onClick={() => setTransferOpen(true)}
            style={{
              background: 'rgba(99,102,241,0.1)', color: 'var(--accent)',
              border: '1px solid rgba(99,102,241,0.2)', borderRadius: 11,
              width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="O'tkazma"
          >
            <RefreshCcw size={18} />
          </button>

          <button
            onClick={() => setCashModal({ open: true, type: 'income' })}
            style={{
              background: 'rgba(16,185,129,0.1)', color: 'var(--green)',
              border: '1px solid rgba(16,185,129,0.2)', borderRadius: 11,
              width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Kirim"
          >
            <Plus size={20} />
          </button>

          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />

          <button
            onClick={async () => {
              const store = useStore.getState();
              await store.loadInitialData();
              alert('Yangilandi!');
            }}
            style={{
              background: 'rgba(234,179,8,0.1)', color: '#eab308',
              border: '1px solid rgba(234,179,8,0.2)', borderRadius: 11,
              padding: '0 16px', height: 42, fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <RefreshCcw size={14} /> Yangilash
          </button>
        </div>
      </header>

      {cashModal.open && (
        <CashModal type={cashModal.type} onClose={() => setCashModal({ ...cashModal, open: false })} />
      )}
      {transferOpen && <TransferModal onClose={() => setTransferOpen(false)} />}
    </>
  );
}
