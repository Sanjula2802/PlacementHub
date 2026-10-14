import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = usePlacement();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--success)" />;
      case 'danger':
        return <AlertCircle size={18} color="var(--danger)" />;
      default:
        return <Info size={18} color="var(--info)" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          <div style={{ display: 'flex', alignItems: 'center' }}>{getIcon(toast.type)}</div>
          <div style={{ flex: 1, fontSize: '0.84rem', fontWeight: 500 }}>{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              padding: 2
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
