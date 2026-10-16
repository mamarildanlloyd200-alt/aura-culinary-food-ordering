import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-neutral-900/95 border-emerald-500/40 text-emerald-200'
                : isError
                ? 'bg-neutral-900/95 border-rose-500/40 text-rose-200'
                : 'bg-neutral-900/95 border-neutral-700 text-neutral-200'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {isError && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
