import React from 'react';
import { Users, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateModal, onNavigateHome }) => {
  return (
    <header className="app-header">
      <div className="container header-container">
        <div className="brand-logo" onClick={onNavigateHome} id="brand-logo-btn">
          <div className="logo-icon">
            <Users size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <span className="brand-name">LeadFlow</span>
            <span className="brand-tag">CRM Portal</span>
            <span className="react-badge">React.js</span>
          </div>
        </div>

        <nav className="app-nav">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onOpenCreateModal}
            id="header-create-lead-btn"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Lead</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
