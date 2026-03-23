import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import DataTable from '../components/common/DataTable';
import { Crown1 } from 'iconsax-react';

const PremiumMembersPage = () => {
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('isPremium', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          const rawCreatedAt = typeof d.createdAt === 'number' ? d.createdAt : (d.createdAt?.toMillis?.() ?? 0);
          const createdAt = rawCreatedAt
            ? new Date(rawCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—';
            
          // If duration/expiry is not explicitly in the user doc, we show a placeholder or 'Active'
          // We'll look for 'premiumUntil' or 'plan' which might be there even if not used in Users.jsx before
          const formatDate = (val) => {
            if (!val) return null;
            const date = val.toDate ? val.toDate() : new Date(val);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          };

          return {
            id: doc.id,
            username: d.username || d.name || '—',
            email: d.email || '—',
            plan: d.plan || 'Premium Plan',
            duration: formatDate(d.premiumUntil) || 'Permanent / Active',
            status: 'Active',
            joined: createdAt,
            _raw: d
          };
        });
        setPremiumUsers(data);
        setLoading(false);
      },
      (err) => {
        console.error('[Firestore] Premium users error:', err.message);
        setError(`Failed to load premium members: ${err.message}`);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const columns = [
    {
      key: 'username',
      label: 'Member',
      render: (val, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.75rem'
          }}>
            {val?.charAt(0) || item.email?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.email}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'plan', 
      label: 'Subscription Plan',
      render: (val) => (
        <span style={{ 
          display: 'flex', alignItems: 'center', gap: '6px', 
          color: '#fbbf24', fontWeight: 600, fontSize: '0.875rem' 
        }}>
          <Crown1 size={16} variant="Bold" />
          {val}
        </span>
      )
    },
    { 
      key: 'duration', 
      label: 'Duration / Expiry',
      render: (val) => (
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{val}</span>
      )
    },
    {
      key: 'joined',
      label: 'Member Since',
      render: (val) => <span style={{ color: 'var(--text-muted)' }}>{val}</span>
    }
  ];

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="loader">Loading Premium Members...</div>
    </div>
  );

  if (error) return (
    <div className="page-container"><p style={{ color: '#f87171' }}>{error}</p></div>
  );

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Crown1 size={36} color="#fbbf24" variant="Bulk" />
          Premium Members
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage your most loyal subscribers and monitor their plan status.</p>
      </div>

      <DataTable 
        title={`Active Premium Subs (${premiumUsers.length})`} 
        columns={columns} 
        data={premiumUsers} 
      />
    </div>
  );
};

export default PremiumMembersPage;
