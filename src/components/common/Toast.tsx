import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-700 text-emerald-100 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-700 text-rose-100 shadow-rose-950/20'
              : 'bg-stone-900/90 border-amber-600/40 text-stone-100 shadow-stone-900/20'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-amber-400" />}
          </div>
          <div className="flex-1 text-sm">
            {toast.title && <h4 className="font-semibold text-white mb-0.5">{toast.title}</h4>}
            <p className="leading-snug text-stone-200">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 text-stone-400 hover:text-white p-1 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
