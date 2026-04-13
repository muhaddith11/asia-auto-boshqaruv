'use client';
import { useBotOrderStore } from '@/store/useBotOrderStore';
import { ArrowRight, CarFront, Hash, Gauge } from 'lucide-react';

interface StepCarInfoProps {
  catalog: any;
  onNext: () => void;
}

export default function StepCarInfo({ catalog, onNext }: StepCarInfoProps) {
  const store = useBotOrderStore();
  
  const brands = catalog?.brands || [];
  const models = store.brand && catalog?.catalog[store.brand] 
    ? Object.keys(catalog.catalog[store.brand]) 
    : [];

  const isComplete = store.brand && store.model && store.probeg && store.plateNumber;

  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-xl font-semibold mb-2">Avto Ma'lumotlari</h2>
      
      <div className="space-y-4">
        {/* Brand */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Brend</label>
          <div className="relative">
            <CarFront className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
            <select 
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={store.brand}
              onChange={(e: any) => store.setCarInfo({ brand: e.target.value, model: '' })}
            >
              <option value="">Tanlang...</option>
              {brands.map((b: string) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Model</label>
          <div className="relative">
            <select 
              disabled={!store.brand}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 appearance-none"
              value={store.model}
              onChange={(e: any) => store.setCarInfo({ model: e.target.value })}
            >
              <option value="">Tanlang...</option>
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Plate Number */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Davlat Raqami</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
            <input 
              type="text"
              placeholder="01 A 123 AA"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              value={store.plateNumber}
              onChange={(e: any) => store.setCarInfo({ plateNumber: e.target.value })}
            />
          </div>
        </div>

        {/* Probeg */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Probeg (km)</label>
          <div className="relative">
            <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
            <input 
              type="number"
              placeholder="150000"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={store.probeg}
              onChange={(e: any) => store.setCarInfo({ probeg: e.target.value })}
            />
          </div>
        </div>
      </div>

      <button
        disabled={!isComplete}
        onClick={onNext}
        className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        Davom etish <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
