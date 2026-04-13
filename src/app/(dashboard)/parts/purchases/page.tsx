'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Calendar, 
  User, 
  Package, 
  TrendingUp,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function PurchasesPage() {
  const { purchases, addPurchase } = useStore();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredPurchases = purchases.filter(p => 
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  ).reverse();

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      {/* Header */}
      <header className="h-[70px] bg-surface flex items-center justify-between px-8 shrink-0 text-white sticky top-0 z-40">
        <h2 className="text-slate-400 font-bold text-[13px] uppercase tracking-widest flex items-center gap-2">
          <ShoppingCart size={18} className="text-green-500" /> Закупки товара
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Поиск по поставщику..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[13px] focus:border-green-500 outline-none w-72 transition-all placeholder:text-slate-600"
            />
          </div>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-[13px] font-bold px-5 py-2.5 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-green-600/20">
            <Plus size={18} /> Новая закупка
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Всего закупок</div>
            <div className="text-2xl font-black text-slate-800">{purchases.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Общая стоимость</div>
            <div className="text-2xl font-black text-slate-800">
                {purchases.reduce((sum, p) => sum + p.totalCost, 0).toLocaleString()} <span className="text-sm font-bold">сум</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Пот. прибыль</div>
            <div className="text-2xl font-black text-green-600">
                {purchases.reduce((sum, p) => sum + p.potentialProfit, 0).toLocaleString()} <span className="text-sm font-bold">сум</span>
            </div>
          </div>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <ShoppingCart size={80} className="mb-4 opacity-10" />
            <p className="text-lg font-bold">Закупки не найдены</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Дата</th>
                  <th className="px-6 py-4">Кол-во товаров</th>
                  <th className="px-6 py-4">Поставщики</th>
                  <th className="px-6 py-4 text-right">Стоимость</th>
                  <th className="px-6 py-4 text-right">Пот. прибыль</th>
                  <th className="px-6 py-4 text-center">Статус</th>
                  <th className="px-6 py-4 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-black text-green-600">#{p.id}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{p.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{p.partCount} шт</td>
                    <td className="px-6 py-4 font-bold text-slate-800 uppercase">{p.supplier}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">{p.totalCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-black text-green-600 bg-green-50/30">
                      {p.potentialProfit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] px-3 py-1 bg-green-100 text-green-600 rounded-full font-black uppercase tracking-tighter">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                         <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
