import React, { useState, useEffect, useCallback } from 'react';
import { Lead, Note, LeadStatus, VALID_STATUSES } from '../types';
import { api, ApiError } from '../api/client';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  Loader2,
  Pencil,
} from 'lucide-react';
import { EditLeadModal } from './EditLeadModal';
import { ConfirmModal } from './ConfirmModal';

interface LeadDetailProps {
  leadId: string;
  onBack: () => void;
  onLeadDeleted: (id: string) => void;
  onLeadUpdated?: (lead: Lead) => void;
  onToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({
  leadId,
  onBack,
  onLeadDeleted,
  onLeadUpdated,
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteLeadModalOpen, setIsDeleteLeadModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState(false);

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
      onToast('Note added successfully', 'success');
    } catch (err: any) {
      setNoteError(err.message || 'Failed to add note');
      onToast(err.message || 'Failed to add note', 'danger');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleConfirmDeleteNote = async () => {
    if (!lead || !noteToDelete) return;

    try {
      setDeletingNote(true);
      await api.deleteNote(lead.id, noteToDelete.id);
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
      onToast('Note deleted', 'info');
      setNoteToDelete(null);
    } catch (err: any) {
      onToast(err.message || 'Failed to delete note', 'danger');
    } finally {
      setDeletingNote(false);
    }
  };

  const handleConfirmDeleteLead = async () => {
    if (!lead) return;

    try {
      setDeletingLead(true);
      await api.deleteLead(lead.id);
      onToast(`Lead "${lead.name}" was deleted.`, 'success');
      setIsDeleteLeadModalOpen(false);
      onLeadDeleted(lead.id);
    } catch (err: any) {
      onToast(err.message || 'Failed to delete lead', 'danger');
      setDeletingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Loader2 className="spinning-icon" size={24} style={{ margin: '0 auto 12px', color: 'var(--text-secondary)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading lead details...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 12px', color: 'var(--destructive)' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--destructive)', marginBottom: '8px' }}>
          Error Loading Lead
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          {error || 'Unable to retrieve lead.'}
        </p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Leads
        </button>
      </div>
    );
  }

  return (
    <>
      <button type="button" className="breadcrumb-btn" onClick={onBack} id="btn-back-to-leads">
        <ArrowLeft size={14} />
        <span>Back to Leads</span>
      </button>

      <div className="lead-detail-grid">
        <aside className="card lead-profile-card">
          <div className="profile-header">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
              <h2 className="lead-title" id="lead-detail-name" style={{ margin: 0 }}>{lead.name}</h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditModalOpen(true)}
                id="btn-edit-lead-header"
                title="Edit Lead Details"
                style={{ flexShrink: 0 }}
              >
                <Pencil size={12} />
                <span>Edit</span>
              </button>
            </div>
            <div className="profile-badge-row">
              <span className={`status-badge status-${lead.status}`} id="lead-detail-badge">
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </span>
              <span className="lead-id-tag">
                ID: <code>{lead.id.substring(0, 8)}</code>
              </span>
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
              <Mail size={14} />
            </div>
            <div className="info-content">
              <span className="info-label">Email</span>
              <a href={`mailto:${lead.email}`} className="info-value info-link" id="lead-detail-email">
                {lead.email}
              </a>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <Phone size={14} />
            </div>
            <div className="info-content">
              <span className="info-label">Phone</span>
              <a href={`tel:${lead.phone}`} className="info-value info-link" id="lead-detail-phone">
                {lead.phone}
              </a>
            </div>
          </div>

          <div className="divider" />

          <h3 className="detail-section-title">Metadata</h3>

          <div className="info-item">
            <div className="info-icon">
              <Calendar size={14} />
            </div>
            <div className="info-content">
              <span className="info-label">Created Date</span>
              <span className="info-value" id="lead-detail-created">
                {new Date(lead.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {lead.updatedAt && (
            <div className="info-item">
              <div className="info-icon">
                <Clock size={14} />
              </div>
              <div className="info-content">
                <span className="info-label">Last Updated</span>
                <span className="info-value">
                  {new Date(lead.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          <div className="card-footer-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => setIsEditModalOpen(true)}
              id="btn-edit-lead-profile"
            >
              <Pencil size={14} />
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%' }}
              onClick={() => setIsDeleteLeadModalOpen(true)}
              disabled={deletingLead}
              id="btn-delete-lead-detail"
            >
              <Trash2 size={14} />
              <span>{deletingLead ? 'Deleting...' : 'Delete Lead'}</span>
            </button>
          </div>
        </aside>

        <section className="lead-notes-area">
          <div className="card add-note-card">
            <div className="card-header-clean">
              <h3 className="card-title">Add Note</h3>
              <p className="card-subtitle">
                Record interaction details, meeting notes, or follow-up tasks.
              </p>
            </div>

            <form onSubmit={handleAddNote} id="add-note-form">
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <textarea
                  id="note-content-input"
                  className={`form-textarea ${noteError ? 'has-error' : ''}`}
                  placeholder="Write a note..."
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
                  <span>{submittingNote ? 'Saving...' : 'Add Note'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div className="card-header-clean header-with-badge" style={{ marginBottom: '16px' }}>
              <h3 className="card-title">Notes</h3>
              <span className="count-pill" id="notes-count-badge">
                {notes.length}
              </span>
            </div>

            {notes.length === 0 ? (
              <div className="empty-notes-state">
                <h4 className="empty-title-sm">No notes recorded yet</h4>
                <p className="empty-sub-sm">
                  Add your first note using the form above.
                </p>
              </div>
            ) : (
              <div className="notes-feed" id="notes-feed-list">
                {notes.map((note) => (
                  <article key={note.id} className="note-item" id={`note-item-${note.id}`}>
                    <div className="note-header">
                      <div className="note-meta">
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
                        onClick={() => setNoteToDelete(note)}
                        id={`btn-delete-note-${note.id}`}
                      >
                        <Trash2 size={13} />
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
      <EditLeadModal
        lead={lead}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onLeadUpdated={(updated) => {
          setLead(updated);
          if (onLeadUpdated) onLeadUpdated(updated);
        }}
        onToast={onToast}
      />

      <ConfirmModal
        isOpen={isDeleteLeadModalOpen}
        onClose={() => {
          if (!deletingLead) setIsDeleteLeadModalOpen(false);
        }}
        onConfirm={handleConfirmDeleteLead}
        title="Delete Lead"
        message="Are you sure you want to permanently delete this lead? All associated notes and information will be removed."
        itemTitle={lead?.name}
        itemSubtitle={lead ? `${lead.email} • ${lead.phone}` : undefined}
        confirmLabel="Delete Lead"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deletingLead}
        id="detail-delete-lead-modal"
      />

      <ConfirmModal
        isOpen={!!noteToDelete}
        onClose={() => {
          if (!deletingNote) setNoteToDelete(null);
        }}
        onConfirm={handleConfirmDeleteNote}
        title="Delete Note"
        message="Are you sure you want to delete this note from the activity timeline?"
        itemTitle={noteToDelete?.content}
        itemSubtitle={
          noteToDelete
            ? `Added on ${new Date(noteToDelete.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : undefined
        }
        confirmLabel="Delete Note"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deletingNote}
        id="delete-note-modal"
      />
    </>
  );
};
