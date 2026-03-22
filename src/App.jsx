import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/Users';
import SongsPage from './pages/Songs';
import AlbumsPage from './pages/Albums';
import PlaylistsPage from './pages/Playlists';
import TransactionsPage from './pages/Transactions';
import ArtistsPage from './pages/Artists';
import './admin.css';

function App() {
  return (
    <Router>
      <div className="admin-layout">
        <Sidebar />
        <main className="main-content">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/songs" element={<SongsPage />} />
            <Route path="/albums" element={<AlbumsPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/artists" element={<ArtistsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
