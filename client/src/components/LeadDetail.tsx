import React, { useState, useEffect } from 'react';
import { Lead, Note, LeadStatus, VALID_STATUSES } from '../types';
import { api } from '../api/client';
import { ArrowLeft, Mail, Phone, Calendar, Edit2, Trash2, Plus, MessageSquare, Send } from 'lucide-react';

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onLeadUpdated: (updatedLead: Lead) => void;
  showToast: (message: string, type?: 'success' | 'danger' | 'info') => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({
  lead,
  onBack,
  onEditLead,
  onDeleteLead,
  onLeadUpdated,
  showToast,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteError, setNoteError] = useState('');

  const loadNotes = async () => {
    try {
      setLoadingNotes(true);
      const data = await api.getNotes(lead.id);
      setNotes(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load notes', 'danger');
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [lead.id]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    try {
      const updated = await api.updateLead(lead.id, { status: newStatus });
      onLeadUpdated(updated);
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'danger');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) {
      setNoteError('Note content cannot be empty');
      return;
    }

    try {
      setAddingNote(true);
      setNoteError('');
      const note = await api.addNote(lead.id, newNoteContent.trim());
      setNotes((prev) => [note, ...prev]);
      setNewNoteContent('');
      showToast('Note added successfully!', 'success');
    } catch (err: any) {
      setNoteError(err.message || 'Failed to add note');
      showToast(err.message || 'Failed to add note', 'danger');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.deleteNote(lead.id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      showToast('Note deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete note', 'danger');
    }
  };

  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div>
      <button type="button" className="breadcrumb-btn" onClick={onBack} id="btn-back-to-leads">
        <ArrowLeft size={16} /> Back to Leads List
      </button>

      <div className="lead-detail-grid">
        {/* Left Column: Lead Info & Contact Card */}
        <div className="lead-profile-card card">
          <div className="profile-header">
            <div className="lead-avatar avatar-large">{initials}</div>
            <div className="profile-title-area">
              <h1 className="lead-title" id="lead-detail-name">{lead.name}</h1>
              <div className="profile-badge-row">
                <span className={`status-badge status-${lead.status}`} id="lead-detail-badge">
                  <span className="badge-dot" />
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </span>
                <span className="lead-id-tag">
                  ID: <code>{lead.id.substring(0, 8)}...</code>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Status Section */}
          <div className="quick-status-section">
            <label htmlFor="quick-status-select" className="section-micro-label">
              Update Status
            </label>
            <select
              id="quick-status-select"
              className="form-select status-select"
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
            >
              {VALID_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="divider" />

          {/* Contact Details */}
          <div className="detail-section">
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

            <div className="info-item">
              <div className="info-icon">
                <Calendar size={16} />
              </div>
              <div className="info-content">
                <span className="info-label">Created At</span>
                <span className="info-value">
                  {new Date(lead.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="card-footer-actions">
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => onEditLead(lead)}
              id="btn-edit-lead-detail"
            >
              <Edit2 size={16} />
              <span>Edit Lead Details</span>
            </button>

            <button
              type="button"
              className="btn btn-danger-outline btn-block"
              onClick={() => onDeleteLead(lead)}
              id="btn-delete-lead-detail"
            >
              <Trash2 size={16} />
              <span>Delete Lead</span>
            </button>
          </div>
        </div>

        {/* Right Column: Notes Activity Feed */}
        <div className="lead-notes-area">
          {/* Add Note Card */}
          <div className="card add-note-card">
            <div className="card-header-clean">
              <div className="header-with-badge">
                <h2 className="card-title">Lead Notes & Timeline</h2>
                <span className="count-pill">
                  {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
                </span>
              </div>
              <p className="card-subtitle">
                Keep track of conversations, follow-ups, and qualification remarks.
              </p>
            </div>

            {noteError && (
              <div className="alert alert-danger" style={{ marginBottom: '12px' }}>
                <span>{noteError}</span>
              </div>
            )}

            <form onSubmit={handleAddNote} className="add-note-form">
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <textarea
                  id="note-content-input"
                  className="form-textarea"
                  rows={3}
                  placeholder="Write a note about this lead (e.g. Discussed pricing plan, client requested demo on Friday)..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  disabled={addingNote}
                  required
                />
              </div>
              <div className="note-form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={addingNote || !newNoteContent.trim()}
                  id="btn-submit-note"
                >
                  <Send size={14} />
                  <span>{addingNote ? 'Adding...' : 'Add Note'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notes Feed */}
          <div className="notes-feed">
            {loadingNotes ? (
              <div className="card empty-notes-state">
                <p>Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="card empty-notes-state">
                <div className="empty-icon-sm">
                  <MessageSquare size={24} />
                </div>
                <h3 className="empty-title-sm">No notes recorded yet</h3>
                <p className="empty-sub-sm">
                  Document your first touchpoint or qualification summary above.
                </p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="card note-item" id={`note-item-${note.id}`}>
                  <div className="note-header">
                    <div className="note-meta">
                      <span className="note-author-pill">Staff Note</span>
                      <span className="note-timestamp">
                        {new Date(note.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-icon btn-icon-xs btn-icon-danger"
                      title="Delete note"
                      onClick={() => handleDeleteNote(note.id)}
                      id={`btn-delete-note-${note.id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="note-body">
                    <p className="note-text">{note.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
