import React, { useState, useEffect, useCallback } from 'react';
import { Lead, Note, LeadStatus, VALID_STATUSES } from '../types';
import { api, ApiError } from '../api/client';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Send,
  Trash2,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface LeadDetailProps {
  leadId: string;
  onBack: () => void;
  onLeadDeleted: (id: string) => void;
  onToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({
  leadId,
  onBack,
  onLeadDeleted,
  onToast,
}) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newNoteContent, setNewNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingLead, setDeletingLead] = useState(false);

  const fetchLeadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [leadData, notesData] = await Promise.all([
        api.getLead(leadId),
        api.getNotes(leadId),
      ]);
      setLead(leadData);
      setNotes(notesData);
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 404) {
        setError('Lead not found. It may have been deleted.');
      } else {
        setError(err.message || 'Failed to load lead details');
      }
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLeadData();
  }, [fetchLeadData]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as LeadStatus;
    if (!lead || nextStatus === lead.status) return;

    try {
      setUpdatingStatus(true);
      const updated = await api.updateLead(lead.id, { status: nextStatus });
      setLead(updated);
      onToast(`Status updated to "${nextStatus.toUpperCase()}"`, 'success');
    } catch (err: any) {
      onToast(err.message || 'Failed to update status', 'danger');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    const content = newNoteContent.trim();
    if (!content) {
      setNoteError('Note content cannot be empty.');
      return;
    }

    try {
      setSubmittingNote(true);
      setNoteError(null);
      const createdNote = await api.addNote(lead.id, content);
      setNotes((prev) => [createdNote, ...prev]);
      setNewNoteContent('');
      onToast('Note added successfully!', 'success');
    } catch (err: any) {
      setNoteError(err.message || 'Failed to add note');
      onToast(err.message || 'Failed to add note', 'danger');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!lead) return;
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.deleteNote(lead.id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      onToast('Note removed', 'info');
    } catch (err: any) {
      onToast(err.message || 'Failed to delete note', 'danger');
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete lead "${lead.name}"? This action cannot be undone and will delete all associated notes.`
    );
    if (!confirmed) return;

    try {
      setDeletingLead(true);
      await api.deleteLead(lead.id);
      onToast(`Lead "${lead.name}" was successfully deleted.`, 'success');
      onLeadDeleted(lead.id);
    } catch (err: any) {
      onToast(err.message || 'Failed to delete lead', 'danger');
      setDeletingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <Loader2 className="spinning-icon" size={36} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Loading Lead Profile...</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
          Fetching details and interaction history
        </p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <AlertCircle size={44} style={{ margin: '0 auto 16px', color: 'var(--danger)' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--danger)' }}>Error Loading Lead</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '10px auto 20px', maxWidth: '400px' }}>
          {error || 'Unable to retrieve lead.'}
        </p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Leads
        </button>
      </div>
    );
  }

  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <button type="button" className="breadcrumb-btn" onClick={onBack} id="btn-back-to-leads">
        <ArrowLeft size={16} /> Back to Leads
      </button>

      <div className="lead-detail-grid">
        {/* Left Column: Lead Profile & Details */}
        <aside className="card lead-profile-card">
          <div className="profile-header">
            <div className="lead-avatar avatar-large">{initials}</div>
            <div className="profile-title-area">
              <h2 className="lead-title" id="lead-detail-name">{lead.name}</h2>
              <div className="profile-badge-row">
                <span className={`status-badge status-${lead.status}`} id="lead-detail-badge">
                  <span className="badge-dot" />
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </span>
                <span className="lead-id-tag">
                  ID: <code>{lead.id}</code>
                </span>
              </div>
            </div>
          </div>

          <div className="quick-status-section">
            <label htmlFor="lead-status-select" className="section-micro-label">
              Status Pipeline
            </label>
            <select
              id="lead-status-select"
              className="form-select status-select"
              value={lead.status}
              onChange={handleStatusChange}
              disabled={updatingStatus}
            >
              {VALID_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="divider" />

          <h3 className="detail-section-title">Contact Information</h3>

          <div className="info-item">
            <div className="info-icon">
              <Mail size={16} />
            </div>
            <div className="info-content">
              <span className="info-label">Email Address</span>
              <a href={`mailto:${lead.email}`} className="info-value info-link" id="lead-detail-email">
                {lead.email}
              </a>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <Phone size={16} />
            </div>
            <div className="info-content">
              <span className="info-label">Phone Number</span>
              <a href={`tel:${lead.phone}`} className="info-value info-link" id="lead-detail-phone">
                {lead.phone}
              </a>
            </div>
          </div>

          <div className="divider" />

          <h3 className="detail-section-title">Metadata</h3>

          <div className="info-item">
            <div className="info-icon">
              <Calendar size={16} />
            </div>
            <div className="info-content">
              <span className="info-label">Created Date</span>
              <span className="info-value" id="lead-detail-created">
                {new Date(lead.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {lead.updatedAt && (
            <div className="info-item">
              <div className="info-icon">
                <Clock size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Last Updated</span>
                <span className="info-value">
                  {new Date(lead.updatedAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )}

          <div className="card-footer-actions">
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%' }}
              onClick={handleDeleteLead}
              disabled={deletingLead}
              id="btn-delete-lead-detail"
            >
              <Trash2 size={16} />
              <span>{deletingLead ? 'Deleting Lead...' : 'Delete Lead'}</span>
            </button>
          </div>
        </aside>

        {/* Right Column: Add Note & Notes Feed */}
        <section className="lead-notes-area">
          {/* Add Note Card */}
          <div className="card add-note-card">
            <div className="card-header-clean">
              <h3 className="card-title">Add Note</h3>
              <p className="card-subtitle">
                Record meeting minutes, client feedback, or next action steps for this lead.
              </p>
            </div>

            <form onSubmit={handleAddNote} id="add-note-form">
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <textarea
                  id="note-content-input"
                  className={`form-textarea ${noteError ? 'has-error' : ''}`}
                  placeholder="Write a note about this customer interaction, call summary, or follow-up items..."
                  value={newNoteContent}
                  onChange={(e) => {
                    setNewNoteContent(e.target.value);
                    if (noteError) setNoteError(null);
                  }}
                  rows={3}
                  disabled={submittingNote}
                  required
                />
                {noteError && <span className="field-error">{noteError}</span>}
              </div>

              <div className="note-form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingNote || !newNoteContent.trim()}
                  id="btn-submit-note"
                >
                  <Send size={15} />
                  <span>{submittingNote ? 'Saving Note...' : 'Add Note'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notes Feed */}
          <div className="card" style={{ padding: '24px' }}>
            <div className="card-header-clean header-with-badge" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                <h3 className="card-title">Activity & Notes</h3>
              </div>
              <span className="count-pill" id="notes-count-badge">
                {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
              </span>
            </div>

            {notes.length === 0 ? (
              <div className="empty-notes-state">
                <div className="empty-icon-sm">
                  <FileText size={22} />
                </div>
                <h4 className="empty-title-sm">No notes recorded yet</h4>
                <p className="empty-sub-sm">
                  Use the form above to add your first note for this lead.
                </p>
              </div>
            ) : (
              <div className="notes-feed" id="notes-feed-list">
                {notes.map((note) => (
                  <article key={note.id} className="note-item" id={`note-item-${note.id}`}>
                    <div className="note-header">
                      <div className="note-meta">
                        <span className="note-author-pill">Lead Note</span>
                        <span className="note-timestamp">
                          {new Date(note.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        title="Delete Note"
                        onClick={() => handleDeleteNote(note.id)}
                        id={`btn-delete-note-${note.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="note-body">{note.content}</div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};
