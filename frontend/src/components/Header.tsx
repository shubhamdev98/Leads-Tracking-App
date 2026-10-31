import React from 'react';
import { List } from 'lucide-react';

interface HeaderProps {
  currentView: 'list' | 'detail' | 'create';
  onNavigate: (view: 'list' | 'create') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="app-header">
      <div className="container header-container">
        <div className="brand-logo" onClick={() => onNavigate('list')} id="brand-logo-btn">
          <span className="brand-name">Leads Tracking App</span>
        </div>

        <nav className="app-nav">
          <button
            type="button"
            className={`nav-tab-btn ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => onNavigate('list')}
            id="nav-leads-list-btn"
          >
            <List size={14} />
            <span>Leads</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
