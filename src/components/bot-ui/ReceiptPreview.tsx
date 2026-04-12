'use client';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import { ArrowLeft, CheckCircle2, FileText, Check } from 'lucide-react';

interface ReceiptPreviewProps {
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReceiptPreview({ onPrev, onSubmit, isSubmitting }: ReceiptPreviewProps) {
  const store = useBotOrderStore();
  
  const totalServices = store.services.reduce((sum, s) => sum + Number(s.price), 0);
  const totalParts = store.parts.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);
  const totalAmount = store.getTotalAmount();

  return (
    <div className="space-y-6 slide-in pb-20">
      <div className="flex items-center gap-3 text-xl font-semibold mb-6 border-b border-gray-800 pb-4">
        <FileText className="w-6 h-6 text-blue-400" />
        <h2>Chekni Ko'zdan Kechirish</h2>
      </div>

      {/* Car Info */}
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 p-full bg-gradient-to-b from-blue-400 to-purple-500 h-full"></div>
        <h3 className="text-gray-400 text-sm mb-3 font-medium uppercase tracking-wider">Avtomobil</h3>
        <div className="grid grid-cols-2 gap-4 gap-y-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Rusum</p>
            <p className="font-semibold text-white text-base">{store.brand} {store.model}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Davlat Raqami</p>
            <p className="font-semibold text-white text-base uppercase bg-gray-900 border border-gray-700 px-3 py-1 rounded inline-block">
              {store.plateNumber}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 mb-1">Probeg</p>
            <p className="font-semibold text-white text-base font-mono">{Number(store.probeg).toLocaleString()} km</p>
          </div>
        </div>
      </div>

      {/* Services List */}
      {store.services.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-xl">
          <h3 className="text-gray-400 text-sm mb-4 font-medium uppercase tracking-wider">Xizmatlar</h3>
          <div className="space-y-3">
            {store.services.map((s, i) => (
              <div key={i} className="flex justify-between items-start border-b border-gray-700/50 pb-3 last:border-0 last:pb-0">
                <span className="text-gray-200 text-sm">{i + 1}. {s.name}</span>
                <span className="text-gray-300 font-mono text-sm whitespace-nowrap ml-4">
                  {Number(s.price).toLocaleString()} <span className="text-xs text-gray-500">UZS</span>
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-700">
              <span className="text-sm font-medium text-gray-400">Oraliq jami:</span>
              <span className="text-blue-400 font-mono font-bold text-sm">
                {totalServices.toLocaleString()} UZS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Parts List */}
      {store.parts.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-xl">
          <h3 className="text-gray-400 text-sm mb-4 font-medium uppercase tracking-wider">Ehtiyot Qismlar</h3>
          <div className="space-y-3">
            {store.parts.map((p, i) => (
              <div key={i} className="flex flex-col border-b border-gray-700/50 pb-3 last:border-0 last:pb-0">
                <span className="text-gray-200 text-sm mb-1">{i + 1}. {p.name}</span>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{p.quantity} dp Г— {Number(p.price).toLocaleString()}</span>
                  <span className="text-gray-300 font-mono text-sm">
                    {(Number(p.quantity) * Number(p.price)).toLocaleString()} <span className="text-xs text-gray-500">UZS</span>
                  </span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-700">
              <span className="text-sm font-medium text-gray-400">Oraliq jami:</span>
              <span className="text-orange-400 font-mono font-bold text-sm">
                {totalParts.toLocaleString()} UZS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Total Amount */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <p className="text-white/80 text-sm mb-1">Umumiy To'lov</p>
        <p className="text-3xl font-bold text-white font-mono tracking-tight glow">
          {totalAmount.toLocaleString()} <span className="text-lg text-white/70 font-sans font-normal">UZS</span>
        </p>
      </div>

      <div className="flex gap-3 pt-6">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-green-500/20 disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Yuborilmoqda...</span>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6" /> Saqlash va Jo'natish
            </>
          )}
        </button>
      </div>
    </div>
  );
}
