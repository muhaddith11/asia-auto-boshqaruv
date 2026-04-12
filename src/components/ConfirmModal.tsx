import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "O'chirish",
  cancelText = "Bekor qilish",
  danger = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1c24] border border-[#2a2d3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        
        {/* Header Decoration */}
        <div className={`h-1.5 w-full ${danger ? 'bg-red-500' : 'bg-indigo-600'}`} />
        
        <div className="p-8">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${danger ? 'bg-red-500/10 text-red-500' : 'bg-indigo-600/10 text-indigo-600'}`}>
              {danger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="space-y-2">
              <h3 className="text-[16px] font-black text-white uppercase tracking-tight">{title}</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed font-medium">{message}</p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3.5 rounded-xl bg-surface2 hover:bg-surface3 text-slate-400 font-bold text-[13px] transition-all border border-border"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`flex-1 px-6 py-3.5 rounded-xl font-black text-[13px] uppercase tracking-widest transition-all shadow-lg active:scale-95 text-white ${
                danger ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
