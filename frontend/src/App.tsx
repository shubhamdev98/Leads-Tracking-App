import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { LeadsList } from './components/LeadsList';
import { LeadDetail } from './components/LeadDetail';
import { CreateLeadPage } from './components/CreateLeadPage';
import { Toast, ToastMessage } from './components/Toast';
import { Lead, Stats, Pagination } from './types';
import { api } from './api/client';
import { Code, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Leads list state
  const [leads, setLeads] = useState<Lead[]>([]);
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

  // Stats state
  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    lost: 0,
  });

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      const res = await api.getLeads({
        search,
        status: statusFilter,
        page,
        limit: 10,
      });
      setLeads(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to fetch leads:', err);
      addToast(err.message || 'Failed to fetch leads', 'danger');
    }
  }, [search, statusFilter, page, addToast]);

  // Initial load & when dependencies change
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Navigation handlers
  const handleSelectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCreate = () => {
    setView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedLeadId(null);
    fetchLeads();
    fetchStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLeadCreated = (newLead: Lead) => {
    fetchStats();
    setSelectedLeadId(newLead.id);
    setView('detail');
  };

  const handleLeadDeleted = () => {
    handleBackToList();
  };

  const handleDeleteLeadFromList = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${lead.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.deleteLead(lead.id);
      addToast(`Lead "${lead.name}" was deleted.`, 'success');
      fetchLeads();
      fetchStats();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete lead', 'danger');
    }
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        currentView={view}
        onNavigate={(targetView) => {
          setView(targetView);
          if (targetView === 'list') {
            setSelectedLeadId(null);
            fetchLeads();
            fetchStats();
          }
        }}
      />

      <main className="container" style={{ padding: '32px 24px', flex: 1 }}>
        {view === 'list' && (
          <>
            <StatsCards stats={stats} />
            <LeadsList
              leads={leads}
              pagination={pagination}
              search={search}
              onSearchChange={handleSearchChange}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              onPageChange={handlePageChange}
              onSelectLead={handleSelectLead}
              onDeleteLead={handleDeleteLeadFromList}
              onNavigateCreate={handleNavigateCreate}
            />
          </>
        )}

        {view === 'detail' && selectedLeadId && (
          <LeadDetail
            leadId={selectedLeadId}
            onBack={handleBackToList}
            onLeadDeleted={handleLeadDeleted}
            onToast={addToast}
          />
        )}

        {view === 'create' && (
          <CreateLeadPage
            onBack={handleBackToList}
            onLeadCreated={handleLeadCreated}
            onToast={addToast}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="container footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="footer-brand">LeadFlow Portal</span>
            <span>&bull;</span>
            <span>Fullstack TypeScript &bull; React + Node.js Express + SQLite</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="/api/leads" target="_blank" rel="noreferrer" className="footer-api-link">
              <Code size={14} />
              <span>/api/leads</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
