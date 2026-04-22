'use client';

import { useEffect, useRef } from 'react';

interface Props {
  botName: string;
  onAuth: (user: any) => void;
}

export default function TelegramLogin({ botName, onAuth }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Global callback function for Telegram
    (window as any).onTelegramAuth = (user: any) => {
      onAuth(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      delete (window as any).onTelegramAuth;
    };
  }, [botName, onAuth]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.35-.01-1.02-.2-1.52-.37-.62-.2-1.11-.31-1.07-.65.02-.18.27-.36.75-.56 2.95-1.28 4.91-2.13 5.89-2.54 2.81-1.18 3.39-1.39 3.77-1.39.08 0 .27.02.39.12.1.08.13.19.14.27 0 .06.01.13 0 .19z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2 text-center">Tizimga kirish</h2>
      <p className="text-gray-400 text-sm mb-6 text-center max-w-[250px]">
        Brauzer orqali ma'lumot yuborish uchun Telegram akkauntingizni tasdiqlang
      </p>
      <div ref={containerRef} id="telegram-login-container"></div>
    </div>
  );
}
