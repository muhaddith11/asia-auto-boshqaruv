'use client';
import { useState } from 'react';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import { ArrowRight, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';

export default function StepParts({ onNext, onPrev }) {
  const store = useBotOrderStore();
  const [partName, setPartName] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState('');

  const handleAddPart = () => {
    if (!partName || !partPrice || partQty < 1) return;
    
    store.addPart({
      name: partName,
      quantity: Number(partQty),
      price: Number(partPrice),
      isCustom: true
    });
    
    setPartName('');
    setPartQty(1);
    setPartPrice('');
  };

  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-xl font-semibold mb-2">Ehtiyot Qismlar (Zapchast)</h2>
      
      {/* List Added Parts */}
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
                  <span>Г—</span>
                  <span>{part.price.toLocaleString()} UZS</span>
                </div>
                <p className="text-blue-400 font-medium text-sm mt-1">
                  Jami: {(part.quantity * part.price).toLocaleString()} UZS
                </p>
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

      {/* Quick Select Parts */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mt-4">
        <h3 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Tezkor tanlash</h3>
        <div className="flex flex-wrap gap-2">
          {(['BYD', 'Tesla', 'Zeekr', 'Leapmotor', 'Li Auto'].includes(store.brand) 
            ? ['Salonnaya filtr', 'Antifriz (EV)', 'Pult (Batareya)']
            : ['Svecha', 'Benzin nasos', 'Pampers', 'Mushtek', 'Injektor', 'Salniy']
          ).map(name => (
            <button
              key={name}
              onClick={() => setPartName(name)}
              className="bg-gray-700 hover:bg-blue-600 text-gray-200 hover:text-white px-4 py-2 rounded-lg text-sm border border-gray-600 transition-all active:scale-95"
            >
              + {name}
            </button>
          ))}
        </div>
      </div>

      {/* Add Part Form */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mt-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-orange-400" /> Yangi Zapchast Qo'shish
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nomi</label>
            <input 
              type="text" 
              placeholder="Masalan: Moy filtri" 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={partName}
              onChange={e => setPartName(e.target.value)}
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
                onChange={e => setPartQty(e.target.value)}
              />
            </div>
            <div className="flex-[2]">
              <label className="text-xs text-gray-400 mb-1 block">Narxi (1 donasi)</label>
              <input 
                type="number" 
                placeholder="UZS" 
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={partPrice}
                onChange={e => setPartPrice(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            onClick={handleAddPart}
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
