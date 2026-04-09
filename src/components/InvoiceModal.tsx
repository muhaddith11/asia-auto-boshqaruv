'use client';
import React, { useRef } from 'react';
import { X, Printer, Download, Share2 } from 'lucide-react';
import { Buyurtma } from '@/types';

interface InvoiceModalProps {
  order: Buyurtma;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>AutoServis Pro - Check #${order.id}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 20px; color: #000; background: #fff; }
              .header { text-align: center; border-bottom: 2px dashed #eee; padding-bottom: 20px; margin-bottom: 20px; }
              .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
              .id { font-size: 14px; color: #666; margin-top: 5px; }
              .section { margin-bottom: 20px; }
              .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #999; margin-bottom: 4px; }
              .value { font-size: 14px; font-weight: 700; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { text-align: left; font-size: 10px; color: #999; border-bottom: 1px solid #eee; padding: 10px 0; }
              td { padding: 12px 0; font-size: 13px; border-bottom: 1px solid #f9f9f9; }
              .total-row { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
              .grand-total { font-size: 22px; font-weight: 900; text-align: right; }
              .footer { text-align: center; font-size: 11px; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

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
        <div className="flex-1 overflow-y-auto p-12 bg-slate-100 flex justify-center">
            <div 
              ref={printRef}
              className="bg-white w-full max-w-[420px] shadow-sm p-10 text-slate-900 font-sans"
              style={{ minHeight: '600px' }}
            >
                {/* Print Content Starts Here */}
                <div className="header text-center pb-8 border-b-2 border-dashed border-slate-100">
                   <div className="text-[28px] font-black tracking-tighter text-black uppercase">AutoServis Pro</div>
                   <div className="text-[11px] font-bold text-slate-400 tracking-[0.2em] mt-1 mb-4 uppercase">Professional xizmat markazi</div>
                   <div className="text-[13px] font-bold text-slate-800">Sana: {order.sana}</div>
                </div>

                <div className="mt-8 space-y-6">
                   <div className="flex justify-between">
                      <div>
                         <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Mijoz</div>
                         <div className="text-[15px] font-black text-slate-900 uppercase">{order.ism}</div>
                         <div className="text-[12px] font-bold text-slate-500">{order.tel}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Mashina</div>
                         <div className="text-[15px] font-black text-slate-900 uppercase">{order.mashina}</div>
                         <div className="text-[11px] font-black text-blue-600 tracking-widest">{order.raqam}</div>
                      </div>
                   </div>

                   <table className="w-full mt-8 border-t border-slate-100">
                      <thead>
                         <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                            <th className="py-4 text-left">Xizmat va Zapchastlar</th>
                            <th className="py-4 text-right">Summa</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {order.services.map((s, i) => (
                           <tr key={i}>
                              <td className="py-4">
                                 <div className="text-[14px] font-bold text-slate-800 uppercase">{s.nom}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">Usta xizmati</div>
                              </td>
                              <td className="py-4 text-right font-black text-slate-900">{s.narx.toLocaleString()}</td>
                           </tr>
                         ))}
                         {order.zaps && order.zaps.map((p, i) => (
                           <tr key={`p-${i}`}>
                              <td className="py-4">
                                 <div className="text-[14px] font-bold text-slate-800 uppercase">{p.nom} x{p.qty || 1}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">Ehtiyot qism</div>
                              </td>
                              <td className="py-4 text-right font-black text-slate-900">{(p.narx * (p.qty || 1)).toLocaleString()}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>

                   <div className="pt-6 border-t-2 border-slate-900 space-y-3">
                      <div className="flex justify-between items-center text-slate-400">
                         <span className="text-[12px] font-bold uppercase tracking-widest">Umumiy xizmatlar</span>
                         <span className="font-bold">{(order.final - order.zap).toLocaleString()} UZS</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                         <span className="text-[12px] font-bold uppercase tracking-widest">Zapchastlar</span>
                         <span className="font-bold">{order.zap.toLocaleString()} UZS</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                         <span className="text-[16px] font-black text-slate-900 uppercase tracking-tighter">Jami To'lov</span>
                         <span className="text-[24px] font-black text-slate-900">{order.final.toLocaleString()} <span className="text-[12px] ml-0.5">UZS</span></span>
                      </div>
                   </div>

                   <div className="footer text-center pt-10 border-t border-dashed border-slate-100 mt-8">
                      <div className="text-[13px] font-black text-slate-800 mb-1">Xarid uchun rahmat!</div>
                      <div className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
                         Manzil: Toshkent sh., Chilonzor tumani<br />
                         Tel: +998 90 123 45 67<br />
                         Telegram: @AutoServisPro
                      </div>
                   </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
            <button 
              onClick={handlePrint}
              className="flex-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              <Printer size={20} strokeWidth={2.5} /> Checkni chiqarish
            </button>
            <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
              <Download size={20} /> PDF
            </button>
            <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-1 transition-all">
              <Share2 size={20} />
            </button>
        </div>
      </div>
    </div>
  );
}
