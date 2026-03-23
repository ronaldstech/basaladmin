import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CloseCircle, SearchNormal1 } from 'iconsax-react';
import DataTable from '../components/common/DataTable';
import AddSongModal from './AddSongModal';

const SongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredSongs = songs.filter(song => 
    song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Loading songs…</p>
    </div>
  );

  if (error) return (
    <div className="page-container"><p style={{ color: '#f87171' }}>{error}</p></div>
  );

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Song Management</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage and organize your music library from one place.</p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
          <SearchNormal1 
            size={18} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
          />
          <input 
            type="text"
            placeholder="Search songs, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem 0.8rem 2.8rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              borderRadius: '0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'var(--transition)'
            }}
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            >
              <CloseCircle size={18} />
            </button>
          )}
        </div>
      </div>

      <DataTable
        title={searchQuery ? `Search Results (${filteredSongs.length})` : `All Songs (${songs.length})`}
        columns={columns}
        data={filteredSongs}
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Edit Song</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <CloseCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="song-form-grid">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label className="modal-label">Title</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Song Title"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label className="modal-label">Artist</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    placeholder="Artist Name"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                  <label className="modal-label">Album</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={formData.album}
                    onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                    placeholder="Album Name"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{ 
                  padding: '0.75rem 2rem', borderRadius: '0.75rem', border: 'none', 
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                  color: '#fff', cursor: 'pointer', fontWeight: 600
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
