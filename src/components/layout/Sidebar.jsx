import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Element3, 
  Profile2User, 
  Music, 
  Cd, 
  MusicPlaylist, 
  Card, 
  Microphone2,
  Box,
  SearchNormal1,
  Logout,
  Crown1,
} from 'iconsax-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Element3 },
    { name: 'Users', path: '/users', icon: Profile2User },
    { name: 'Songs', path: '/songs', icon: Music },
    { name: 'Albums', path: '/albums', icon: Cd },
    { name: 'Playlists', path: '/playlists', icon: MusicPlaylist },
    { name: 'Artists', path: '/artists', icon: Microphone2 },
    { name: 'Transactions', path: '/transactions', icon: Card },
    { name: 'Premium Members', path: '/premium-members', icon: Crown1 },
    { name: 'Search Queries', path: '/search-queries', icon: SearchNormal1 },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <Box size={28} variant="Bulk" />
        <span>BasalAdmin</span>
      </div>

      <nav className="nav-links" style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <item.icon size={20} color="currentColor" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile section — visible inside drawer on mobile */}
      <div className="sidebar-profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div className="profile-circle" style={{ width: '38px', height: '38px', fontSize: '0.875rem', flexShrink: 0 }}>
            {auth.currentUser?.displayName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {auth.currentUser?.displayName || 'Admin'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Superadmin</div>
          </div>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="action-btn"
          title="Logout"
          style={{ background: 'rgba(239,68,68,0.06)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.5rem', padding: '0.5rem', flexShrink: 0 }}
        >
          <Logout size={18} color="currentColor" variant="Bulk" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
