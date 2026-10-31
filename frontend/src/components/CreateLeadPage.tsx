import React, { useState } from 'react';
import { Lead, LeadStatus, VALID_STATUSES } from '../types';
import { api, ApiError } from '../api/client';
import { ArrowLeft, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

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
        errs.email = 'Please provide a valid email address (e.g. jane@example.com).';
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

      // If an initial note was provided, save it
      if (initialNote.trim()) {
        try {
          await api.addNote(newLead.id, initialNote.trim());
        } catch (noteErr) {
          console.warn('Initial note could not be saved:', noteErr);
        }
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
        <ArrowLeft size={16} /> Back to Leads
      </button>

      <div className="card" style={{ maxWidth: '720px', margin: '0 auto', padding: '32px' }}>
        <div className="page-header" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserPlus size={26} style={{ color: 'var(--primary)' }} />
              <span>Create New Lead</span>
            </h1>
            <p className="page-subtitle">
              Add a new potential client or prospect to your pipeline.
            </p>
          </div>
        </div>

        {generalError && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="create-lead-form" noValidate>
          {/* Lead Name */}
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="lead-name-input">
              Full Name <span className="required-star">*</span>
            </label>
            <div style={{ position: 'relative' }}>
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
            </div>
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email & Phone Row */}
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

          {/* Initial Status Selection */}
          <div className="form-group">
            <label className="form-label">Initial Pipeline Status</label>
            <div className="status-selector-grid">
              {VALID_STATUSES.map((st) => (
                <div
                  key={st}
                  className={`status-radio-card ${status === st ? 'selected' : ''}`}
                  onClick={() => setStatus(st)}
                  id={`status-card-${st}`}
                >
                  <span className={`status-badge status-${st}`}>
                    <span className="badge-dot" />
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Initial Note */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label" htmlFor="lead-initial-note">
              First Interaction Note <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              id="lead-initial-note"
              className="form-textarea"
              rows={3}
              placeholder="e.g. Inquired via web contact form regarding Enterprise tier pricing..."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Form Actions */}
          <div className="modal-actions" style={{ marginTop: '30px' }}>
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
                  <Loader2 className="spinning-icon" size={16} />
                  <span>Creating Lead...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} strokeWidth={2.5} />
                  <span>Create Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
