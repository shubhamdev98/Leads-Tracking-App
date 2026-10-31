import React from 'react';
import { Stats } from '../types';
import { Users, AlertCircle, PhoneCall, CheckCircle, XCircle } from 'lucide-react';

interface StatsOverviewProps {
  stats: Stats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card stat-total">
        <div className="stat-icon">
          <Users size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Total Leads</span>
          <span className="stat-value">{stats.total}</span>
        </div>
      </div>

      <div className="stat-card stat-new">
        <div className="stat-icon">
          <AlertCircle size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">New</span>
          <span className="stat-value">{stats.new}</span>
        </div>
      </div>

      <div className="stat-card stat-contacted">
        <div className="stat-icon">
          <PhoneCall size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Contacted</span>
          <span className="stat-value">{stats.contacted}</span>
        </div>
      </div>

      <div className="stat-card stat-qualified">
        <div className="stat-icon">
          <CheckCircle size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Qualified</span>
          <span className="stat-value">{stats.qualified}</span>
        </div>
      </div>

      <div className="stat-card stat-lost">
        <div className="stat-icon">
          <XCircle size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Lost</span>
          <span className="stat-value">{stats.lost}</span>
        </div>
      </div>
    </div>
  );
};
