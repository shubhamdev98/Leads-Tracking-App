import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} id={`toast-${toast.id}`}>
          {toast.type === 'success' && <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />}
          {toast.type === 'danger' && <AlertCircle size={15} style={{ color: '#EF4444', flexShrink: 0 }} />}
          {toast.type === 'info' && <Info size={15} style={{ color: '#888888', flexShrink: 0 }} />}
          <span style={{ flex: 1, fontSize: '13px' }}>{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};
