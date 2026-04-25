'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, LogIn, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", login);
    setLoading(true);
    setError('');

    // Login logic
    if (login === 'asiaauto' && password === 'salom123') {
      document.cookie = `auth_session=active; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      console.log("Login success");
      window.location.href = '/'; // Kuchliroq o'tish usuli
    } else {
      setError('Login yoki parol noto\'g\'ri!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="/logo-full.png?v=2" 
              alt="Asia Auto Service" 
              style={{ maxWidth: '280px', height: 'auto' }}
            />
          </div>
          <p className="text-slate-500 font-medium tracking-wide">Boshqaruv tizimiga xush kelibsiz</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#151921] border border-white/5 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Login</label>
              <div className="relative flex items-center group">
                <div className="absolute left-4 z-10 pointer-events-none">
                  <User className="text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <input
                  type="text"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  style={{ paddingLeft: '60px' }}
                  className="w-full bg-[#1c212a] border border-white/5 rounded-2xl py-5 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-600"
                  placeholder="Loginni kiriting"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Parol</label>
              <div className="relative flex items-center group">
                <div className="absolute left-4 z-10 pointer-events-none">
                  <Lock className="text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '60px' }}
                  className="w-full bg-[#1c212a] border border-white/5 rounded-2xl py-5 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-600"
                  placeholder="Parolni kiriting"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Tizimga kirish <LogIn size={20} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
