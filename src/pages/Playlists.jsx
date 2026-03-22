import React from 'react';
import DataTable from '../components/common/DataTable';
import { playlists } from '../data/mockData';

const PlaylistsPage = () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'creator', label: 'Creator' },
    { key: 'totalSongs', label: 'Total Songs' },
    { key: 'visibility', label: 'Visibility' },
  ];

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>Playlist Management</h1>
      <DataTable 
        title="All Playlists" 
        columns={columns} 
        data={playlists} 
      />
    </div>
  );
};

export default PlaylistsPage;
