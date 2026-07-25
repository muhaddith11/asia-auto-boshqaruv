'use client';
import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Car, stageMeta, fmtTime, STAGES } from './botClient';

interface Props {
  cars: Car[];
  onBack: () => void;
}

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Hammasi' },
  { key: 'qabul_qilindi', label: '🟡 Qabul' },
  { key: 'tamirlanmoqda', label: '🔧 Ta\'mir' },
  { key: 'zapchast_kutilmoqda', label: '📦 Zapchast' },
  { key: 'tayyor', label: '✅ Tayyor' },
  { key: 'bekor_qilindi', label: '❌ Bekor' },
];

export default function BossMonitor({ cars, onBack }: Props) {
  const [filter, setFilter] = useState('all');

  const shown = useMemo(
    () => (filter === 'all' ? cars : cars.filter((c) => c.bosqich === filter)),
    [cars, filter]
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of cars) m[c.bosqich] = (m[c.bosqich] || 0) + 1;
    return m;
  }, [cars]);

  return (
    <div className="space-y-4 slide-in">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      <h2 className="text-xl font-semibold">👁 Barcha mashinalar ({cars.length})</h2>

      {/* Bosqich bo'yicha qisqa hisob */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(STAGES).filter(([k]) => k !== 'topshirildi').map(([k, v]) => (
          <span key={k} className="px-2 py-1 rounded-lg" style={{ background: v.color + '22', color: v.color }}>
            {v.emoji} {counts[k] || 0}
          </span>
        ))}
      </div>

      {/* Filtr */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === f.key ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 && <div className="text-gray-500 text-center py-8">Mashina yo'q</div>}

      <div className="space-y-3">
        {shown.map((c) => {
          const meta = stageMeta(c.bosqich);
          return (
            <div key={c.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold">{c.mashina} {c.raqam && <span className="text-gray-400 font-normal">· {c.raqam}</span>}</div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap" style={{ background: meta.color + '22', color: meta.color }}>
                  {meta.emoji} {meta.label}
                </span>
              </div>
              <div className="text-xs text-gray-400">👤 {c.qabul_xodim_nomi || '—'}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-300 pt-1">
                <div>🟡 Qabul: <span className="text-gray-400">{fmtTime(c.qabul_vaqti)}</span></div>
                <div>📦 Zapchast: <span className="text-gray-400">{fmtTime(c.zapchast_vaqti)}</span></div>
                <div>✅ Tayyor: <span className="text-gray-400">{fmtTime(c.tayyor_vaqti)}</span></div>
                <div>🚗 Topshirildi: <span className="text-gray-400">{fmtTime(c.topshirilgan_vaqti)}</span></div>
              </div>
              {c.zapchast_nomi && c.bosqich === 'zapchast_kutilmoqda' && (
                <div className="text-xs text-orange-300">Kutilmoqda: {c.zapchast_nomi}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
