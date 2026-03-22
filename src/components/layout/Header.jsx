import React from 'react';
import { SearchNormal1, Notification, User, Logout, HambergerMenu } from 'iconsax-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const Header = ({ toggleSidebar }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="mobile-menu-btn"
          onClick={toggleSidebar}
        >
          <HambergerMenu size={24} color="currentColor" />
        </button>
        <div className="header-search">
          <div style={{ position: 'relative' }}>
            <SearchNormal1 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search anything..." className="search-input" style={{ paddingLeft: '40px' }} />
          </div>
        </div>
      </div>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button className="action-btn">
          <Notification size={20} color="currentColor" />
        </button>
        <div className="profile-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="profile-circle">
            <User size={18} color="white" />
          </div>
          <button 
            onClick={handleLogout}
            className="action-btn" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            <Logout size={18} color="currentColor" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};


export default Header;
