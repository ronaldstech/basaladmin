import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import DataTable from '../components/common/DataTable';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          // timestamp can be a Firestore Timestamp or string
          const ts = d.timestamp
            ? (d.timestamp.toDate ? d.timestamp.toDate().toLocaleDateString() : new Date(d.timestamp).toLocaleDateString())
            : (d.created_at ? new Date(d.created_at).toLocaleDateString() : '—');

          return {
            id: doc.id,
            ref: d.charge_id || d.txRef || doc.id.substring(0, 10),
            name: d.first_name && d.last_name ? `${d.first_name} ${d.last_name}` : (d.email || '—'),
            plan: d.plan || '—',
            amount: d.amount ? `${d.currency || 'MK'} ${d.amount}` : '—',
            operator: d.operator || d.authorization?.provider || '—',
            status: d.status || '—',
            date: ts,
          };
        });
        // Sort newest first
        data.sort((a, b) => (b._ts || 0) - (a._ts || 0));
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        console.error('[Firestore] transactions error:', err.message);
        setError(`Failed to load transactions: ${err.message}`);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const columns = [
    { key: 'ref', label: 'Reference' },
    { key: 'name', label: 'Customer' },
    { key: 'plan', label: 'Plan' },
    { key: 'amount', label: 'Amount' },
    { key: 'operator', label: 'Operator' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span style={{
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: val === 'success' ? 'rgba(34,197,94,0.15)' : val === 'pending' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
          color: val === 'success' ? '#4ade80' : val === 'pending' ? '#fbbf24' : '#f87171',
          textTransform: 'capitalize',
        }}>
          {val}
        </span>
      ),
    },
    { key: 'date', label: 'Date' },
  ];

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Loading transactions…</p>
    </div>
  );

  if (error) return (
    <div className="page-container"><p style={{ color: '#f87171' }}>{error}</p></div>
  );

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.875rem', textAlign: 'left', margin: '0 0 1.5rem' }}>Transactions</h1>
      <DataTable title={`Payment History (${transactions.length})`} columns={columns} data={transactions} />
    </div>
  );
};

export default TransactionsPage;
