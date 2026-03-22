import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import DataTable from '../components/common/DataTable';
import AddSongModal from './AddSongModal';

const SongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [formData, setFormData] = useState({ title: '', artist: '', album: '' });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'songs'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || '—',
            artist: d.artist || '—',
            albumId: d.album || '—',
            createdBy: d.createdBy || '—',
            imageUrl: d.imageUrl || null,
            songUrl: d.songUrl || null,
            playCount: d.playCount || 0
          };
        });
        console.log('[Firestore] Song data with playCount:', data);
        setSongs(data);
        setLoading(false);
      },
      (err) => {
        console.error('[Firestore] songs error:', err.message);
        setError(`Failed to load songs: ${err.message}`);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleDelete = async (song) => {
    if (window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
      try {
        await deleteDoc(doc(db, 'songs', song.id));
      } catch (err) {
        console.error('Error deleting song:', err);
        alert('Failed to delete song.');
      }
    }
  };

  const handleEdit = (song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      album: song.albumId
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSong) return;
    try {
      const songRef = doc(db, 'songs', editingSong.id);
      await updateDoc(songRef, {
        title: formData.title,
        artist: formData.artist,
        album: formData.album
      });
      setIsEditModalOpen(false);
      setEditingSong(null);
    } catch (err) {
      console.error('Error updating song:', err);
      alert('Failed to update song.');
    }
  };

  const columns = [
    {
      key: 'imageUrl',
      label: 'Cover',
      render: (val) =>
        val ? (
          <img
            src={val}
            alt="cover"
            style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♪</div>
        ),
    },
    { key: 'title', label: 'Title' },
    { key: 'artist', label: 'Artist' },
    {
      key: 'playCount',
      label: 'Plays',
      render: (val) => <span style={{ fontWeight: 600, color: '#6366f1' }}>{val || 0}</span>
    },
    {
      key: 'songUrl',
      label: 'Preview',
      render: (val) => (
        <audio src={val} controls style={{ height: '30px', width: '150px' }} />
      )
    },
    { key: 'createdBy', label: 'Uploader' },
  ];

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Loading songs…</p>
    </div>
  );

  if (error) return (
    <div className="page-container"><p style={{ color: '#f87171' }}>{error}</p></div>
  );

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>Song Management</h1>
      <DataTable
        title={`All Songs (${songs.length})`}
        columns={columns}
        data={songs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => setIsAddModalOpen(true)}
      />

      <AddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Modern Edit Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card-table" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '2rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '1.25rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Edit Song</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af' }}>TITLE</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af' }}>ARTIST</label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="nav-item active"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongsPage;
