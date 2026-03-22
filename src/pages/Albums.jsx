import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import DataTable from '../components/common/DataTable';

const AlbumsPage = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'albums'), 
      (snapshot) => {
        const albumData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort by createdAt descending
        albumData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAlbums(albumData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching albums:', err);
        setError('Failed to load albums.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleDelete = async (album) => {
    if (window.confirm(`Are you sure you want to delete "${album.title}"? This won't delete the songs associated with it.`)) {
      try {
        await deleteDoc(doc(db, 'albums', album.id));
      } catch (err) {
        console.error('Error deleting album:', err);
        alert('Failed to delete album.');
      }
    }
  };

  const columns = [
    { 
      key: 'imageUrl', 
      label: 'Cover',
      render: (val) => <img src={val || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"} style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} alt="cover" />
    },
    { key: 'title', label: 'Title' },
    { key: 'artist', label: 'Artist' },
    { 
      key: 'songs', 
      label: 'Songs',
      render: (val) => <span className="badge badge-info">{val?.length || 0} tracks</span>
    },
    { key: 'createdBy', label: 'Created By' },
    { 
      key: 'createdAt', 
      label: 'Date Added',
      render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A'
    },
  ];

  if (loading) return <div className="page-container"><div className="loader">Loading Albums...</div></div>;
  if (error) return <div className="page-container" style={{ color: '#ef4444' }}>{error}</div>;

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Album Management</h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Manage your music library and album collections</p>
        </div>
      </div>

      <DataTable 
        title={`All Albums (${albums.length})`} 
        columns={columns} 
        data={albums} 
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AlbumsPage;

