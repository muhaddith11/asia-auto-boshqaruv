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

const receiptStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

  .r-wrap {
    font-family: 'Inter', sans-serif;
    background: #fff;
    width: 302px;
    padding: 0;
    color: #111;
    font-size: 12px;
    line-height: 1.4;
  }

  .r-header {
    background: #000;
    color: #fff;
    text-align: center;
    padding: 14px 12px 12px;
  }

  .r-logo {
    font-family: 'Oswald', sans-serif;
    font-weight: 700;
    font-size: 22px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 1;
    margin-bottom: 4px;
  }

  .r-logo span {
    color: #e11d2a;
  }

  .r-tagline {
    font-family: 'Inter', sans-serif;
    font-size: 8px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #aaa;
    margin-top: 3px;
  }

  .r-block {
    padding: 10px 12px;
    border-bottom: 1px dashed #ddd;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
  }

  .r-block-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2px 0;
  }

  .r-block-label {
    color: #888;
    font-weight: 400;
    white-space: nowrap;
    margin-right: 6px;
    min-width: 70px;
  }

  .r-block-value {
    color: #111;
    font-weight: 600;
    text-align: right;
    word-break: break-word;
  }

  .r-section-h {
    background: #111;
    color: #fff;
    font-family: 'Oswald', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 12px;
  }

  .r-items {
    padding: 4px 0;
    border-bottom: 1px dashed #ddd;
  }

  .r-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 5px 12px;
    gap: 8px;
  }

  .r-item-name {
    font-size: 11px;
    font-weight: 600;
    color: #111;
    flex: 1;
    line-height: 1.3;
  }

  .r-item-sub {
    font-size: 9px;
    color: #999;
    font-weight: 400;
    margin-top: 1px;
  }

  .r-item-price {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #111;
    white-space: nowrap;
  }

  .r-subtotals {
    padding: 6px 12px 4px;
    border-bottom: 1px dashed #ddd;
  }

  .r-subtotal-row {
    display: flex;
    justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    padding: 2px 0;
    color: #555;
  }

  .r-subtotal-row.paid {
    color: #16a34a;
    font-weight: 700;
  }

  .r-subtotal-row.debt {
    color: #dc2626;
    font-weight: 700;
  }

  .r-total {
    background: #111;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 12px;
  }

  .r-total-label {
    font-family: 'Oswald', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #aaa;
  }

  .r-total-amount {
    font-family: 'Oswald', sans-serif;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .r-total-amount span {
    font-size: 12px;
    font-weight: 400;
    color: #aaa;
    margin-left: 3px;
  }

  .r-footer {
    text-align: center;
    padding: 10px 12px 12px;
    border-top: 1px dashed #ddd;
    margin-top: 2px;
  }

  .r-footer-thanks {
    font-family: 'Oswald', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
    color: #111;
  }

  .r-footer-info {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #888;
    line-height: 1.7;
  }

  .r-divider {
    border: none;
    border-top: 1px dashed #ddd;
    margin: 0;
  }

  @media print {
    @page {
      size: 80mm auto;
      margin: 0;
    }
    body * { visibility: hidden !important; }
    #receipt-printable, #receipt-printable * { visibility: visible !important; }
    #receipt-printable {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 80mm !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .r-wrap {
      width: 100% !important;
      box-shadow: none !important;
    }
  }
`;

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

  const servicesTotal = (order.final || 0) - (order.zap || 0);
  const zapsTotal = order.zap || 0;
  const paid = order.paid || 0;
  const debt = (order.final || 0) - paid;

  const printTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[4px] animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="bg-[#f8fafc] px-8 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-[15px] uppercase tracking-tight">Kvitansiya / Check</h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Buyurtma #{order.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-800">
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
          <style dangerouslySetInnerHTML={{ __html: receiptStyles }} />

          <div
            id="receipt-printable"
            ref={printRef}
            style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
          >
            <div className="r-wrap">

              {/* Header */}
              <div className="r-header">
                <div className="r-logo">ASIA <span>AUTO</span> SERVICE</div>
                <div className="r-tagline">Sifatli xizmat — xavfsiz yo&apos;l garovi!</div>
              </div>

              {/* Meta info */}
              <div className="r-block">
                <div className="r-block-row">
                  <span className="r-block-label">Buyurtma #</span>
                  <span className="r-block-value">{order.id}</span>
                </div>
                <div className="r-block-row">
                  <span className="r-block-label">Sana</span>
                  <span className="r-block-value">{order.sana} {printTime}</span>
                </div>
                <div className="r-block-row">
                  <span className="r-block-label">Mijoz</span>
                  <span className="r-block-value">{order.ism}</span>
                </div>
                {order.tel && (
                  <div className="r-block-row">
                    <span className="r-block-label">Tel</span>
                    <span className="r-block-value">{order.tel}</span>
                  </div>
                )}
                <div className="r-block-row">
                  <span className="r-block-label">Mashina</span>
                  <span className="r-block-value">{order.mashina}</span>
                </div>
                {order.raqam && (
                  <div className="r-block-row">
                    <span className="r-block-label">Raqam</span>
                    <span className="r-block-value" style={{ fontWeight: 700 }}>{order.raqam}</span>
                  </div>
                )}
              </div>

              {/* Services section */}
              {order.services && order.services.length > 0 && (
                <>
                  <div className="r-section-h">Xizmatlar</div>
                  <div className="r-items">
                    {order.services.map((s, i) => (
                      <div key={i} className="r-item">
                        <div>
                          <div className="r-item-name">{s.nom || s.name}</div>
                          <div className="r-item-sub">Usta xizmati</div>
                        </div>
                        <div className="r-item-price">{Number(s.narx || s.price || 0).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Parts section */}
              {order.zaps && order.zaps.length > 0 && (
                <>
                  <div className="r-section-h">Ehtiyot qismlar</div>
                  <div className="r-items">
                    {order.zaps.map((p, i) => {
                      const qty = p.qty || p.quantity || 1;
                      const price = Number(p.narx || p.price || 0);
                      return (
                        <div key={i} className="r-item">
                          <div>
                            <div className="r-item-name">{p.nom || p.name}</div>
                            <div className="r-item-sub">{price.toLocaleString()} × {qty}</div>
                          </div>
                          <div className="r-item-price">{(price * qty).toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Subtotals */}
              <div className="r-subtotals">
                {order.services && order.services.length > 0 && (
                  <div className="r-subtotal-row">
                    <span>Xizmatlar jami</span>
                    <span>{servicesTotal.toLocaleString()} UZS</span>
                  </div>
                )}
                {zapsTotal > 0 && (
                  <div className="r-subtotal-row">
                    <span>Zapchastlar jami</span>
                    <span>{zapsTotal.toLocaleString()} UZS</span>
                  </div>
                )}
                {paid > 0 && (
                  <div className="r-subtotal-row paid">
                    <span>To&apos;langan</span>
                    <span>{paid.toLocaleString()} UZS</span>
                  </div>
                )}
                {debt > 0 && (
                  <div className="r-subtotal-row debt">
                    <span>Qolgan qarz</span>
                    <span>{debt.toLocaleString()} UZS</span>
                  </div>
                )}
              </div>

              {/* Total bar */}
              <div className="r-total">
                <div className="r-total-label">Jami summa</div>
                <div className="r-total-amount">
                  {(order.final || 0).toLocaleString()}
                  <span>UZS</span>
                </div>
              </div>

              {/* Footer */}
              <div className="r-footer">
                <div className="r-footer-thanks">Xarid uchun rahmat!</div>
                <div className="r-footer-info">
                  Qo&apos;qon sh. Ubay Oripov 12<br />
                  +998 90 570 88 88<br />
                  @AsiaAutoService
                </div>
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
