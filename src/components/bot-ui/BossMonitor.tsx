'use client';
import { useMemo, useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { Car, stageMeta, fmtTime, STAGES } from './botClient';
import { BOLIMLAR, bolimMeta, normalizeBolim } from '@/lib/departments';

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
];

export default function BossMonitor({ cars, onBack }: Props) {
  const [filter, setFilter] = useState('all');
  const [bolimFilter, setBolimFilter] = useState('all');
  const [search, setSearch] = useState('');

  const shown = useMemo(() => {
    let list = filter === 'all' ? cars : cars.filter((c) => c.bosqich === filter);
    if (bolimFilter !== 'all') list = list.filter((c) => normalizeBolim(c.bolim) === bolimFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      const qDigits = q.replace(/\D/g, '');
      list = list.filter((c) => {
        const hay = `${c.mashina || ''} ${c.raqam || ''} ${c.ism || ''} ${c.qabul_xodim_nomi || ''}`.toLowerCase();
        if (hay.includes(q)) return true;
        if (qDigits && c.tel && c.tel.replace(/\D/g, '').includes(qDigits)) return true;
        return false;
      });
    }
    return list;
  }, [cars, filter, bolimFilter, search]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of cars) m[c.bosqich] = (m[c.bosqich] || 0) + 1;
    return m;
  }, [cars]);

  // Bo'lim bo'yicha son — filtr tugmalarida ko'rsatiladi.
  const bolimCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of cars) {
      const b = normalizeBolim(c.bolim);
      m[b] = (m[b] || 0) + 1;
    }
    return m;
  }, [cars]);

  return (
    <div className="space-y-4 slide-in">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      <h2 className="text-xl font-semibold">👁 Barcha mashinalar ({cars.length})</h2>

      {/* Bo'lim bo'yicha ajratish — Ustaxona / Yog' quyish */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setBolimFilter('all')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
            bolimFilter === 'all' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'
          }`}
        >
          Barcha bo'lim ({cars.length})
        </button>
        {BOLIMLAR.map((b) => {
          const active = bolimFilter === b.value;
          return (
            <button
              key={b.value}
              onClick={() => setBolimFilter(b.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
              style={
                active
                  ? { background: b.color, borderColor: b.color, color: '#fff' }
                  : { background: b.color + '18', borderColor: b.color + '55', color: b.color }
              }
            >
              {b.emoji} {b.label} ({bolimCounts[b.value] || 0})
            </button>
          );
        })}
      </div>

      {/* Bosqich bo'yicha qisqa hisob */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(STAGES).filter(([k]) => k !== 'topshirildi' && k !== 'bekor_qilindi').map(([k, v]) => (
          <span key={k} className="px-2 py-1 rounded-lg" style={{ background: v.color + '22', color: v.color }}>
            {v.emoji} {counts[k] || 0}
          </span>
        ))}
      </div>

      {/* Qidiruv — telefon / raqam / marka / mijoz / usta */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Qidirish: telefon, raqam, marka..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 pl-9 pr-9 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
            aria-label="Tozalash"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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

      {shown.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          {search.trim() ? 'Topilmadi' : "Mashina yo'q"}
        </div>
      )}

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
              {c.ism && c.ism !== 'Kunlik Mijoz' && (
                <div className="text-xs text-emerald-400">🧑 {c.ism}</div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs text-gray-400">👤 {c.qabul_xodim_nomi || '—'}</div>
                {(() => {
                  const bm = bolimMeta(c.bolim);
                  return (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: bm.color + '22', color: bm.color }}
                    >
                      {bm.emoji} {bm.label}
                    </span>
                  );
                })()}
              </div>
              {c.tel && c.tel.replace(/\D/g, '').length > 3 && (
                <div className="text-xs text-gray-400">
                  📞 <a href={`tel:${c.tel}`} className="text-blue-400 hover:underline">{c.tel}</a>
                </div>
              )}
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
