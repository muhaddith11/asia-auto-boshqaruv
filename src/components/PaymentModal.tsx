'use client';
import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Car, 
  CreditCard, 
  DollarSign, 
  ClipboardList, 
  Plus, 
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Buyurtma, Xodim } from '@/types';
import { useStore } from '@/store/useStore';

interface PaymentModalProps {
  order: Buyurtma;
  onClose: () => void;
}

export default function PaymentModal({ order, onClose }: PaymentModalProps) {
  const { updateBuyurtma, updateKassa, addTashqariOperatsiya, addIshxonaOperatsiya, xodimlar } = useStore();
  const [method, setMethod] = useState<'naqd' | 'karta'>('naqd');
  const [discount, setDiscount] = useState(0);
  const [comment, setComment] = useState('');

  const currentFinal = Math.max(0, order.final - discount);

  const handleConfirmPayment = () => {
    // 1. Update order status and discount
    updateBuyurtma(order.id, { 
      holat: 'tulangan',
      chegirma: order.chegirma + discount,
      final: currentFinal
    });

    // 2. Add to Kassa
    updateKassa(method, currentFinal, 'add');

    // 3. Log transaction
    const op = {
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      method: method,
      amount: currentFinal,
      category: 'Buyurtma to\'lovi',
      comment: `Buyurtma #${order.id} - ${order.ism}${comment ? ' | ' + comment : ''}`,
      source: 'buyurtma',
      orderId: order.id
    };
    addIshxonaOperatsiya(op as any);

    onClose();
  };

  const getWorkerName = (id: number) => {
    const w = xodimlar.find(x => x.id === id);
    return w ? `${w.ism} ${w.familiya || ''}` : 'Noma\'lum usta';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[6px] animate-in fade-in duration-300">
      <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-3xl w-full max-w-[850px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.7)] animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1f222d] shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                 <DollarSign size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-black text-[16px] text-white uppercase tracking-tight">To'lovni qabul qilish #{order.id}</h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Moliya va hisob-kitob</p>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-xl">
             <X size={20} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-8">
            {/* 1. Client Info */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-blue-500" /> Mijoz ma'lumotlari
              </h4>
              <div className="bg-[#1e212b] border border-[#2a2d3d] rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-[12px] text-slate-500 font-medium">Ism Familiya</span>
                  <span className="text-[13px] text-white font-bold">{order.ism}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-[12px] text-slate-500 font-medium">Telefon</span>
                  <span className="text-[13px] text-emerald-400 font-black">{order.tel || '—'}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-[12px] text-slate-500 font-medium">Mashina</span>
                  <span className="text-[13px] text-white font-bold uppercase tracking-tight">{order.mashina}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-slate-500 font-medium">Raqam / VIN</span>
                  <span className="text-[11px] text-slate-300 font-mono font-bold">{order.raqam} {order.vin ? `/ ${order.vin}` : ''}</span>
                </div>
              </div>
            </div>

            {/* 2. Financial Info */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} className="text-blue-500" /> Moliyaviy ma'lumotlar
              </h4>
              <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-[12px] text-slate-400">
                  <span>Xizmatlar</span>
                  <span className="font-bold text-white">{order.srv.toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between items-center text-[12px] text-slate-400">
                  <span>Zapchastlar</span>
                  <span className="font-bold text-white">{order.zap.toLocaleString()} so'm</span>
                </div>
                {(order.chegirma > 0 || discount > 0) && (
                  <div className="flex justify-between items-center text-[12px] text-red-400">
                    <span>Chegirma (Jami)</span>
                    <span className="font-black">-{ (order.chegirma + discount).toLocaleString() } so'm</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-2">
                  <span className="text-[13px] text-white font-black uppercase tracking-widest">To'lanadigan</span>
                  <span className="text-[22px] text-blue-400 font-black tracking-tight">{currentFinal.toLocaleString()} <span className="text-[10px] text-slate-500 uppercase">sum</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Performed Works & Parts */}
          <div className="grid grid-cols-2 gap-8">
             <div className="space-y-4">
               <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <ClipboardList size={14} className="text-blue-500" /> Bajarilgan ishlar
               </h4>
               <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                 {order.services.map((s, i) => (
                   <div key={i} className="bg-[#1e212b] border border-[#2a2d3d] p-3 rounded-xl flex items-center justify-between group hover:border-blue-500/40 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[12px] text-white font-bold">{s.nom}</span>
                        <span className="text-[10px] text-slate-500">{getWorkerName(s.workerId)}</span>
                      </div>
                      <span className="text-[11px] font-black text-blue-400">{s.narx.toLocaleString()} sum</span>
                   </div>
                 ))}
                 {order.services.length === 0 && <p className="text-[11px] text-slate-600 italic">Xizmatlar qo'shilmagan</p>}
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={14} className="text-blue-500" /> Ishlatilgan ehtiyot qismlar
               </h4>
               <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                 {order.zaps.map((z, i) => (
                   <div key={i} className="bg-[#1e212b] border border-[#2a2d3d] p-3 rounded-xl flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[12px] text-white font-bold">{z.nom}</span>
                        <span className="text-[10px] text-slate-500">{z.qty} {z.bir}</span>
                      </div>
                      <span className="text-[11px] font-black text-amber-500">{(z.narx * z.qty).toLocaleString()} sum</span>
                   </div>
                 ))}
                 {order.zaps.length === 0 && <p className="text-[11px] text-slate-600 italic">Zapchastlar ishlatilmagan</p>}
               </div>
             </div>
          </div>

          {/* 4. Payment Action Section */}
          <div className="bg-[#1e212b] border border-blue-500/20 rounded-2xl p-6 grid grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">To'lov usuli *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setMethod('naqd')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-black text-[12px] uppercase tracking-widest ${
                        method === 'naqd' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-border bg-black/20 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <DollarSign size={16} /> Naqd
                    </button>
                    <button 
                      onClick={() => setMethod('karta')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-black text-[12px] uppercase tracking-widest ${
                        method === 'karta' ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-border bg-black/20 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <CreditCard size={16} /> Karta
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Qo'shimcha Skidka (so'm)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={discount || ''}
                      onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Chegirma summasini kiriting"
                      className="w-full bg-black/20 border-border border-2 rounded-xl py-3 px-4 text-[14px] text-white font-black outline-none focus:border-red-500 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-red-500 font-black uppercase">UZS</div>
                  </div>
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Izoh (ixtiyoriy)</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="To'lov haqida qo'shimcha ma'lumot..."
                  className="w-full bg-black/20 border-border border-2 rounded-xl p-3 text-[12px] text-white outline-none focus:border-blue-500 transition-all h-[126px] resize-none"
                />
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[#2a2d3d] bg-[#1f222d] flex items-center justify-end gap-3 shrink-0">
           <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-slate-500 text-[12px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
           >
             Bekor qilish
           </button>
           <button 
            onClick={handleConfirmPayment}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-3.5 rounded-xl text-[13px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 flex items-center gap-2 active:scale-95"
           >
             <ShieldCheck size={18} /> To'lovni tasdiqlash
           </button>
        </div>
      </div>
    </div>
  );
}
