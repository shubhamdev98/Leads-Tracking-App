import React from 'react';
import { Lead, LeadStatus, Pagination } from '../types';
import { Search, X, Mail, Phone, Eye, Edit2, Trash2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';

interface LeadsListProps {
  leads: Lead[];
  pagination: Pagination;
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onOpenCreateModal: () => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  pagination,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
  onSelectLead,
  onEditLead,
  onDeleteLead,
  onOpenCreateModal,
}) => {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads Management</h1>
          <p className="page-subtitle">Track, qualify, and convert customer leads with real-time updates</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={onOpenCreateModal} id="btn-add-lead-main">
            <UserPlus size={18} strokeWidth={2.5} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card filter-card">
        <div className="filter-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              id="search-input"
              className="form-input search-input"
              placeholder="Search leads by name or email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="status-tabs">
            {['all', 'new', 'contacted', 'qualified', 'lost'].map((st) => (
              <button
                key={st}
                type="button"
                className={`status-tab ${statusFilter === st ? 'active' : ''}`}
                onClick={() => onStatusFilterChange(st)}
              >
                {st !== 'all' && <span className={`tab-dot dot-${st}`} />}
                <span>{st.charAt(0).toUpperCase() + st.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="card table-card">
        {leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <UserPlus size={36} />
            </div>
            <h3 className="empty-title">No leads found</h3>
            <p className="empty-description">
              {search || statusFilter !== 'all'
                ? 'No leads match your current search criteria. Try modifying or clearing your filters.'
                : 'Get started by creating your first lead.'}
            </p>
            <div className="empty-actions">
              {(search || statusFilter !== 'all') && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    onSearchChange('');
                    onStatusFilterChange('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={onOpenCreateModal} id="btn-empty-add-lead">
                Add First Lead
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const initials = lead.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={lead.id} className="lead-row" id={`lead-row-${lead.id}`}>
                      <td className="lead-info-col">
                        <div className="lead-identity">
                          <div className="lead-avatar">{initials}</div>
                          <div>
                            <span
                              className="lead-name-link"
                              onClick={() => onSelectLead(lead)}
                              id={`lead-name-${lead.id}`}
                            >
                              {lead.name}
                            </span>
                            <span className="lead-id-sub">ID: {lead.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="lead-contact-col">
                        <div className="contact-line">
                          <Mail size={14} />
                          <a href={`mailto:${lead.email}`} className="contact-link">
                            {lead.email}
                          </a>
                        </div>
                        <div className="contact-line">
                          <Phone size={14} />
                          <a href={`tel:${lead.phone}`} className="contact-link">
                            {lead.phone}
                          </a>
                        </div>
                      </td>
                      <td className="lead-status-col">
                        <span className={`status-badge status-${lead.status}`}>
                          <span className="badge-dot" />
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td className="lead-date-col">
                        <span className="date-text">
                          {new Date(lead.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="time-sub">
                          {new Date(lead.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="lead-actions-col text-right">
                        <div className="actions-group">
                          <button
                            type="button"
                            className="btn-icon"
                            title="View Lead & Notes"
                            onClick={() => onSelectLead(lead)}
                            id={`btn-view-${lead.id}`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit Lead"
                            onClick={() => onEditLead(lead)}
                            id={`btn-edit-${lead.id}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger"
                            title="Delete Lead"
                            onClick={() => onDeleteLead(lead)}
                            id={`btn-delete-${lead.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {leads.length > 0 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              <strong>{pagination.total}</strong> leads
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => onPageChange(pagination.page - 1)}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <div className="page-pills">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                    if (
                      p === 1 ||
                      p === pagination.totalPages ||
                      (p >= pagination.page - 1 && p <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={p}
                          type="button"
                          className={`page-pill ${p === pagination.page ? 'active' : ''}`}
                          onClick={() => onPageChange(p)}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === pagination.page - 2 || p === pagination.page + 2) {
                      return (
                        <span key={p} className="page-ellipsis">
                          &hellip;
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => onPageChange(pagination.page + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
