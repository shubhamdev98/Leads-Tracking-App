import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { LeadsList } from './components/LeadsList';
import { LeadDetail } from './components/LeadDetail';
import { CreateLeadPage } from './components/CreateLeadPage';
import { EditLeadModal } from './components/EditLeadModal';
import { Toast, ToastMessage } from './components/Toast';
import { Lead, Stats, Pagination } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

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

  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    lost: 0,
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
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

      <main className="container" style={{ padding: '24px', flex: 1 }}>
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
              onEditLead={(lead) => setEditingLead(lead)}
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
            onLeadUpdated={() => {
              fetchLeads();
              fetchStats();
            }}
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

      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          isOpen={true}
          onClose={() => setEditingLead(null)}
          onLeadUpdated={() => {
            fetchLeads();
            fetchStats();
            setEditingLead(null);
          }}
          onToast={addToast}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
