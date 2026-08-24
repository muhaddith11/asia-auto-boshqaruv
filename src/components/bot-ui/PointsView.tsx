'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Trophy, Zap, ShieldCheck } from 'lucide-react';
import { Identity, fetchPoints, fmtTime } from './botClient';

interface Props {
  identity: Identity;
  onBack: () => void;
}

interface HistoryRow {
  id: number;
  order_id: number;
  service_nom: string | null;
  category: 'speed' | 'quality';
  points: number;
  reason: string;
  period: string;
  computed_at: string;
}

interface PointsData {
  worker: { id: number; ism: string };
  period: string;
  monthPoints: number;
  rank: number | null;
  totalWorkers: number;
  history: HistoryRow[];
}

const REASON_LABEL: Record<string, string> = {
  fast_top_quartile: 'Tez bajarildi',
  slow_bottom_quartile: 'Kechikdi',
  neutral: "O'rtacha tezlik",
  clean_no_rework: 'Sifatli ish',
  rework_detected: 'Qayta ta\'mirlash',
};

export default function PointsView({ identity, onBack }: Props) {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchPoints(identity);
        if (res.ok) setData(res);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="slide-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-400" /> Mening ballarim
      </h2>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      {!loading && !data && (
        <div className="text-gray-500 text-center py-10 text-sm bg-gray-800/50 border border-gray-700 rounded-xl">
          Ma'lumot topilmadi
        </div>
      )}

      {!loading && data && (
        <>
          {/* Shu oygi jamlanma */}
          <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/10 border border-indigo-500/30 rounded-2xl p-5 mb-5 text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">{data.period} — joriy oy</div>
            <div className={`text-4xl font-black mt-1 ${data.monthPoints > 0 ? 'text-emerald-400' : data.monthPoints < 0 ? 'text-red-400' : 'text-gray-200'}`}>
              {data.monthPoints > 0 ? '+' : ''}{data.monthPoints} ball
            </div>
            {data.rank && (
              <div className="text-sm text-gray-300 mt-1.5">
                {data.rank}-o'rin ({data.totalWorkers} xodim orasida)
              </div>
            )}
          </div>

          {/* Tarix */}
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">So'nggi hodisalar</h3>
          {data.history.length === 0 ? (
            <div className="text-gray-500 text-center py-8 text-sm bg-gray-800/50 border border-gray-700 rounded-xl">
              Hali ball tarixi yo'q
            </div>
          ) : (
            <div className="space-y-2">
              {data.history.map((h) => {
                const positive = h.points > 0;
                const zero = h.points === 0;
                return (
                  <div key={h.id} className="bg-gray-800 border border-gray-700 rounded-xl p-3.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {h.category === 'speed' ? (
                        <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{REASON_LABEL[h.reason] || h.reason}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {h.service_nom || `Buyurtma #${h.order_id}`} · {fmtTime(h.computed_at)}
                        </div>
                      </div>
                    </div>
                    <div className={`font-black text-sm shrink-0 ${zero ? 'text-gray-500' : positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {positive ? '+' : ''}{h.points}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
