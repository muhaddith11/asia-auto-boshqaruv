'use client';
import React from 'react';
import { BrainCircuit, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { analyzeTrends } from '@/services/predictionService';

export default function AiForecast() {
  const { buyurtmalar } = useStore();
  const analysis = analyzeTrends(buyurtmalar);

   return (
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col max-w-[360px]">
         <h3 className="text-[12px] font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
             <BrainCircuit size={16} className="text-purple-500" /> AI BASHORAT VA TAHLIL
         </h3>
      
         <div className="bg-[#1e1a2f] border border-purple-500/20 rounded-2xl p-4 mb-6 relative group overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit size={64} />
         </div>
         <div className="relative z-10">
            <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Keyingi oy uchun bashorat</div>
            {!isNaN(parseFloat(analysis.prediction.replace(/,/g, ''))) ? (
               <>
                  <div className="text-[20px] font-black text-white mb-2 leading-none">
                     {analysis.prediction} <span className="text-[11px] text-slate-500">UZS</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`text-[11px] font-black px-2 py-0.5 rounded ${analysis.growth >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {analysis.growth > 0 ? '+' : ''}{analysis.growth}%
                     </div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">O'tgan oyga nisbatan</div>
                  </div>
               </>
            ) : (
               <div className="py-2">
                  <div className="text-[15px] font-bold text-slate-300 leading-tight mb-2">
                     {analysis.prediction}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                     Bashorat yaratish uchun kamida 3 oylik ma'lumotlar talab qilinadi.
                  </p>
               </div>
            )}
         </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-border">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
               <ShieldCheck size={18} className="text-emerald-500" />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Ishonch darajasi</div>
               <div className="text-[13px] font-extrabold text-white uppercase">{analysis.confidence === 'high' ? 'YUQORI' : analysis.confidence === 'medium' ? 'O\'RTA' : 'PAST'}</div>
            </div>
         </div>
         <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-border">
            <div className={`p-2 rounded-lg ${analysis.trend === 'up' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
               <Zap size={18} className={analysis.trend === 'up' ? 'text-emerald-500' : 'text-red-500'} />
            </div>
            <div>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Trend holati</div>
               <div className={`text-[13px] font-extrabold uppercase ${analysis.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {analysis.trend === 'up' ? 'O\'SISHDA' : 'PASAYISHDA'}
               </div>
            </div>
         </div>
      </div>

         <p className="text-[10px] text-slate-600 font-medium italic mt-auto pt-6 text-center px-4 leading-relaxed">
         * Bashoratlar so'nggi ma'lumotlar tahlili asosida generatsiya qilindi.
      </p>
    </div>
  );
}
