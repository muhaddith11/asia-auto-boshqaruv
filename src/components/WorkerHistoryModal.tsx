'use client';
import React from 'react';
import { X, Clock, List } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Xodim } from '@/types';

interface Props {
  worker: Xodim;
  onClose: () => void;
}

export default function WorkerHistoryModal({ worker, onClose }: Props) {
  const { maoshTarixi, buyurtmalar } = useStore();

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const history = maoshTarixi
    .filter(m => Number(m.xodimId) === Number(worker.id))
    .slice()
    .sort((a, b) => new Date(b.sana).getTime() - new Date(a.sana).getTime());

  const resolveServicesForEntry = (m: any) => {
    const services: string[] = [];
    for (const b of buyurtmalar) {
      const matched = b.services.filter((s: any) => {
        if (!s) return false;
        const sZ = s.zarplata || Math.round(((s.narx || 0) * (worker.foiz || 0)) / 100);
        return Number(s.workerId) === Number(worker.id) && (Number(sZ) === Number(m.summa)) && (b.sana === m.sana);
      });
      if (matched.length) {
        matched.forEach((s: any) => services.push(`${s.nom} (Buyurtma #${b.id})`));
      }
    }
    return services;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1724] border border-[#1f2a37] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#16202b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">{worker.ism.charAt(0).toUpperCase()}</div>
            <div>
              <div className="text-white font-bold uppercase">{worker.ism}</div>
              <div className="text-[12px] text-slate-400">Maosh tarixi</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-slate-400 text-center py-8">Maosh to'lovlari topilmadi</div>
          ) : (
            <ul className="space-y-3">
              {history.map((m) => {
                const services = resolveServicesForEntry(m);
                return (
                  <li key={m.id} className="bg-[#0b1420] border border-[#16202b] rounded-xl p-4 flex items-start gap-4">
                    <div className="text-slate-400 text-[12px] w-28">{fmtDate(m.sana)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-bold">{m.summa.toLocaleString()} UZS</div>
                        <div className="text-[12px] text-slate-400">{(m.method || '').toUpperCase()}</div>
                      </div>
                      <div className="text-[13px] text-slate-300 mt-1">{m.izoh || (services.length ? services.join(', ') : '—')}</div>
                      {services.length > 0 && (
                        <div className="mt-2 text-[12px] text-slate-400">Xizmat: {services.join(', ')}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-[#16202b] flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold">Yopish</button>
        </div>
      </div>
    </div>
  );
}
