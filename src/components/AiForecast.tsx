'use client';
import React from 'react';
import { BrainCircuit, TrendingUp, TrendingDown, CalendarRange } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { compareMonthToDate } from '@/services/predictionService';

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

export default function AiForecast() {
  const { buyurtmalar } = useStore();
  const a = compareMonthToDate(buyurtmalar);
  const up = a.trend === 'up';

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col max-w-[360px]">
      <h3 className="text-[12px] font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <BrainCircuit size={16} className="text-purple-500" /> AI TAHLIL — OYMA-OY
      </h3>

      {/* Asosiy karta: bu oy (1–bugun) aylanmasi */}
      <div className="bg-[#1e1a2f] border border-purple-500/20 rounded-2xl p-4 mb-5 relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <CalendarRange size={64} />
        </div>
        <div className="relative z-10">
          <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">
            Bu oy (1–{a.day}-kun) aylanmasi
          </div>
          <div className="text-[20px] font-black text-white mb-2 leading-none">
            {fmt(a.current)} <span className="text-[11px] text-slate-500">so'm</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-[11px] font-black px-2 py-0.5 rounded ${up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {a.growthPct > 0 ? '+' : ''}{a.growthPct}%
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
              O'tgan oy shu davriga nisbatan
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* O'tgan oy shu davr */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-border">
          <div className="p-2 bg-slate-500/10 rounded-lg">
            <CalendarRange size={18} className="text-slate-400" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
              O'tgan oy (1–{a.day}-kun)
            </div>
            <div className="text-[13px] font-extrabold text-white">{fmt(a.previous)} so'm</div>
          </div>
        </div>

        {/* Farq */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-border">
          <div className={`p-2 rounded-lg ${up ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {up ? <TrendingUp size={18} className="text-emerald-500" /> : <TrendingDown size={18} className="text-red-500" />}
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Farq</div>
            <div className={`text-[13px] font-extrabold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
              {a.diff >= 0 ? '+' : ''}{fmt(a.diff)} so'm
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 font-medium italic mt-auto pt-6 text-center px-4 leading-relaxed">
        * Shu oyning bugungi kunigacha bo'lgan aylanma o'tgan oyning aynan shu davri bilan solishtirildi.
      </p>
    </div>
  );
}
