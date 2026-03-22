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
} from 'iconsax-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Element3 },
    { name: 'Users', path: '/users', icon: Profile2User },
    { name: 'Songs', path: '/songs', icon: Music },
    { name: 'Albums', path: '/albums', icon: Cd },
    { name: 'Playlists', path: '/playlists', icon: MusicPlaylist },
    { name: 'Artists', path: '/artists', icon: Microphone2 },
    { name: 'Transactions', path: '/transactions', icon: Card },
    { name: 'Search Queries', path: '/search-queries', icon: SearchNormal1 },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <Box size={32} variant="Bulk" />
        <span>BasalAdmin</span>
      </div>
      <nav className="nav-links">
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
    </aside>
  );
};

export default Sidebar;
