import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import DataTable from '../components/common/DataTable';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'playlists'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || '—',
            createdBy: d.createdBy || '—',
            totalSongs: Array.isArray(d.songs) ? d.songs.length : 0,
            imageUrl: d.imageUrl || null,
          };
        });
        setPlaylists(data);
        setLoading(false);
      },
      (err) => {
        console.error('[Firestore] playlists error:', err.message);
        setError(`Failed to load playlists: ${err.message}`);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const columns = [
    {
      key: 'imageUrl',
      label: 'Cover',
      render: (val) =>
        val ? (
          <img src={val} alt="cover" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♫</div>
        ),
    },
    { key: 'name', label: 'Playlist Name' },
    { key: 'createdBy', label: 'Created By' },
    {
      key: 'totalSongs',
      label: 'Songs',
      render: (val) => (
        <span style={{
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: 'rgba(99,102,241,0.1)',
          color: '#818cf8',
        }}>
          {val} song{val !== 1 ? 's' : ''}
        </span>
      ),
    },
  ];

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Loading playlists…</p>
    </div>
  );

  if (error) return (
    <div className="page-container"><p style={{ color: '#f87171' }}>{error}</p></div>
  );

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>Playlist Management</h1>
      <DataTable title={`All Playlists (${playlists.length})`} columns={columns} data={playlists} />
    </div>
  );
};

export default PlaylistsPage;
