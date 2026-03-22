import React from 'react';
import { SearchNormal1, Notification, Logout, HambergerMenu } from 'iconsax-react';
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
        <div style={{ position: 'relative' }}>
          <SearchNormal1 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
          <input 
            type="text" 
            placeholder="Search platform..." 
            style={{ 
              paddingLeft: '44px', 
              height: '44px', 
              borderRadius: '100px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--glass-border)', 
              outline: 'none',
              color: '#fff', 
              width: '320px', 
              transition: 'all 0.3s ease',
              fontSize: '0.875rem'
            }} 
            onFocus={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.06)'; 
              e.target.style.borderColor = 'var(--primary)';
            }} 
            onBlur={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.03)'; 
              e.target.style.borderColor = 'var(--glass-border)';
            }} 
          />
        </div>
      </div>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button className="action-btn" style={{ position: 'relative', borderRadius: '50%', width: '44px', height: '44px' }}>
          <Notification size={22} color="currentColor" variant="Linear" />
          <span style={{ position: 'absolute', top: '10px', right: '12px', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--bg-dark)' }}></span>
        </button>
        <div style={{ width: '1px', height: '32px', background: 'var(--glass-border)' }}></div>
        <div className="profile-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="profile-circle" style={{ width: '40px', height: '40px' }}>
            {auth.currentUser?.displayName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{auth.currentUser?.displayName || 'Admin'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Superadmin</span>
          </div>
          <button 
            onClick={handleLogout}
            className="action-btn" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              marginLeft: '0.5rem',
              background: 'rgba(239, 68, 68, 0.05)',
              color: 'var(--danger)',
              border: '1px solid rgba(239, 68, 68, 0.1)'
            }}
            title="Logout"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
            }}
          >
            <Logout size={20} color="currentColor" variant="Bulk" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
