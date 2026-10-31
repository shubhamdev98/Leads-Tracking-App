import React from 'react';
import { Users, Plus, List } from 'lucide-react';

interface HeaderProps {
  currentView: 'list' | 'detail' | 'create';
  onNavigate: (view: 'list' | 'create') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="app-header">
      <div className="container header-container">
        <div className="brand-logo" onClick={() => onNavigate('list')} id="brand-logo-btn">
          <div className="logo-icon">
            <Users size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <span className="brand-name">LeadFlow</span>
            <span className="brand-tag">CRM Portal</span>
            <span className="react-badge">React</span>
          </div>
        </div>

        <nav className="app-nav">
          <button
            type="button"
            className={`nav-tab-btn ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => onNavigate('list')}
            id="nav-leads-list-btn"
          >
            <List size={16} />
            <span>All Leads</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('create')}
            id="nav-create-lead-btn"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Lead</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
