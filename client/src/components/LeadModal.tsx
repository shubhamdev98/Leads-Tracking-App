import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, VALID_STATUSES } from '../types';
import { X, Check } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: { name: string; email: string; phone: string; status: LeadStatus }) => Promise<void>;
  initialData?: Lead | null;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setStatus(initialData.status);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setStatus('new');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Valid email address is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        status,
      });
      onClose();
    } catch (err: any) {
      if (err.details) {
        setErrors(err.details);
      } else {
        setErrors({ general: err.message || 'Submission failed' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(initialData);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? `Edit Lead: ${initialData?.name}` : 'Create New Lead'}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {errors.general && (
              <div className="alert alert-danger">
                <span>{errors.general}</span>
              </div>
            )}

            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="lead-name" className="form-label">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="lead-name"
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="lead-email" className="form-label">
                  Email Address <span className="required-star">*</span>
                </label>
                <input
                  id="lead-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. sarah.connor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                <label htmlFor="lead-phone" className="form-label">
                  Phone Number <span className="required-star">*</span>
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pipeline Status</label>
              <div className="status-selector-grid">
                {VALID_STATUSES.map((st) => (
                  <div
                    key={st}
                    className={`status-radio-card ${status === st ? 'selected' : ''}`}
                    onClick={() => setStatus(st)}
                  >
                    <span className={`status-badge status-${st}`}>
                      <span className="badge-dot"></span>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-actions" style={{ padding: '0 24px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} id="btn-modal-submit-lead">
              <Check size={18} strokeWidth={2.5} />
              <span>{submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
