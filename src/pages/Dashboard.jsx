import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { Profile2User, Music, Cd, MusicPlaylist } from 'iconsax-react';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '...', icon: Profile2User, change: '' },
    { label: 'Total Songs', value: '...', icon: Music, change: '' },
    { label: 'Total Albums', value: '...', icon: Cd, change: '' },
    { label: 'Total Playlists', value: '...', icon: MusicPlaylist, change: '' },
  ]);

  const [recentSongs, setRecentSongs] = useState([]);
  const [newUsers, setNewUsers] = useState([]);

  useEffect(() => {
    // Fetch initial counts efficiently without pulling all docs
    const fetchCounts = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const songsSnap = await getCountFromServer(collection(db, 'songs'));
        const albumsSnap = await getCountFromServer(collection(db, 'albums'));
        const playlistsSnap = await getCountFromServer(collection(db, 'playlists'));

        setStats([
          { label: 'Total Users', value: usersSnap.data().count.toString(), icon: Profile2User, change: '' },
          { label: 'Total Songs', value: songsSnap.data().count.toString(), icon: Music, change: '' },
          { label: 'Total Albums', value: albumsSnap.data().count.toString(), icon: Cd, change: '' },
          { label: 'Total Playlists', value: playlistsSnap.data().count.toString(), icon: MusicPlaylist, change: '' },
        ]);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    fetchCounts();

    // Setup listeners for recent activity tables
    const qSongs = query(collection(db, 'songs'), orderBy('createdAt', 'desc'), limit(5));
    const unsubSongs = onSnapshot(qSongs, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentSongs(data);
    });

    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNewUsers(data);
    });

    return () => {
      unsubSongs();
      unsubUsers();
    };
  }, []);

  const songColumns = [
    { key: 'title', label: 'Song' },
    { key: 'artist', label: 'Artist' },
    { key: 'plays', label: 'Plays', render: (val) => val || 0 },
  ];

  const userColumns = [
    { key: 'name', label: 'Name', render: (val, item) => val || item.username || 'Anonymous' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (val) => (
      <span className={`badge ${val === 'admin' ? 'badge-success' : 'badge-info'}`}>
        {val || 'user'}
      </span>
    ) },
  ];

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time statistics and recent activities across your music platform.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <DataTable 
          title="Recently Added Songs" 
          columns={songColumns} 
          data={recentSongs} 
        />
        <DataTable 
          title="Newest Users" 
          columns={userColumns} 
          data={newUsers} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
