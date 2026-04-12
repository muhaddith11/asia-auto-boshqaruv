'use client';
import { useState } from 'react';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import { ArrowRight, ArrowLeft, Plus, Check, PlusCircle, Trash2 } from 'lucide-react';

export default function StepServices({ catalog, onNext, onPrev }) {
  const store = useBotOrderStore();
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  
  const availableServices = catalog?.catalog[store.brand]?.[store.model] || [];
  
  const handleToggleStandard = (svc) => {
    const exists = store.services.findIndex(s => s.name === svc.name);
    if (exists >= 0) {
      store.removeService(exists);
    } else {
      store.addService({ name: svc.name, price: svc.price, isCustom: false });
    }
  };

  const handleAddCustom = () => {
    if (!customName || !customPrice) return;
    store.addService({ 
      name: customName, 
      price: Number(customPrice), 
      isCustom: true 
    });
    setCustomName('');
    setCustomPrice('');
  };

  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-xl font-semibold mb-2">Xizmatlar ({store.model})</h2>
      
      {/* Standard Services */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 pb-2">
        {availableServices.length === 0 && <p className="text-gray-400">Standart xizmat topilmadi</p>}
        {availableServices.map(svc => {
          const isSelected = store.services.some(s => s.name === svc.name);
          return (
            <div 
              key={svc.id || svc.name} 
              onClick={() => handleToggleStandard(svc)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${isSelected ? 'bg-blue-500 border-none' : 'border-gray-600'}`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h3 className="text-gray-200 text-sm font-medium">{svc.name}</h3>
                  <p className="text-blue-400 text-xs mt-1">{svc.price.toLocaleString()} UZS</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Custom Services */}
      {store.services.filter(s => s.isCustom).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Qo'shimcha Xizmatlar:</h3>
          <div className="space-y-2">
            {store.services.map((svc, i) => svc.isCustom && (
              <div key={i} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700">
                <div>
                  <p className="text-sm">{svc.name}</p>
                  <p className="text-xs text-blue-400">{svc.price.toLocaleString()} UZS</p>
                </div>
                <button 
                  onClick={() => store.removeService(i)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Service Adder */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-blue-400" /> Boshqa xizmat qo'shish
        </h3>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Xizmat nomi" 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Narxi (UZS)" 
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
            />
            <button 
              onClick={handleAddCustom}
              disabled={!customName || !customPrice}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              Qo'shish
            </button>
          </div>
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
          Davom etish <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
