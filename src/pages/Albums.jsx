import React from 'react';
import DataTable from '../components/common/DataTable';
import { albums } from '../data/mockData';

const AlbumsPage = () => {
  const columns = [
    { 
      key: 'coverImage', 
      label: 'Cover',
      render: (val) => <img src={val} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt="cover" />
    },
    { key: 'title', label: 'Title' },
    { key: 'artist', label: 'Artist' },
    { key: 'releaseYear', label: 'Release Year' },
    { key: 'totalSongs', label: 'Total Songs' },
  ];

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>Album Management</h1>
      <DataTable 
        title="All Albums" 
        columns={columns} 
        data={albums} 
      />
    </div>
  );
};

export default AlbumsPage;
