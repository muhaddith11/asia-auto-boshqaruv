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
      <header className="h-[73px] bg-[#0d1220] border-b border-white/5 flex items-center justify-between px-4 lg:px-7 sticky top-0 z-[100] shrink-0">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="hidden lg:flex items-center gap-4">
            {!isHome && (
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[13px] font-bold text-slate-400 hover:bg-white/10 transition-all cursor-pointer"
              >
                ← Orqaga
              </button>
            )}
            {pathname === '/orders/new' && (
              <h2 className="text-[16px] font-black text-white m-0 tracking-tight uppercase">
                Buyurtma yaratish
              </h2>
            )}
          </div>
          
          {/* Mobile Logo/Title */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Plus size={18} color="white" />
            </div>
            <span className="text-[14px] font-black text-white uppercase tracking-tighter">AsiaAuto</span>
          </div>
        </div>

        {/* Desktop Widgets */}
        <div className="hidden lg:flex items-center gap-5">
          <div className="flex items-center gap-3">
            {/* Naqd */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2">
              <Banknote size={14} color="#10b981" />
              <div>
                <div className="text-[8px] color-slate-500 font-black uppercase tracking-widest leading-none mb-1">Naqd</div>
                <div className="text-[13px] font-black text-white leading-none">
                  {mounted ? kassa.naqd.toLocaleString() : '—'}
                </div>
              </div>
            </div>

            {/* Karta */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2">
              <CreditCard size={14} color="#06b6d4" />
              <div>
                <div className="text-[8px] color-slate-500 font-black uppercase tracking-widest leading-none mb-1">Karta</div>
                <div className="text-[13px] font-black text-white leading-none">
                  {mounted ? kassa.karta.toLocaleString() : '—'}
                </div>
              </div>
            </div>

            {/* Jami */}
            <div className="flex items-center gap-3 bg-blue-600/10 border border-blue-500/20 rounded-xl px-4 py-2">
              <Wallet size={14} className="text-blue-400" />
              <div>
                <div className="text-[8px] text-blue-400 font-black uppercase tracking-widest leading-none mb-1">Jami</div>
                <div className="text-[14px] font-black text-blue-400 leading-none">
                  {mounted ? totalBalance.toLocaleString() : '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-white/5 mx-1" />

          <div className="flex items-center gap-3">
            <button
               onClick={() => setCashModal({ open: true, type: 'expense' })}
               className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              Chiqim
            </button>
            <button
               onClick={() => setCashModal({ open: true, type: 'income' })}
               className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"
            >
              Kirim
            </button>
            <button
              onClick={async () => {
                const store = useStore.getState();
                await store.loadInitialData();
              }}
              className="bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl p-2.5 hover:bg-amber-500/20 transition-all"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Mobile View Summary */}
        <div className="flex lg:hidden items-center gap-3">
           <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg px-3 py-1.5 flex flex-col items-end">
              <div className="text-[9px] font-black text-blue-400 uppercase tracking-tighter leading-none mb-1">Kassa jami</div>
              <div className="text-[13px] font-black text-white leading-none">{mounted ? totalBalance.toLocaleString() : '—'}</div>
           </div>
           <button
              onClick={async () => {
                const store = useStore.getState();
                await store.loadInitialData();
              }}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"
            >
              <RefreshCw size={18} />
            </button>
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
