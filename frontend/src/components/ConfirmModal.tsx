import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  itemTitle?: string;
  itemSubtitle?: string;
  id?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  itemTitle,
  itemSubtitle,
  id = 'confirm-dialog',
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the cancel button by default for safety on destructive actions
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      default:
        return <AlertTriangle size={18} />;
    }
  };

  const confirmBtnClass = variant === 'danger' ? 'btn btn-danger-solid' : 'btn btn-primary';

  return (
    <div
      className="modal-overlay"
      id={`${id}-overlay`}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="modal-dialog confirm-modal-dialog"
        id={id}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
      >
        <div className="modal-header">
          <div className="confirm-header-content">
            <div className={`confirm-icon-badge ${variant}`}>
              {getIcon()}
            </div>
            <div>
              <h2 className="modal-title" id={`${id}-title`}>
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isLoading}
            title="Close dialog"
            id={`${id}-close-btn`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {message && (
            <div className="confirm-modal-message" id={`${id}-desc`}>
              {message}
            </div>
          )}

          {(itemTitle || itemSubtitle) && (
            <div className="confirm-preview-box">
              {itemTitle && <div className="confirm-preview-title">{itemTitle}</div>}
              {itemSubtitle && <div className="confirm-preview-subtitle">{itemSubtitle}</div>}
            </div>
          )}

          {variant === 'danger' && (
            <div className="confirm-warning-note">
              <AlertTriangle size={13} />
              <span>This action cannot be undone.</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="modal-actions">
            <button
              ref={cancelBtnRef}
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
              id={`${id}-cancel-btn`}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={confirmBtnClass}
              onClick={onConfirm}
              disabled={isLoading}
              id={`${id}-confirm-btn`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="spinning-icon" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>{confirmLabel}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
