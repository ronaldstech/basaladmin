import React from 'react';
import { useLocation } from 'react-router-dom';
import { HambergerMenu, Logout } from 'iconsax-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/songs': 'Songs',
  '/albums': 'Albums',
  '/playlists': 'Playlists',
  '/artists': 'Artists',
  '/transactions': 'Transactions',
  '/search-queries': 'Search Queries',
};

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  const handleLogout = () => signOut(auth);

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <HambergerMenu size={22} color="currentColor" />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {pageTitle}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Desktop right side — hidden on mobile (profile goes in sidebar drawer) */}
      <div className="header-actions header-desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="profile-circle" style={{ width: '38px', height: '38px', fontSize: '0.875rem' }}>
            {auth.currentUser?.displayName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{auth.currentUser?.displayName || 'Admin'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Superadmin</div>
          </div>
        </div>
        <div style={{ width: '1px', height: '28px', background: 'var(--glass-border)' }} />
        <button
          onClick={handleLogout}
          className="action-btn"
          title="Logout"
          style={{ background: 'rgba(239,68,68,0.06)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '50%', width: '38px', height: '38px' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
        >
          <Logout size={18} color="currentColor" variant="Bulk" />
        </button>
      </div>
    </header>
  );
};

export default Header;
