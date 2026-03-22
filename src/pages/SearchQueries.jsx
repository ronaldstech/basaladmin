import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import DataTable from '../components/common/DataTable';
import { SearchNormal1 } from 'iconsax-react';

const SearchQueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Fetch Users mapping
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const mapping = {};
      snapshot.docs.forEach(doc => {
        mapping[doc.id] = doc.data().username || doc.data().email || 'Anonymous User';
      });
      setUserMap(mapping);
    });

    // 2. Fetch Queries
    const q = query(
      collection(db, 'search_queries'),
      orderBy('timestamp', 'desc')
    );

    const unsubQueries = onSnapshot(q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQueries(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching search queries:', err);
        setError('Failed to load search queries.');
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubQueries();
    };
  }, []);

  const columns = [
    {
      key: 'query',
      label: 'Search Term',
      render: (val) => <span style={{ fontWeight: 600 }}>"{val}"</span>
    },
    {
      key: 'found',
      label: 'Status',
      render: (val) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          background: val ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: val ? '#10b981' : '#ef4444',
          border: `1px solid ${val ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        }}>
          {val ? 'Found' : 'Miss'}
        </span>
      )
    },
    {
      key: 'uid',
      label: 'User Name',
      render: (uid) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
            {userMap[uid]?.charAt(0) || 'U'}
          </div>
          <span style={{ color: '#9ca3af' }}>{userMap[uid] || 'Unknown User'}</span>
        </div>
      )
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (val) => {
        if (!val) return '—';
        const date = val.toDate ? val.toDate() : new Date(val);
        return date.toLocaleString();
      }
    },
  ];

  if (loading) return <div className="page-container"><div className="loader">Loading Queries...</div></div>;
  if (error) return <div className="page-container" style={{ color: '#ef4444' }}>{error}</div>;

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            <SearchNormal1 size={32} color="#6366f1" variant="Bulk" />
            Search Analytics
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Monitor what your users are looking for in real-time</p>
        </div>
      </div>

      <DataTable
        title={`Recent Searches (${queries.length})`}
        columns={columns}
        data={queries}
      />
    </div>
  );
};

export default SearchQueriesPage;
