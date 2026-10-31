import React, { useState } from 'react';
import { Lead, LeadStatus, VALID_STATUSES } from '../types';
import { api, ApiError } from '../api/client';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface CreateLeadPageProps {
  onBack: () => void;
  onLeadCreated: (createdLead: Lead) => void;
  onToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export const CreateLeadPage: React.FC<CreateLeadPageProps> = ({
  onBack,
  onLeadCreated,
  onToast,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [initialNote, setInitialNote] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters long.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please provide a valid email address.';
      }
    }

    if (!phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (phone.trim().length < 6) {
      errs.phone = 'Please provide a valid phone number.';
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
      const newLead = await api.createLead({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status,
      });

      if (initialNote.trim()) {
        try {
          await api.addNote(newLead.id, initialNote.trim());
        } catch (_) {}
      }

      onToast(`Lead "${newLead.name}" created successfully!`, 'success');
      onLeadCreated(newLead);
    } catch (err: any) {
      if (err instanceof ApiError && err.details?.fields) {
        setErrors(err.details.fields);
      }
      setGeneralError(err.message || 'Failed to create lead. Please check your inputs.');
      onToast(err.message || 'Failed to create lead', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" className="breadcrumb-btn" onClick={onBack} id="btn-back-from-create">
        <ArrowLeft size={14} />
        <span>Back to Leads</span>
      </button>

      <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: '28px' }}>
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <h1 className="page-title">Create Lead</h1>
          <p className="page-subtitle">Add a new lead to your pipeline.</p>
        </div>

        {generalError && (
          <div className="alert alert-danger">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} id="create-lead-form" noValidate>
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="lead-name-input">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="lead-name-input"
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
              <label className="form-label" htmlFor="lead-email-input">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                id="lead-email-input"
                type="email"
                className="form-input"
                placeholder="e.g. jane.doe@company.com"
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
              <label className="form-label" htmlFor="lead-phone-input">
                Phone Number <span className="required-star">*</span>
              </label>
              <input
                id="lead-phone-input"
                type="tel"
                className="form-input"
                placeholder="e.g. +1 555-0199"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                disabled={submitting}
                required
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lead-status-select">
              Status
            </label>
            <select
              id="lead-status-select"
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

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label" htmlFor="lead-initial-note">
              Initial Note <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              id="lead-initial-note"
              className="form-textarea"
              rows={3}
              placeholder="Record any initial notes or details..."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
              disabled={submitting}
              id="btn-cancel-create"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="btn-submit-create-lead"
            >
              {submitting ? (
                <>
                  <Loader2 className="spinning-icon" size={14} />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Lead</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
