import React from 'react';
import DataTable from '../components/common/DataTable';
import { artists } from '../data/mockData';

const ArtistsPage = () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'genre', label: 'Genre' },
    { key: 'listeners', label: 'Monthly Listeners' },
    { 
      key: 'verified', 
      label: 'Status',
      render: (val) => val ? (
        <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Verified
        </span>
      ) : 'Unverified'
    },
  ];

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>Artist Management</h1>
      <DataTable 
        title="All Artists" 
        columns={columns} 
        data={artists} 
      />
    </div>
  );
};

export default ArtistsPage;
