import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle size={16} color="#10b981" />}
          {toast.type === 'danger' && <AlertCircle size={16} color="#ef4444" />}
          {toast.type === 'info' && <Info size={16} color="#0284c7" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
