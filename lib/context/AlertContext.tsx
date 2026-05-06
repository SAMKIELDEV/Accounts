"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertModal } from '@/components/ui/AlertModal';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertOptions {
  title: string;
  description: string;
  type?: AlertType;
  confirmText?: string;
  onConfirm?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertOptions | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert(options);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AnimatePresence>
        {isVisible && alert && (
          <AlertModal
            {...alert}
            onClose={hideAlert}
          />
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
