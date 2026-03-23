import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import DataTable from '../components/common/DataTable';
import { SearchNormal1, TickCircle, CloseCircle, Send } from 'iconsax-react';
import ModalPortal from '../components/common/ModalPortal';

const SearchQueriesPage = () => {
  const [queries, setQueries] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notification Modal State
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [notificationBody, setNotificationBody] = useState('your search searches are uploaded');
  const [isSending, setIsSending] = useState(false);

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

  const handleMarkFound = async (queryItem) => {
    try {
      const queryRef = doc(db, 'search_queries', queryItem.id);
      await updateDoc(queryRef, { found: true });
    } catch (err) {
      console.error('Error marking as found:', err);
      alert('Failed to update status.');
    }
  };

  const openNotifyModal = (queryItem) => {
    setSelectedQuery(queryItem);
    setNotificationBody('your search searches are uploaded');
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = async () => {
    if (!selectedQuery || !notificationBody.trim()) return;
    
    setIsSending(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        audience: [selectedQuery.uid || 'all_users'],
        body: notificationBody,
        timestamp: serverTimestamp(),
        title: "song search found",
        type: "search"
      });
      
      setIsNotifyModalOpen(false);
      setSelectedQuery(null);
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification.');
    } finally {
      setIsSending(false);
    }
  };

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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, item) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button 
            onClick={() => handleMarkFound(item)}
            disabled={item.found}
            style={{ 
              padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: 'none', 
              background: item.found ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.12)', 
              color: item.found ? 'rgba(16, 185, 129, 0.4)' : '#10b981', 
              cursor: item.found ? 'default' : 'pointer',
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em'
            }}
          >
            {item.found ? 'Found' : 'Mark Found'}
          </button>
          <button 
            onClick={() => openNotifyModal(item)}
            style={{ 
              padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: 'none', 
              background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', 
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, 
              textTransform: 'uppercase', letterSpacing: '0.02em'
            }}
          >
            Notify
          </button>
        </div>
      )
    }
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

      {/* Notification Modal */}
      {isNotifyModalOpen && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '450px' }}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Send Notification</h2>
                <button onClick={() => setIsNotifyModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <CloseCircle size={24} />
                </button>
              </div>
              
              <div className="modal-body">
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Target User: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{userMap[selectedQuery?.uid] || 'Unknown User'}</span>
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    For Search: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>"{selectedQuery?.query}"</span>
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label className="modal-label">Notification Message</label>
                  <textarea
                    className="modal-input"
                    rows="4"
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setIsNotifyModalOpen(false)}
                  disabled={isSending}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: isSending ? 0.5 : 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={isSending || !notificationBody.trim()}
                  style={{ 
                    padding: '0.75rem 2rem', borderRadius: '0.75rem', border: 'none', 
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                    color: '#fff', cursor: 'pointer', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    opacity: (isSending || !notificationBody.trim()) ? 0.5 : 1
                  }}
                >
                  {isSending ? 'Sending...' : (
                    <>
                      <Send size={18} />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default SearchQueriesPage;
