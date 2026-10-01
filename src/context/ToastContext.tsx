import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Toast, type ToastStatus } from '../components/atoms/Toast/Toast';

export interface ToastData {
  title: string;
  message: string;
  status: ToastStatus;
  duration?: number;
}

interface ToastContextValue {
  showToast: (data: ToastData) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toastData, setToastData] = useState<ToastData | null>(null);

  const hideToast = useCallback(() => {
    setToastData(null);
  }, []);

  const showToast = useCallback((data: ToastData) => {
    setToastData(data);
    const duration = data.duration ?? 6000;
    if (duration > 0) {
      setTimeout(() => {
        setToastData(prev => (prev === data ? null : prev));
      }, duration);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toastData &&
        createPortal(
          <Toast
            status={toastData.status}
            title={toastData.title}
            message={toastData.message}
            onClose={hideToast}
          />,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
