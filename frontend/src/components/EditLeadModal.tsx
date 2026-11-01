import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, VALID_STATUSES } from '../types';
import { api, ApiError } from '../api/client';
import { X, Loader2 } from 'lucide-react';
import { isValidPhone, hasAlphabets, isValidEmail } from '../utils/validation';

export interface EditLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: (updatedLead: Lead) => void;
  onToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
  onToast,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<LeadStatus>('new');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setName(lead.name || '');
      setEmail(lead.email || '');
      setPhone(lead.phone || '');
      setStatus(lead.status || 'new');
      setErrors({});
      setGeneralError(null);
    }
  }, [lead, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !lead) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters long.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (hasAlphabets(phone)) {
      errs.phone = 'Phone number cannot contain alphabets or letters.';
    } else if (!isValidPhone(phone)) {
      errs.phone = 'Please provide a valid phone number (7-15 digits, numbers only).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const updatedLead = await api.updateLead(lead.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status,
      });

      onToast(`Lead "${updatedLead.name}" updated successfully.`, 'success');
      onLeadUpdated(updatedLead);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError) {
        const fieldErrors = err.details?.fields || err.details;
        if (fieldErrors && typeof fieldErrors === 'object') {
          setErrors(fieldErrors);
        }
      }
      setGeneralError(err.message || 'Failed to update lead. Please check your inputs.');
      onToast(err.message || 'Failed to update lead', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      id="edit-lead-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div className="modal-dialog" id="edit-lead-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Lead Details</h2>
            <p className="modal-subtitle">Update contact details and status for this lead.</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={submitting}
            title="Close modal"
            id="btn-close-edit-modal"
          >
            <X size={16} />
          </button>
        </div>

        {generalError && (
          <div style={{ padding: '0 20px', marginTop: '16px' }}>
            <div className="alert alert-danger" id="edit-lead-error-alert">
              {generalError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} id="edit-lead-form" noValidate>
          <div className="modal-body">
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label className="form-label" htmlFor="edit-lead-name-input">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="edit-lead-name-input"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                disabled={submitting}
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="edit-lead-email-input">
                  Email Address <span className="required-star">*</span>
                </label>
                <input
                  id="edit-lead-email-input"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. jane@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  disabled={submitting}
                  required
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="edit-lead-phone-input">
                  Mobile / Phone <span className="required-star">*</span>
                </label>
                <input
                  id="edit-lead-phone-input"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPhone(val);
                    if (hasAlphabets(val)) {
                      setErrors((prev) => ({ ...prev, phone: 'Phone number cannot contain alphabets or letters.' }));
                    } else if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: '' }));
                    }
                  }}
                  disabled={submitting}
                  required
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="edit-lead-status-select">
                Pipeline Status
              </label>
              <select
                id="edit-lead-status-select"
                name="status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                disabled={submitting}
              >
                {VALID_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
              id="btn-cancel-lead-edit"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="btn-save-lead-edit"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="spinning-icon" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
