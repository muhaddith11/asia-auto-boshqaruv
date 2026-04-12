'use client';
import React, { useEffect, useState, useRef } from 'react';
import { formatPhone, normalizePhone, isCompletePhone } from '@/lib/phone';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (normalized: string) => void;
}

const STORAGE_KEY = 'boshqaruv_recent_phones';

export default function PhoneInput({ value, onChange, className = '', placeholder, ...rest }: Props) {
  const [internal, setInternal] = useState(() => formatPhone(value));
  const [showSug, setShowSug] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setInternal(formatPhone(value)), [value]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || '[]';
      const arr = JSON.parse(raw) as string[];
      setRecent(arr);
    } catch (err) {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setShowSug(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const norm = normalizePhone(raw);
    setInternal(formatPhone(norm));
    onChange?.(norm);
  };

  const handleFocus = () => {
    setShowSug(true);
    try { const raw = localStorage.getItem(STORAGE_KEY) || '[]'; setRecent(JSON.parse(raw)); } catch {}
  };

  const handleBlur = () => {
    // store completed numbers
    const norm = normalizePhone(internal);
    if (isCompletePhone(norm)) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY) || '[]';
        const arr = JSON.parse(raw) as string[];
        const uniq = [norm, ...arr.filter(x => x !== norm)].slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(uniq));
        setRecent(uniq);
      } catch {}
    }
    setTimeout(() => setShowSug(false), 150);
  };

  const handleSelect = (norm: string) => {
    const ok = confirm(`Bu raqamni tanlaysizmi? ${formatPhone(norm)}`);
    if (!ok) return;
    setInternal(formatPhone(norm));
    onChange?.(norm);
    setShowSug(false);
  };

  const norm = normalizePhone(internal);
  const filteredRecent = recent.filter(r => r.startsWith(norm) && r !== norm);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        {...rest}
        autoComplete="off"
        value={internal}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || '+998'}
        className={className}
      />

      {showSug && filteredRecent.length > 0 && norm.length > 4 && (
        <div className="absolute left-0 top-full mt-2 w-full bg-[#0b1220] border border-[#22252f] rounded-lg shadow-lg z-50 p-2">
          <div className="text-[11px] text-slate-400 font-black mb-2">Mos keladigan raqamlar</div>
          <div className="flex flex-col gap-2">
            {filteredRecent.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleSelect(r)}
                className="text-left px-3 py-2 rounded hover:bg-white/5 text-white font-medium"
              >
                {formatPhone(r)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
