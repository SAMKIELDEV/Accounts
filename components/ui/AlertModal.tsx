"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertModalProps {
  title: string;
  description: string;
  type?: AlertType;
  confirmText?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

const alertStyles = {
  info: {
    icon: <Info className="w-6 h-6 text-white" />,
    borderColor: 'border-white/10',
    accentColor: 'bg-accent',
  },
  success: {
    icon: <CheckCircle2 className="w-6 h-6 text-green-400" />,
    borderColor: 'border-green-500/20',
    accentColor: 'bg-green-500',
  },
  warning: {
    icon: <AlertCircle className="w-6 h-6 text-yellow-400" />,
    borderColor: 'border-yellow-500/20',
    accentColor: 'bg-yellow-500',
  },
  error: {
    icon: <XCircle className="w-6 h-6 text-red-500" />,
    borderColor: 'border-red-500/20',
    accentColor: 'bg-red-500',
  },
};

export const AlertModal: React.FC<AlertModalProps> = ({
  title,
  description,
  type = 'info',
  confirmText = 'Got it',
  onConfirm,
  onClose,
}) => {
  const styles = alertStyles[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border ${styles.borderColor} bg-surface p-6 shadow-2xl`}
      >
        {/* Glow Effect */}
        <div className={`absolute -top-24 -left-24 h-48 w-48 rounded-full ${styles.accentColor} opacity-5 blur-[80px]`} />

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10`}>
                {styles.icon}
              </div>
              <h3 className="text-xl font-bold font-syne tracking-tight text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-text leading-relaxed font-figtree">
            {description}
          </p>

          <div className="mt-2 flex justify-end">
            <button
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 font-syne ${
                type === 'info' 
                  ? 'bg-accent text-black hover:brightness-110' 
                  : `${styles.accentColor} text-white hover:brightness-110 shadow-lg`
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
