import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/Users';
import SongsPage from './pages/Songs';
import AlbumsPage from './pages/Albums';
import PlaylistsPage from './pages/Playlists';
import TransactionsPage from './pages/Transactions';
import ArtistsPage from './pages/Artists';
import SearchQueriesPage from './pages/SearchQueries';
import LoginPage from './pages/LoginPage';
import './admin.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#fff'
      }}>
        <div className="loader">Loading Basal Admin...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="admin-layout">
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 95,
              backdropFilter: 'blur(4px)'
            }}
          />
        )}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="main-content">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div style={{ padding: '0 2.5rem 2.5rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/songs" element={<SongsPage />} />
              <Route path="/albums" element={<AlbumsPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/search-queries" element={<SearchQueriesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

