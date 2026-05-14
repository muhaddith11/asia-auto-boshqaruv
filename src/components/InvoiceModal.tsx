'use client';
import React, { useRef } from 'react';
import { X, Printer, Download, Share2 } from 'lucide-react';
import { Buyurtma } from '@/types';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

interface InvoiceModalProps {
  order: Buyurtma;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const updateBuyurtma = useStore((state) => state.updateBuyurtma);
  const [isPrinting, setIsPrinting] = React.useState(false);

  const handleAgentPrint = async () => {
    setIsPrinting(true);
    try {
      updateBuyurtma(order.id, { print_status: 'pending' });
      toast.success('Printerga yuborildi!');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setTimeout(() => setIsPrinting(false), 2000);
    }
  };

  const paid   = order.paid  || 0;
  const final  = order.final || 0;
  const zap    = order.zap   || 0;
  const debt   = final - paid;
  const srvSum = final - zap;

  const printTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  /* ── shared cell style ── */
  const cell: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '3px 0',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: 11,
  };
  const lbl: React.CSSProperties  = { color: '#888', fontWeight: 400, minWidth: 80 };
  const val: React.CSSProperties  = { color: '#111', fontWeight: 600, textAlign: 'right' };
  const secH: React.CSSProperties = {
    background: '#111', color: '#fff',
    fontFamily: "'Arial Black', Arial, sans-serif",
    fontWeight: 900, fontSize: 12,
    letterSpacing: '0.06em', textTransform: 'uppercase' as const,
    padding: '6px 12px',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[4px] animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Modal Header — xuddi chek logosi */}
        <div className="bg-white border-b border-slate-200 flex items-center justify-between px-6 py-4">
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ lineHeight: 1 }}>
              <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: '0.04em' }}>ASIA </span>
              <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: '0.04em', color: '#e11d2a' }}>AUTO</span>
            </div>
            <div style={{
              fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 11,
              letterSpacing: '0.25em', borderTop: '2px solid #111', borderBottom: '2px solid #111',
              padding: '1px 0', marginTop: 2,
            }}>SERVICE</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-800 ml-4">
            <X size={22} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">

          {/* ── Google Fonts ── */}
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');`}</style>

          <div
            ref={printRef}
            style={{
              background: '#fff',
              width: 300,
              fontFamily: 'Arial, sans-serif',
              color: '#111',
              boxShadow: '0 4px 32px rgba(0,0,0,0.13)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >

            {/* ── LOGO HEADER ── */}
            <div style={{ textAlign: 'center', padding: '18px 12px 10px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ lineHeight: 1 }}>
                <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 30, letterSpacing: '0.04em' }}>
                  ASIA{' '}
                </span>
                <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 30, letterSpacing: '0.04em', color: '#e11d2a' }}>
                  AUTO
                </span>
              </div>
              <div style={{
                fontFamily: "'Arial Black', Arial, sans-serif",
                fontWeight: 900, fontSize: 14,
                letterSpacing: '0.25em', textTransform: 'uppercase',
                borderTop: '2px solid #111', borderBottom: '2px solid #111',
                padding: '1px 0', marginTop: 2,
              }}>
                SERVICE
              </div>
              <div style={{
                fontFamily: 'Arial, sans-serif', fontSize: 9,
                fontStyle: 'italic', color: '#888', letterSpacing: '0.06em',
                marginTop: 6, textTransform: 'uppercase',
              }}>
                Sifatli xizmat — xavfsiz yo&apos;l garovi!
              </div>
            </div>

            {/* ── META INFO ── */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>
              {[
                ['BUYURTMA', `#${order.id}`],
                ['SANA',     `${order.sana} ${printTime}`],
                ['MIJOZ',    order.ism],
                ...(order.tel ? [['TEL', order.tel]] : []),
                ['MASHINA',  order.mashina],
                ...(order.raqam ? [['RAQAM', String(order.raqam).toUpperCase()]] : []),
              ].map(([k, v]) => (
                <div key={k} style={cell}>
                  <span style={lbl}>{k}</span>
                  <span style={val}>{v}</span>
                </div>
              ))}
            </div>

            {/* ── XIZMATLAR ── */}
            {order.services && order.services.length > 0 && (
              <>
                <div style={secH}>Ko&apos;rsatilgan xizmatlar</div>
                <div style={{ padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>
                  {order.services.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#111', flex: 1 }}>{s.nom || s.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>
                        {Number(s.narx || s.price || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── EHTIYOT QISMLAR ── */}
            {order.zaps && order.zaps.length > 0 && (
              <>
                <div style={secH}>Ehtiyot qismlar</div>
                <div style={{ padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>
                  {order.zaps.map((p, i) => {
                    const qty   = p.qty || p.quantity || 1;
                    const price = Number(p.narx || p.price || 0);
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111', flex: 1 }}>{p.nom || p.name}</span>
                        <span style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 12, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>
                          {(price * qty).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── SUBTOTALS — faqat qisman to'langan bo'lsa ── */}
            {paid > 0 && (
              <div style={{ padding: '6px 12px', borderBottom: '1px solid #e5e7eb' }}>
                {srvSum > 0 && zap > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', fontFamily: "'JetBrains Mono','Courier New',monospace", padding: '1px 0' }}>
                    <span>Xizmatlar</span><span>{srvSum.toLocaleString()} UZS</span>
                  </div>
                )}
                {zap > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', fontFamily: "'JetBrains Mono','Courier New',monospace", padding: '1px 0' }}>
                    <span>Zapchastlar</span><span>{zap.toLocaleString()} UZS</span>
                  </div>
                )}
                {paid > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#16a34a', fontFamily: "'JetBrains Mono','Courier New',monospace", padding: '1px 0' }}>
                    <span>To&apos;langan</span><span>{paid.toLocaleString()} UZS</span>
                  </div>
                )}
                {debt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#dc2626', fontFamily: "'JetBrains Mono','Courier New',monospace", padding: '1px 0' }}>
                    <span>Qolgan qarz</span><span>{debt.toLocaleString()} UZS</span>
                  </div>
                )}
              </div>
            )}

            {/* ── JAMI BAR ── */}
            <div style={{
              background: '#111', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 12px',
            }}>
              <span style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: '0.04em', color: '#ccc' }}>
                JAMI
              </span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontWeight: 900, fontSize: 24, letterSpacing: '0.01em' }}>
                  {final.toLocaleString()}
                </span>
                <span style={{ fontSize: 11, color: '#aaa', marginLeft: 4 }}>uzs</span>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{
              borderTop: '1.5px dashed #ccc',
              textAlign: 'center',
              padding: '12px 12px 14px',
            }}>
              <div style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: '0.04em', marginBottom: 8 }}>
                TASHRIFINGIZ UCHUN RAHMAT!
              </div>
              <div style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 10, color: '#d97706', lineHeight: 1.8 }}>
                +998 90 570 88 88<br />
                Qo&apos;qon sh., Ubay Oripov 10<br />
                Shanba-Payshanba | 9:00 dan 20:00 gacha
              </div>
              <div style={{
                display: 'inline-block', marginTop: 8,
                border: '1px solid #ccc', borderRadius: 4,
                padding: '2px 10px',
                fontFamily: "'JetBrains Mono','Courier New',monospace",
                fontSize: 10, color: '#555',
              }}>
                Instagram &amp; Telegram:<br />
                @asia_auto_service
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
          <button
            onClick={handleAgentPrint}
            disabled={isPrinting}
            className={`flex-1 ${isPrinting ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black py-5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20 disabled:opacity-70`}
          >
            <Printer size={22} strokeWidth={2.5} />
            {isPrinting ? 'PRINTERGA YUBORILDI...' : 'CHECKNI CHIQARISH (AVTOMAT)'}
          </button>
          <button className="w-16 h-16 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center transition-all">
            <Download size={22} />
          </button>
          <button className="w-16 h-16 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center transition-all">
            <Share2 size={22} />
          </button>
        </div>

      </div>
    </div>
  );
}
