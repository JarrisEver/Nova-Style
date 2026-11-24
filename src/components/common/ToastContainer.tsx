import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let containerClass = 'border-zinc-200 bg-white text-zinc-900';
          let Icon = Info;
          let iconColor = 'text-zinc-700';

          if (toast.type === 'success') {
            containerClass = 'border-emerald-200 bg-white text-zinc-950';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-600';
          } else if (toast.type === 'error') {
            containerClass = 'border-red-200 bg-white text-zinc-950';
            Icon = AlertCircle;
            iconColor = 'text-red-600';
          } else if (toast.type === 'warning') {
            containerClass = 'border-amber-200 bg-white text-zinc-950';
            Icon = AlertTriangle;
            iconColor = 'text-amber-600';
          }

          return (
            <motion.div
              key={toast.id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-[0_14px_34px_-10px_rgba(9,9,11,0.2)] ${containerClass}`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-zinc-950">{toast.title}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Cerrar notificación"
                className="p-1 text-zinc-400 hover:text-zinc-800 rounded-md transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
