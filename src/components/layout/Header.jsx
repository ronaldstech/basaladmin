import React from 'react';
import { SearchNormal1, Notification, User } from 'iconsax-react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-search">
        <div style={{ position: 'relative' }}>
          <SearchNormal1 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search anything..." className="search-input" style={{ paddingLeft: '40px' }} />
        </div>
      </div>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button className="action-btn">
          <Notification size={20} color="currentColor" />
        </button>
        <div className="profile-circle">
          <User size={18} color="white" />
        </div>
      </div>
    </header>
  );
};

export default Header;
