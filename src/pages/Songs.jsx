import React from 'react';
import DataTable from '../components/common/DataTable';
import { songs } from '../data/mockData';

const SongsPage = () => {
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'artist', label: 'Artist' },
    { key: 'album', label: 'Album' },
    { key: 'duration', label: 'Duration' },
    { key: 'plays', label: 'Plays' },
    { key: 'genre', label: 'Genre' },
  ];

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>Song Management</h1>
      <DataTable 
        title="All Songs" 
        columns={columns} 
        data={songs} 
      />
    </div>
  );
};

export default SongsPage;
