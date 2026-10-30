import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#31966B] shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[#D95370] shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-[#9274E8] shrink-0" />
          );

        const borderBg =
          toast.type === 'success'
            ? 'bg-[#D5F5E3]/90 border-[#31966B]/30'
            : toast.type === 'error'
            ? 'bg-[#FFD6E7]/90 border-[#D95370]/30'
            : 'bg-[#E6DFFF]/90 border-[#9274E8]/30';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-soft-lg transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200 ${borderBg}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#352B48] leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] text-[#777187] mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#777187] hover:text-[#352B48] p-0.5 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
