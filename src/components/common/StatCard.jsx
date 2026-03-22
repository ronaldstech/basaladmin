import React from 'react';
import { Activity } from 'iconsax-react';

const StatCard = ({ label, value, change, icon: IconComponent }) => {
  const Icon = IconComponent || Activity;
  const isPositive = change && change.startsWith('+');

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'var(--transition)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '1rem', 
          background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={24} variant="Bulk" />
        </div>
        {change && (
          <span className={`badge ${isPositive ? 'badge-success' : 'badge-danger'}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.5rem' }}>{label}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
