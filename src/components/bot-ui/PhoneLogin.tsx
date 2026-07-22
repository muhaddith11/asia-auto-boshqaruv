'use client';

import { useState } from 'react';
import { Phone, LogIn, Loader2 } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { normalizePhone, isCompletePhone } from '@/lib/phone';

interface WorkerUser {
  id: number;
  phone: string;
  name: string;
  telegram?: string;
}

interface Props {
  onAuth: (user: WorkerUser) => void;
}

export default function PhoneLogin({ onAuth }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const norm = normalizePhone(phone);
    if (!isCompletePhone(norm)) {
      setError("Telefon raqamini to'liq kiriting (+998 XX XXX XX XX).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bot-ui/verify-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: norm }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError(data.error || 'Raqam topilmadi.');
        setLoading(false);
        return;
      }

      onAuth({
        id: data.worker.id,
        phone: norm,
        name: data.worker.ism,
        telegram: data.worker.telegram,
      });
    } catch {
      setError("Server bilan bog'lanishda xatolik.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl w-full max-w-sm">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
        <Phone className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2 text-center">Xodim kirishi</h2>
      <p className="text-gray-400 text-sm mb-6 text-center max-w-[260px]">
        Buyurtma kiritish uchun telefon raqamingizni kiriting
      </p>

      <div className="w-full mb-4">
        <PhoneInput
          value={phone}
          onChange={setPhone}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
          className="w-full bg-gray-900 border border-gray-600 rounded-xl py-4 px-4 text-white text-lg tracking-wide focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-500"
          placeholder="+998 90 123 45 67"
        />
      </div>

      {error && (
        <div className="w-full mb-4 bg-red-900/30 border border-red-500/40 rounded-xl p-3 text-red-200 text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Kirish <LogIn size={18} />
          </>
        )}
      </button>
    </div>
  );
}
