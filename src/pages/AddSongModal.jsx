import React, { useState, useRef, useEffect } from 'react';
import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';
import { CloseCircle, Music, Trash, Import, TickCircle } from 'iconsax-react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import ModalPortal from '../components/common/ModalPortal';

// Polyfill Buffer for music-metadata-browser
window.Buffer = Buffer;

const AddSongModal = ({ isOpen, onClose }) => {
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newSongs = [];
    for (const file of files) {
      try {
        const metadata = await mm.parseBlob(file);
        let coverUrl = null;
        if (metadata.common.picture && metadata.common.picture.length > 0) {
          const picture = metadata.common.picture[0];
          const blob = new Blob([picture.data], { type: picture.format });
          coverUrl = URL.createObjectURL(blob);
        }

        newSongs.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ""),
          artist: metadata.common.artist || 'Unknown Artist',
          album: metadata.common.album || 'Unknown Album',
          coverUrl,
          status: 'ready' // ready, uploading, done, error
        });
      } catch (err) {
        console.error('Error parsing metadata:', err);
        newSongs.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          coverUrl: null,
          status: 'ready'
        });
      }
    }
    setSelectedSongs([...selectedSongs, ...newSongs]);
  };

  const removeSong = (id) => {
    setSelectedSongs(selectedSongs.filter(s => s.id !== id));
  };

  const updateSongInfo = (id, field, value) => {
    setSelectedSongs(selectedSongs.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleUploadAndSave = async () => {
    setIsUploading(true);
    
    // The relative or absolute URL to your upload script
    const UPLOAD_ENDPOINT = 'https://unimarket-mw.com/basal/upload.php'; 

    const uploadFileToServer = async (fileOrBlob, fileName) => {
      const formData = new FormData();
      formData.append('file', fileOrBlob, fileName);

      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed on server');
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      return result.url;
    };

    try {
      for (let i = 0; i < selectedSongs.length; i++) {
        const song = selectedSongs[i];
        if (song.status === 'done' || song.status === 'duplicate') continue;
        
        setSelectedSongs(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'uploading' } : s));
        
        try {
          // 0. Check for duplicates in Firestore
          const q = query(
            collection(db, 'songs'), 
            where('title', '==', song.title),
            where('artist', '==', song.artist)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            setSelectedSongs(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'duplicate' } : s));
            continue; // Skip this song
          }

          // 1. Upload song file
          const songUrl = await uploadFileToServer(song.file, song.file.name);
          
          // 2. Upload cover image if exists
          let imageUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"; // Default
          if (song.coverUrl) {
            const blob = await fetch(song.coverUrl).then(r => r.blob());
            imageUrl = await uploadFileToServer(blob, `cover_${song.id}.jpg`);
          }

          // 3. Handle Album (Find or Create)
          let albumId = '';
          const albumQuery = query(
            collection(db, 'albums'),
            where('title', '==', song.album),
            where('artist', '==', song.artist)
          );
          const albumSnapshot = await getDocs(albumQuery);

          if (!albumSnapshot.empty) {
            albumId = albumSnapshot.docs[0].id;
          } else {
            // Create new album
            const albumDoc = await addDoc(collection(db, 'albums'), {
              title: song.album,
              artist: song.artist,
              imageUrl: imageUrl, // Use the first song's cover as album cover
              songs: [],
              createdAt: Date.now(),
              uploadedBy: 'basal',
              createdBy: 'basal',
              uploaderID: auth.currentUser?.uid || 'unknown'
            });
            albumId = albumDoc.id;
          }
          
          // 4. Save Song to Firestore
          const songDoc = await addDoc(collection(db, 'songs'), {
            title: song.title,
            artist: song.artist,
            album: albumId, // Store the album UID
            songUrl,
            imageUrl,
            uploadedBy: 'basal',
            createdBy: 'basal',
            uploaderID: auth.currentUser?.uid || 'unknown',
            creatorUid: auth.currentUser?.uid || 'unknown',
            createdAt: Date.now()
          });

          // 5. Update Album's song list (Two-way link)
          const albumRef = doc(db, 'albums', albumId);
          await updateDoc(albumRef, {
            songs: arrayUnion(songDoc.id)
          });

          setSelectedSongs(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
        } catch (songErr) {
          console.error(`Error processing song ${song.title}:`, songErr);
          setSelectedSongs(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error' } : s));
          throw songErr; // Stop batch on error? Or continue? For now, we'll stop.
        }
      }
      
      setTimeout(() => {
        onClose();
        setSelectedSongs([]);
      }, 1500);

    } catch (err) {
      console.error('Failed to upload songs:', err);
      alert('Failed to upload songs. Please check your PHP endpoint and server permissions.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '900px' }}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Add New Songs</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Select audio files to automatically extract metadata</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <CloseCircle size={28} />
            </button>
          </div>

          {/* Content */}
          <div className="modal-body">
            {selectedSongs.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="upload-dropzone"
              >
                <div className="upload-icon-wrapper">
                  <Import size={32} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>Click to Browse Files</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Supports .mp3, .m4a, .wav</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {selectedSongs.map(song => (
                  <div key={song.id} className="add-song-item" style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)',
                    borderRadius: '1rem', padding: '1.25rem', display: 'flex', gap: '1.5rem',
                    alignItems: 'start', position: 'relative',
                    opacity: song.status === 'done' ? 0.6 : 1
                  }}>
                    {/* Song Detail Form */}
                    <div className="add-song-cover" style={{ width: '100px', height: '100px', borderRadius: '0.75rem', overflow: 'hidden', flexShrink: 0, background: '#222' }}>
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                          <Music size={40} />
                        </div>
                      )}
                    </div>

                    <div className="song-form-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="modal-label">Title</label>
                        <input 
                          type="text" 
                          className="modal-input"
                          value={song.title} 
                          onChange={(e) => updateSongInfo(song.id, 'title', e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className="modal-label">Artist</label>
                        <input 
                          type="text" 
                          className="modal-input"
                          value={song.artist} 
                          onChange={(e) => updateSongInfo(song.id, 'artist', e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                        <label className="modal-label">Album Name</label>
                        <input 
                          type="text" 
                          className="modal-input"
                          value={song.album} 
                          onChange={(e) => updateSongInfo(song.id, 'album', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Status / Delete */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      {song.status === 'ready' && (
                        <button onClick={() => removeSong(song.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                          <Trash size={20} />
                        </button>
                      )}
                      {song.status === 'uploading' && <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>}
                      {song.status === 'done' && <TickCircle size={24} color="#10b981" variant="Bold" />}
                      {song.status === 'duplicate' && (
                        <div style={{ textAlign: 'center' }}>
                          <CloseCircle size={24} color="#f59e0b" variant="Bold" />
                          <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700, display: 'block' }}>EXISTS</span>
                        </div>
                      )}
                      {song.status === 'error' && <CloseCircle size={24} color="#ef4444" variant="Bold" />}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="add-more-btn"
                >
                  <Import size={20} />
                  Add More Files
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              onClick={onClose} 
              disabled={isUploading}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: isUploading ? 0.5 : 1 }}
            >
              Cancel
            </button>
            <button 
              onClick={handleUploadAndSave}
              disabled={selectedSongs.length === 0 || isUploading}
              style={{ 
                padding: '0.75rem 2rem', borderRadius: '0.75rem', border: 'none', 
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                color: '#fff', cursor: 'pointer', fontWeight: 600,
                opacity: (selectedSongs.length === 0 || isUploading) ? 0.5 : 1
              }}
            >
              {isUploading ? 'Uploading...' : `Upload & Save ${selectedSongs.length > 0 ? `(${selectedSongs.length})` : ''}`}
            </button>
          </div>

          <input 
            type="file" multiple accept="audio/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileSelect} 
          />
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </ModalPortal>
  );
};

export default AddSongModal;
