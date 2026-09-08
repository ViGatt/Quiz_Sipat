import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import styles from './ToastContext.module.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

const DURACAO_MS: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  error: 6000,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const proximoId = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++proximoId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), DURACAO_MS[type]);
  }, [removeToast]);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      <div className={styles.container}>
        {toasts.map(toast => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.type === 'success' && <CheckCircle2 size={20} className={styles.icon} />}
            {toast.type === 'error' && <XCircle size={20} className={styles.icon} />}
            {toast.type === 'info' && <Info size={20} className={styles.icon} />}
            <span className={styles.message}>{toast.message}</span>
            <button className={styles.closeBtn} onClick={() => removeToast(toast.id)} aria-label="Fechar aviso">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}
