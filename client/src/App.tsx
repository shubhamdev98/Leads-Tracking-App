import React, { useState, useEffect, useCallback } from 'react';
import { Lead, Stats, Pagination, LeadStatus } from './types';
import { api } from './api/client';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { LeadsList } from './components/LeadsList';
import { LeadDetail } from './components/LeadDetail';
import { LeadModal } from './components/LeadModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, new: 0, contacted: 0, qualified: 0, lost: 0 });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await api.getLeads({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: 10,
      });

      setLeads(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch leads', 'danger');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, page]);

  // Handle Create Lead
  const handleCreateLead = async (leadData: { name: string; email: string; phone: string; status: LeadStatus }) => {
    const newLead = await api.createLead(leadData);
    showToast(`Lead '${newLead.name}' created successfully!`, 'success');
    fetchStats();
    fetchLeads();
    setSelectedLead(newLead);
  };

  // Handle Edit Lead
  const handleUpdateLead = async (leadData: { name: string; email: string; phone: string; status: LeadStatus }) => {
    if (!editingLead) return;
    const updated = await api.updateLead(editingLead.id, leadData);
    showToast(`Lead '${updated.name}' updated successfully!`, 'success');
    fetchStats();
    fetchLeads();
    if (selectedLead?.id === updated.id) {
      setSelectedLead(updated);
    }
  };

  // Handle Delete Lead
  const handleDeleteLead = async (lead: Lead) => {
    if (!window.confirm(`Are you sure you want to delete lead '${lead.name}'? All associated notes will also be deleted.`)) {
      return;
    }

    try {
      await api.deleteLead(lead.id);
      showToast(`Lead '${lead.name}' deleted`, 'info');
      if (selectedLead?.id === lead.id) {
        setSelectedLead(null);
      }
      fetchStats();
      fetchLeads();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete lead', 'danger');
    }
  };

  return (
    <div className="app-wrapper">
      <Header
        onOpenCreateModal={() => {
          setEditingLead(null);
          setIsModalOpen(true);
        }}
        onNavigateHome={() => setSelectedLead(null)}
      />

      <main className="main-content">
        <div className="container">
          <StatsOverview stats={stats} />

          {selectedLead ? (
            <LeadDetail
              lead={selectedLead}
              onBack={() => {
                setSelectedLead(null);
                fetchLeads();
              }}
              onEditLead={(lead) => {
                setEditingLead(lead);
                setIsModalOpen(true);
              }}
              onDeleteLead={handleDeleteLead}
              onLeadUpdated={(updated) => {
                setSelectedLead(updated);
                fetchStats();
                fetchLeads();
              }}
              showToast={showToast}
            />
          ) : (
            <LeadsList
              leads={leads}
              pagination={pagination}
              search={search}
              onSearchChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              onPageChange={setPage}
              onSelectLead={setSelectedLead}
              onEditLead={(lead) => {
                setEditingLead(lead);
                setIsModalOpen(true);
              }}
              onDeleteLead={handleDeleteLead}
              onOpenCreateModal={() => {
                setEditingLead(null);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container footer-content">
          <div className="footer-left">
            <span className="footer-brand">LeadFlow Portal</span> &bull; Built with React.js, Express, TypeScript & SQLite
          </div>
          <div className="footer-right">
            <a href="/api/leads" target="_blank" rel="noreferrer" className="footer-api-link" title="Explore JSON API">
              <span>/api/leads</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modal for Create or Edit Lead */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }}
        onSubmit={editingLead ? handleUpdateLead : handleCreateLead}
        initialData={editingLead}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default App;
