import React from 'react';
import { Stats } from '../types';

interface StatsCardsProps {
  stats: Stats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card stat-total">
        <span className="stat-label">Total Leads</span>
        <span className="stat-value">{stats.total}</span>
      </div>
      <div className="stat-card stat-new">
        <span className="stat-label">New</span>
        <span className="stat-value">{stats.new}</span>
      </div>
      <div className="stat-card stat-contacted">
        <span className="stat-label">Contacted</span>
        <span className="stat-value">{stats.contacted}</span>
      </div>
      <div className="stat-card stat-qualified">
        <span className="stat-label">Qualified</span>
        <span className="stat-value">{stats.qualified}</span>
      </div>
      <div className="stat-card stat-lost">
        <span className="stat-label">Lost</span>
        <span className="stat-value">{stats.lost}</span>
      </div>
    </div>
  );
};
