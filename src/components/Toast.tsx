import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400',
    error: 'bg-rose-500/10 border-rose-500/50 text-rose-400',
    warning: 'bg-amber-500/10 border-amber-500/50 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${colors[toast.type]} bg-slate-900/90`}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm text-slate-200 leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default ToastContainer;
