'use client';

import { useState } from 'react';
import { Phone, LogIn, Loader2 } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { normalizePhone, isCompletePhone } from '@/lib/phone';
import { loginWithCode, requestLoginCode, type BotAuthUser } from '@/components/bot-ui/botClient';

interface Props {
  onAuth: (user: BotAuthUser) => void;
  hint?: string; // masalan: Telegram ichida raqam hali tasdiqlanmagan
}

// Telefon raqamini bilish yetarli emas: kirish kodi xodimning Telegram'iga boradi.
export default function PhoneLogin({ onAuth, hint }: Props) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    setError('');
    const norm = normalizePhone(phone);
    if (!isCompletePhone(norm)) {
      setError("Telefon raqamini to'liq kiriting (+998 XX XXX XX XX).");
      return;
    }

    setLoading(true);
    try {
      await requestLoginCode(norm);
      setCodeSent(true);
    } catch {
      setError("Server bilan bog'lanishda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!code.trim()) {
      setError('Telegramga kelgan kodni kiriting.');
      return;
    }

    setLoading(true);
    try {
      const norm = normalizePhone(phone);
      const data = await loginWithCode(norm, code);
      if (!data.ok) {
        setError(data.error || "Kod noto'g'ri.");
        return;
      }
      onAuth({ token: data.token, id: data.worker.id, phone: norm, name: data.worker.ism });
    } catch {
      setError("Server bilan bog'lanishda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = codeSent ? handleLogin : handleSendCode;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl w-full max-w-sm">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
        <Phone className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2 text-center">Xodim kirishi</h2>
      <p className="text-gray-400 text-sm mb-6 text-center max-w-[260px]">
        {codeSent
          ? "Raqam tizimda bo'lsa, Telegram botga kod yuborildi. Kod kelmasa, botga /start yozib raqamingizni yuboring."
          : 'Buyurtma kiritish uchun telefon raqamingizni kiriting'}
      </p>

      {hint && (
        <div className="w-full mb-4 bg-amber-900/30 border border-amber-500/40 rounded-xl p-3 text-amber-200 text-sm text-center">
          {hint}
        </div>
      )}

      <div className="w-full mb-4">
        {codeSent ? (
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Telegramga kelgan kod"
            className="w-full bg-gray-900 border border-gray-600 rounded-xl py-4 px-4 text-white text-lg tracking-widest text-center focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-500"
            placeholder="000000"
          />
        ) : (
          <PhoneInput
            value={phone}
            onChange={setPhone}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            className="w-full bg-gray-900 border border-gray-600 rounded-xl py-4 px-4 text-white text-lg tracking-wide focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-500"
            placeholder="+998 90 123 45 67"
          />
        )}
      </div>

      {error && (
        <div className="w-full mb-4 bg-red-900/30 border border-red-500/40 rounded-xl p-3 text-red-200 text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-950/40 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {codeSent ? 'Kirish' : 'Kod olish'} <LogIn size={18} />
          </>
        )}
      </button>

      {codeSent && (
        <button
          onClick={() => {
            setCodeSent(false);
            setCode('');
            setError('');
          }}
          className="mt-3 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          {"Raqamni o'zgartirish"}
        </button>
      )}
    </div>
  );
}
