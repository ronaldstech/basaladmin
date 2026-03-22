import React from 'react';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import { stats, songs, transactions } from '../data/mockData';

const Dashboard = () => {
  const songColumns = [
    { key: 'title', label: 'Song' },
    { key: 'artist', label: 'Artist' },
    { key: 'plays', label: 'Plays' },
    { key: 'genre', label: 'Genre' },
  ];

  const txColumns = [
    { key: 'user', label: 'User' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={`badge badge-${val.toLowerCase()}`}>{val}</span>
      )
    },
  ];

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 0.5rem' }}>Welcome back, Admin</h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your project today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        <DataTable 
          title="Recent Transactions" 
          columns={txColumns} 
          data={transactions} 
        />
        <DataTable 
          title="Trending Songs" 
          columns={songColumns} 
          data={songs.slice(0, 3)} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
