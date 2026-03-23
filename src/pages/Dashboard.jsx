import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getCountFromServer, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Profile2User, Music, Cd, MusicPlaylist, MoneyRecive } from 'iconsax-react';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '...', icon: Profile2User, change: '' },
    { label: 'Total Songs', value: '...', icon: Music, change: '' },
    { label: 'Total Albums', value: '...', icon: Cd, change: '' },
    { label: 'Total Playlists', value: '...', icon: MusicPlaylist, change: '' },
    { label: 'Total Revenue', value: 'MK 0', icon: MoneyRecive, change: '' },
  ]);

  const [recentSongs, setRecentSongs] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // Fetch initial counts efficiently without pulling all docs
    const fetchCounts = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const songsSnap = await getCountFromServer(collection(db, 'songs'));
        const albumsSnap = await getCountFromServer(collection(db, 'albums'));
        const playlistsSnap = await getCountFromServer(collection(db, 'playlists'));

        setStats(prev => [
          { label: 'Total Users', value: usersSnap.data().count.toString(), icon: Profile2User, change: '' },
          { label: 'Total Songs', value: songsSnap.data().count.toString(), icon: Music, change: '' },
          { label: 'Total Albums', value: albumsSnap.data().count.toString(), icon: Cd, change: '' },
          { label: 'Total Playlists', value: playlistsSnap.data().count.toString(), icon: MusicPlaylist, change: '' },
          prev[4], // Keep revenue card while it loads
        ]);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    fetchCounts();

    // Revenue: sum all successful transactions
    const qRevenue = query(
      collection(db, 'transactions'),
      where('status', '==', 'success')
    );
    const unsubRevenue = onSnapshot(qRevenue, (snapshot) => {
      const total = snapshot.docs.reduce((sum, doc) => {
        const amt = parseFloat(doc.data().amount || 0);
        return sum + (isNaN(amt) ? 0 : amt);
      }, 0);
      setTotalRevenue(total);
      setStats(prev => prev.map(s =>
        s.label === 'Total Revenue'
          ? { ...s, value: `MK ${total.toLocaleString()}` }
          : s
      ));
    });

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
      unsubRevenue();
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

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="dashboard-tables" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
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
