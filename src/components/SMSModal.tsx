'use client';
import React, { useState } from 'react';
import { X, Send, Phone, ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { normalizePhone } from '@/lib/phone';
import { Buyurtma } from '@/types';
import { sendSMS, getStatusMessage } from '@/services/smsService';

interface SMSModalProps {
  order: Buyurtma;
  onClose: () => void;
}

export default function SMSModal({ order, onClose }: SMSModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(normalizePhone(order.tel || ''));
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!phoneNumber) return alert('Telefon raqamini kiriting!');
    
    setLoading(true);
    try {
      const servicesInfo = order.services.map(s => `- ${s.nom}`).join('\n');
      const msg = `${getStatusMessage(order.holat, order.id.toString(), order.mashina)}\n\nBajarilgan ishlar:\n${servicesInfo}\n\nIsh yakunlandi. Jami: ${order.final.toLocaleString()} so'm.`;
      
      await sendSMS(phoneNumber, msg);
      alert('SMS muvaffaqiyatli yuborildi!');
      onClose();
    } catch (err) {
      alert('SMS yuborishda xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2d3d] flex items-center justify-between bg-[#1f222d]">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-500" />
            <span className="font-bold text-white text-[14px] uppercase tracking-wider">SMS Xabarnoma</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
           <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Yuboruvchi</div>
              <div className="text-[14px] text-white font-bold tabular-nums">998905708888</div>
           </div>

           <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Qabul qiluvchi (Mijoz)</label>
              <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Phone size={16} />
                 </div>
                 <PhoneInput
                  value={phoneNumber}
                  onChange={(v) => setPhoneNumber(v)}
                  placeholder="+998 00 000 00 00"
                  className="w-full bg-black/20 border-border border-2 rounded-xl py-3 pl-12 pr-4 text-[14px] text-white font-bold outline-none focus:border-emerald-500 transition-all font-mono"
                 />
              </div>
           </div>

           <div className="p-4 bg-white/5 rounded-xl space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Xabar matni</div>
              <p className="text-[12px] text-slate-300 leading-relaxed italic">
                "{order.mashina} bo'yicha ishlar yakunlandi. Jami to'lov: {order.final.toLocaleString()} so'm."
              </p>
           </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2d3d] bg-[#1f222d] flex items-center justify-end gap-3">
           <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-400 text-[12px] font-bold hover:text-white transition-colors"
           >
             Bekor qilish
           </button>
           <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl text-[12px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
           >
             {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
             Tasdiqlash
           </button>
        </div>
      </div>
    </div>
  );
}
