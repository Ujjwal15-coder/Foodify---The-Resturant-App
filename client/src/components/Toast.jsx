import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000, action = null) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration, action, exiting: false }]);

    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const toastApi = useMemo(() => ({
    success: (msg, action) => addToast(msg, 'success', 4000, action),
    error:   (msg, action) => addToast(msg, 'error',   4000, action),
    warning: (msg, action) => addToast(msg, 'warning', 4000, action),
    info:    (msg, action) => addToast(msg, 'info',    4000, action),
  }), [addToast]);

  const iconMap = {
    success: 'fa-check',
    error:   'fa-xmark',
    warning: 'fa-triangle-exclamation',
    info:    'fa-info',
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast ${t.type}${t.exiting ? ' toast-exit' : ''}`}
          >
            <div className="toast-icon">
              <i className={`fas ${iconMap[t.type]}`}></i>
            </div>
            <div className="toast-content">
              <strong>{t.message}</strong>
              {t.action && (
                <button
                  className="toast-action-btn"
                  onClick={() => { t.action.onClick(); removeToast(t.id); }}
                >
                  {t.action.label} <i className="fas fa-arrow-right"></i>
                </button>
              )}
            </div>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              <i className="fas fa-xmark"></i>
            </button>
            <div
              className="toast-progress"
              style={{ animationDuration: `${t.duration}ms` }}
            ></div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
