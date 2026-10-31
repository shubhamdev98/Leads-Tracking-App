import React from 'react';
import { Lead, Pagination } from '../types';
import { Search, X, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface LeadsListProps {
  leads: Lead[];
  pagination: Pagination;
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onSelectLead: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onNavigateCreate: () => void;
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
  onNavigateCreate,
}) => {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Manage and track your leads.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNavigateCreate}
            id="btn-add-lead-main"
          >
            <Plus size={15} strokeWidth={2.2} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      <div className="card filter-card">
        <div className="filter-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              id="search-input"
              className="search-input"
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
                <X size={14} />
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
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-card">
        {leads.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-title">No leads found</h3>
            <p className="empty-description">
              {search || statusFilter !== 'all'
                ? 'No leads match your current search criteria. Try modifying your search or filters.'
                : 'Get started by creating your first lead.'}
            </p>
            <div className="empty-actions">
              {(search || statusFilter !== 'all') && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onSearchChange('');
                    onStatusFilterChange('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onNavigateCreate}
                id="btn-empty-add-lead"
              >
                Add Lead
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="lead-row" id={`lead-row-${lead.id}`}>
                    <td className="lead-name-cell">
                      <span
                        className="lead-name-link"
                        onClick={() => onSelectLead(lead)}
                        id={`lead-name-${lead.id}`}
                      >
                        {lead.name}
                      </span>
                    </td>
                    <td className="lead-email-cell">
                      <a href={`mailto:${lead.email}`} className="contact-link">
                        {lead.email}
                      </a>
                    </td>
                    <td className="lead-phone-cell">
                      <a href={`tel:${lead.phone}`} className="contact-link">
                        {lead.phone}
                      </a>
                    </td>
                    <td className="lead-status-cell">
                      <span className={`status-badge status-${lead.status}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="lead-date-cell">
                      <span className="date-text">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="lead-actions-cell text-right">
                      <div className="actions-group">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
                          onClick={() => onSelectLead(lead)}
                          id={`btn-view-${lead.id}`}
                        >
                          View
                        </button>
                        {onEditLead && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
                            onClick={() => onEditLead(lead)}
                            id={`btn-edit-${lead.id}`}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete Lead"
                          onClick={() => onDeleteLead(lead)}
                          id={`btn-delete-${lead.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
                  <ChevronLeft size={14} /> Previous
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
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
