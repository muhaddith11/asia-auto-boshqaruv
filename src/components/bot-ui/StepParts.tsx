'use client';
import { useState, useMemo } from 'react';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import { ArrowRight, ArrowLeft, PlusCircle, Trash2, Search } from 'lucide-react';

interface StepPartsProps {
  catalog: any;
  onNext: () => void;
  onPrev: () => void;
}

export default function StepParts({ catalog, onNext, onPrev }: StepPartsProps) {
  const store = useBotOrderStore();
  const [partName, setPartName] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState('');
  const [search, setSearch] = useState('');

  // Saytdan kiritilgan zapchastlar ro'yxati (source='site') — bot katalogidan keladi
  const sitePartsAll: { id: number; name: string; price: number; mashina: string }[] = catalog?.parts || [];

  // Qidiruv bo'yicha filtrlaymiz
  const filteredSiteParts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sitePartsAll.slice(0, 50);
    return sitePartsAll.filter(p => p.name?.toLowerCase().includes(q)).slice(0, 50);
  }, [sitePartsAll, search]);

  // Saytdagi zapchastni to'g'ridan-to'g'ri qo'shish (isCustom: false — qayta bazaga yozilmaydi)
  const handleSelectSitePart = (p: { id: number; name: string; price: number }) => {
    store.addPart({
      name: p.name,
      quantity: 1,
      price: Number(p.price) || 0,
      isCustom: false,
    });
  };

  // Qo'lda yangi zapchast qo'shish (isCustom: true — bazaga source='bot' bilan tushadi)
  const handleAddCustomPart = () => {
    if (!partName || !partPrice || partQty < 1) return;
    store.addPart({
      name: partName,
      quantity: Number(partQty),
      price: Number(partPrice),
      isCustom: true,
    });
    setPartName('');
    setPartQty(1);
    setPartPrice('');
  };

  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-xl font-semibold mb-2">Ehtiyot Qismlar (Zapchast)</h2>

      {/* Tanlangan zapchastlar ro'yxati */}
      <div className="space-y-3">
        {store.parts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Hali zapchast qo'shilmadi</p>
        ) : (
          store.parts.map((part, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center transition-all">
              <div className="flex-1">
                <h3 className="font-medium text-gray-200">{part.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span>{part.quantity} dona</span>
                  <span className="text-gray-600">•</span>
                  {/* Narx miqdorga KO'PAYTIRILMAYDI — kiritilgan narx shundayligicha */}
                  <span className="text-blue-400 font-medium">{Number(part.price).toLocaleString()} UZS</span>
                </div>
              </div>
              <button
                onClick={() => store.removePart(i)}
                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
                title="O'chirish"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Saytdagi zapchastlar ro'yxatidan tanlash */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mt-4">
        <h3 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Ro'yxatdan tanlash</h3>
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Zapchast nomini qidiring..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>

        {sitePartsAll.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-3">Saytda zapchast qo'shilmagan</p>
        ) : (
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {filteredSiteParts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectSitePart(p)}
                className="w-full flex items-center justify-between bg-gray-700/60 hover:bg-blue-600 text-gray-200 hover:text-white px-3 py-2.5 rounded-lg text-sm border border-gray-600 transition-all active:scale-[0.98] text-left"
              >
                <span className="font-medium truncate">{p.name}</span>
                <span className="text-xs text-gray-300 shrink-0 ml-2">{Number(p.price).toLocaleString()} UZS +</span>
              </button>
            ))}
            {filteredSiteParts.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-3">Topilmadi</p>
            )}
          </div>
        )}
      </div>

      {/* Qo'lda yangi zapchast qo'shish */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mt-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-orange-400" /> Qo'lda Zapchast Qo'shish
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nomi</label>
            <input
              type="text"
              placeholder="Masalan: Moy filtri"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={partName}
              onChange={(e: any) => setPartName(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Soni</label>
              <input
                type="number"
                min="1"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={partQty}
                onChange={(e: any) => setPartQty(Number(e.target.value))}
              />
            </div>
            <div className="flex-[2]">
              <label className="text-xs text-gray-400 mb-1 block">Narxi</label>
              <input
                type="number"
                placeholder="UZS"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={partPrice}
                onChange={(e: any) => setPartPrice(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleAddCustomPart}
            disabled={!partName || !partPrice || partQty < 1}
            className="w-full mt-2 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30 font-medium py-3 rounded-xl transition-all disabled:opacity-50"
          >
            + Ro'yxatga Qo'shish
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onPrev}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl transition-all active:scale-[0.98]"
        >
          Keyingi <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
