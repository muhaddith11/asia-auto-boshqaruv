'use client';
import React from 'react';
import { X, Clock, User, Wrench, Package, Calendar, ChevronRight, Hash } from 'lucide-react';
import { Buyurtma, Xodim } from '@/types';
import { useStore } from '@/store/useStore';

interface HistoryModalProps {
  order: Buyurtma;
  onClose: () => void;
}

export default function HistoryModal({ order, onClose }: HistoryModalProps) {
  const { xodimlar } = useStore();

  const getWorker = (id: any) => xodimlar.find(w => Number(w.id) === Number(id));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl w-full max-w-[700px] overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1f222d] shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <Clock size={22} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-[16px] uppercase tracking-tight">Buyurtma Tarixi #{order?.id || '???'}</h3>
              <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{order?.ism || "Noma'lum"} | {order?.mashina || "Noma'lum mashina"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10">
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
          
          {/* Info Banner */}
          <div className="grid grid-cols-2 gap-5">
             <div className="bg-black/20 border border-white/5 p-5 rounded-2xl space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-black uppercase tracking-widest opacity-70">
                   <Calendar size={13} /> Ochilgan sana
                </div>
                <div className="text-[15px] text-white font-black">{order?.sana || order?.createdAt?.split('T')[0] || '—'}</div>
             </div>
             <div className="bg-black/20 border border-white/5 p-5 rounded-2xl space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-black uppercase tracking-widest opacity-70">
                   <Hash size={13} /> Buyurtma holati
                </div>
                <div className="text-[13px] text-indigo-400 font-black uppercase tracking-tight bg-indigo-500/5 px-3 py-1 rounded-lg border border-indigo-500/10 w-fit">{order?.holat || 'yaratildi'}</div>
             </div>
          </div>

          {/* Services Group */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-[12px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-5 py-1">
              <Wrench size={15} /> Bajarilgan ishlar va Mas'ul ustalar
            </div>
            <div className="space-y-4">
              {order.services?.map((s, i) => {
                const worker = getWorker(s.workerId);
                const serviceName = s.nom || s.name || "Noma'lum xizmat";
                const servicePrice = Number(s.narx || s.price || 0);
                const serviceSalary = Number(s.zarplata || 0);

                return (
                  <div key={i} className="bg-[#1e212b] border border-[#2a2d3d] p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/40 hover:bg-[#232735] transition-all shadow-sm">
                    <div className="flex items-start gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                          {worker?.ism?.[0] || '?'}
                       </div>
                       <div>
                          <p className="text-[15px] text-white font-bold mb-1">{serviceName}</p>
                          <div className="flex items-center gap-2 text-[12px] text-slate-500">
                             <User size={12} />
                             <span>Usta: <span className="text-slate-200 font-bold">{worker?.ism || "Noma'lum"} {worker?.familiya || ''}</span></span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[15px] text-white font-black">{servicePrice.toLocaleString()} <span className="text-[10px] text-slate-500 uppercase">so'm</span></p>
                       {serviceSalary > 0 && (
                         <p className="text-[11px] text-emerald-500 font-bold mt-1 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 inline-block">Maosh: {serviceSalary.toLocaleString()}</p>
                       )}
                    </div>
                  </div>
                )
              })}
              {(!order.services || order.services.length === 0) && (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl py-16 text-center shadow-inner">
                   <p className="text-[13px] text-slate-500 font-bold italic tracking-wide opacity-50 uppercase">Xizmatlar qayd etilmagan</p>
                </div>
              )}
            </div>
          </div>

          {/* Parts Group */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-[12px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-5 py-1">
              <Package size={15} /> Ishlatilgan ehtiyot qismlar
            </div>
            <div className="bg-[#1a1c24] rounded-2xl overflow-hidden border border-[#2a2d3d] shadow-2xl">
               <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-emerald-500/5">
                       <th className="px-6 py-4 text-[11px] text-slate-500 uppercase font-black tracking-widest border-b border-[#2a2d3d]">Zapchast Nomi</th>
                       <th className="px-6 py-4 text-[11px] text-slate-500 uppercase font-black tracking-widest border-b border-[#2a2d3d] text-center">Miqdor</th>
                       <th className="px-6 py-4 text-[11px] text-slate-500 uppercase font-black tracking-widest border-b border-[#2a2d3d] text-right">Summa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {order.zaps?.map((z, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5 text-[13px] text-white font-bold">{z.nom}</td>
                        <td className="px-6 py-5 text-[13px] text-slate-400 font-black text-center">
                           <span className="bg-black/40 px-3 py-1 rounded-lg border border-white/5">x{z.qty} {z.bir}</span>
                        </td>
                        <td className="px-6 py-5 text-[14px] text-emerald-400 font-black text-right">{ (z.narx * z.qty).toLocaleString() } <span className="text-[10px] text-slate-600 uppercase">sum</span></td>
                      </tr>
                    ))}
                    {(!order.zaps || order.zaps.length === 0) && (
                      <tr className="border-t border-white/5">
                        <td colSpan={3} className="px-6 py-28 text-[13px] text-slate-600 font-bold italic text-center opacity-40 uppercase tracking-widest bg-black/5">
                           Zapchastlar ishlatilmagan
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-[#2a2d3d] bg-[#1f222d] flex items-center justify-between shrink-0 shadow-2xl">
           <div className="flex flex-col gap-1">
              <span className="text-[12px] text-slate-500 font-black uppercase tracking-widest opacity-60">Jami buyurtma summasi</span>
              <span className="text-[24px] text-indigo-400 font-black tracking-tight">{(order?.final || 0).toLocaleString()} <span className="text-[12px] text-slate-600 uppercase">so'm</span></span>
           </div>
           <button 
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-4 rounded-2xl text-[14px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
           >
             Yopish
           </button>
        </div>
      </div>
    </div>
  );
}
