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
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setTimeout(() => setIsPrinting(false), 2000);
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
                   <div className="text-[28px] font-black tracking-tighter text-black uppercase">AsiaAutoService</div>
                   <div className="text-[11px] font-bold text-slate-400 tracking-[0.2em] mt-1 mb-4 uppercase">Professional xizmat markazi</div>
                   <div className="text-[13px] font-bold text-slate-800">Sana: {order.sana}</div>
                </div>

                <div className="mt-8 space-y-6">
           
           {/* Invoice Header */}
           <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
              <div className="space-y-1">
                 <h2 className="text-[32px] font-black text-slate-900 tracking-tighter uppercase">Kvitansiya</h2>
                 <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">Buyurtma #{order?.id || '???'}</p>
              </div>
              <div className="text-right space-y-1">
                 <div className="text-[18px] font-black text-slate-900 uppercase">Asia Auto Service</div>
                 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{order?.sana || order?.createdAt?.split('T')[0] || '—'}</div>
              </div>
           </div>
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
                         {order.services?.map((s, i) => (
                           <tr key={i}>
                              <td className="py-4">
                                 <div className="text-[14px] font-bold text-slate-800 uppercase">{s.nom || s.name}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">Usta xizmati</div>
                              </td>
                              <td className="py-4 text-right font-black text-slate-900">{Number(s.narx || s.price || 0).toLocaleString()}</td>
                           </tr>
                         ))}
                         {order.zaps?.map((p, i) => (
                           <tr key={`p-${i}`}>
                              <td className="py-4">
                                 <div className="text-[14px] font-bold text-slate-800 uppercase">{(p.nom || p.name)} x{(p.qty || p.quantity || 1)}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">Ehtiyot qism</div>
                              </td>
                              <td className="py-4 text-right font-black text-slate-900">{(Number(p.narx || p.price || 0) * (p.qty || p.quantity || 1)).toLocaleString()}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>

                    <div className="pt-6 border-t-2 border-slate-900 space-y-3">
                       <div className="flex justify-between items-center text-slate-400">
                          <span className="text-[12px] font-bold uppercase tracking-widest">Umumiy xizmatlar</span>
                          <span className="font-bold">{( (order.final || 0) - (order.zap || 0)).toLocaleString()} UZS</span>
                       </div>
                       <div className="flex justify-between items-center text-slate-400">
                          <span className="text-[12px] font-bold uppercase tracking-widest">Zapchastlar</span>
                          <span className="font-bold">{(order.zap || 0).toLocaleString()} UZS</span>
                       </div>
                       <div className="flex justify-between items-end pt-6 mt-4 border-t-2 border-slate-900">
                          <div className="text-[14px] font-black text-slate-400 uppercase tracking-widest pb-1">Jami To'lov</div>
                          <div className="text-right text-[32px] font-black text-slate-900 tracking-tighter">
                            {(order?.final || 0).toLocaleString()} <span className="text-[14px] text-slate-500 uppercase ml-1">Sum</span>
                          </div>
                       </div>
                    </div>

                   <div className="footer text-center pt-10 border-t border-dashed border-slate-100 mt-8">
                      <div className="text-[13px] font-black text-slate-800 mb-1">Xarid uchun rahmat!</div>
                      <div className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
                         Manzil: Toshkent sh., Chilonzor tumani<br />
                         Tel: +998 90 123 45 67<br />
                         Telegram: @AsiaAutoService
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
