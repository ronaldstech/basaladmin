import React from 'react';
import * as Icons from 'iconsax-react';

const StatCard = ({ label, value, change, icon }) => {
  const Icon = Icons[icon] || Icons.Activity;
  const isPositive = change.startsWith('+');

  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon">
          <Icon size={24} color="var(--primary)" />
        </div>
        <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {change}
        </span>
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
