import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastItem = { id: number; message: string; type: 'success' | 'error' | 'info' };

const ToastContext = createContext<{ pushToast: (message: string, type?: ToastItem['type']) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const value = useMemo(
    () => ({
      pushToast: (message: string, type: ToastItem['type'] = 'info') => {
        const id = Date.now() + Math.random();
        setItems((current) => [...current, { id, message, type }]);
        window.setTimeout(() => {
          setItems((current) => current.filter((item) => item.id !== id));
        }, 3200);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-host">
        {items.map((item) => (
          <div key={item.id} className={`toast ${item.type}`}>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
}
