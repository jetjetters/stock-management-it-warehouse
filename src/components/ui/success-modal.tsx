'use client';

import { CheckCircle2, X } from 'lucide-react';

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export function SuccessModal({
  isOpen,
  onClose,
  title = 'Berhasil Disimpan!',
  message = 'Perubahan data telah berhasil diperbarui dan tersimpan ke dalam database.',
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center p-6 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-7 h-7 animate-bounce" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm shadow-lg shadow-emerald-600/20 transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
