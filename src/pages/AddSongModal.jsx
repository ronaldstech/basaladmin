import React, { useState, useRef, useEffect } from 'react';
import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';
import { CloseCircle, Music, Trash, Import, TickCircle } from 'iconsax-react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';

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
              createdBy: auth.currentUser?.displayName || 'Admin'
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
            createdBy: auth.currentUser?.displayName || 'Admin',
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
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '2rem'
    }}>
      <div style={{
        width: '100%', maxWidth: '900px', maxHeight: '90vh',
        background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(24px)',
        borderRadius: '1.5rem', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.3s ease-out forwards'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Add New Songs</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>Select audio files to automatically extract metadata</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <CloseCircle size={28} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {selectedSongs.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: '300px', border: '2px dashed var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '1rem', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                gap: '1rem', transition: 'border-color 0.2s',
                hover: { borderColor: '#6366f1' }
              }}
            >
              <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem', color: '#6366f1' }}>
                <Import size={40} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>Click to Browse Files</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Supports .mp3, .m4a, .wav</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedSongs.map(song => (
                <div key={song.id} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)',
                  borderRadius: '1rem', padding: '1.25rem', display: 'flex', gap: '1.5rem',
                  alignItems: 'start', position: 'relative',
                  opacity: song.status === 'done' ? 0.6 : 1
                }}>
                  {/* Song Detail Form */}
                  <div style={{ width: '100px', height: '100px', borderRadius: '0.75rem', overflow: 'hidden', flexShrink: 0, background: '#222' }}>
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                        <Music size={40} />
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TITLE</label>
                      <input 
                        type="text" value={song.title} 
                        onChange={(e) => updateSongInfo(song.id, 'title', e.target.value)}
                        style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', outline: 'none', borderRadius: '0.5rem', color: '#fff' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ARTIST</label>
                      <input 
                        type="text" value={song.artist} 
                        onChange={(e) => updateSongInfo(song.id, 'artist', e.target.value)}
                        style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', outline: 'none', borderRadius: '0.5rem', color: '#fff' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ALBUM NAME</label>
                      <input 
                        type="text" value={song.album} 
                        onChange={(e) => updateSongInfo(song.id, 'album', e.target.value)}
                        style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', outline: 'none', borderRadius: '0.5rem', color: '#fff' }}
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
                style={{
                  padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)',
                  borderRadius: '1rem', color: '#9ca3af', cursor: 'pointer', fontWeight: 600
                }}
              >
                + Add More Files
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
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
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default AddSongModal;
