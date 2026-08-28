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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center p-6 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-7 h-7 animate-bounce" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#b90051] hover:bg-[#a00045] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#b90051]/20 transition cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
