import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getApp } from 'firebase/app';
import DataTable from '../components/common/DataTable';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Debug: log the Firebase project this app is connected to
    const app = getApp();
    console.log('[Firebase] Project ID:', app.options.projectId);
    console.log('[Firebase] Auth Domain:', app.options.authDomain);

    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        console.log('[Firestore] users snapshot size:', snapshot.size);
        snapshot.docs.forEach((doc) => console.log('[Firestore] doc:', doc.id, doc.data()));

        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          const rawCreatedAt = typeof d.createdAt === 'number' ? d.createdAt : (d.createdAt?.toMillis?.() ?? 0);
          const createdAt = rawCreatedAt
            ? new Date(rawCreatedAt).toLocaleDateString()
            : '—';
          return {
            id: doc.id,
            username: d.username || '—',
            email: d.email || '—',
            duty: d.duty || '—',
            isPremium: d.isPremium,
            status: d.status || '—',
            createdAt,
            _createdAtRaw: rawCreatedAt,
          };
        });
        data.sort((a, b) => (b._createdAtRaw || 0) - (a._createdAtRaw || 0));
        setUsers(data);
        setLoading(false);
      },
      (err) => {
        console.error('[Firestore] Error:', err.code, err.message);
        setError(`Failed to load users: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    {
      key: 'duty',
      label: 'Role',
      render: (val) => (
        <span style={{
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: val === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(99,102,241,0.1)',
          color: val === 'admin' ? '#a78bfa' : '#818cf8',
          textTransform: 'capitalize',
        }}>
          {val}
        </span>
      ),
    },
    {
      key: 'isPremium',
      label: 'Premium',
      render: (val) => (
        <span style={{
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: val ? 'rgba(234,179,8,0.15)' : 'rgba(148,163,184,0.1)',
          color: val ? '#fbbf24' : '#94a3b8',
        }}>
          {val ? '✦ Premium' : 'Free'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span style={{
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: val === 'verified' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
          color: val === 'verified' ? '#4ade80' : '#f87171',
          textTransform: 'capitalize',
        }}>
          {val.replace('_', ' ')}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Joined' },
  ];

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading users…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <p style={{ color: '#f87171' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>User Management</h1>
      <DataTable
        title={`All Users (${users.length})`}
        columns={columns}
        data={users}
      />
    </div>
  );
};

export default UsersPage;
