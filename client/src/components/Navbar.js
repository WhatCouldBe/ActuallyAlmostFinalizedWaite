// client/src/components/Navbar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import WLogo from './WLogo.svg'; // Make sure WLogo.svg exists in this folder

export default function Navbar({ onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLinkClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-hamburger" onClick={toggleSidebar}>
          {/* Added a top margin to move the SVG down a few pixels */}
          <img
            src={WLogo}
            alt="Logo"
            className="hamburger-icon"
            style={{ marginTop: '5px' }}
          />
        </div>
        {/* Increased the font size for the title */}
        <div className="navbar-title" style={{ fontSize: '1.5rem' }}>
          Waite
        </div>
        <div className="navbar-signout-container">
          <button className="navbar-signout" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => handleLinkClick('/home')}>Home</li>
          <li onClick={() => handleLinkClick('/leaderboard')}>Leaderboard</li>
          <li onClick={() => handleLinkClick('/speech-test')}>Speech Test</li>
          <li onClick={() => handleLinkClick('/fun-activities')}>Fun Activities</li>
          <li onClick={() => handleLinkClick('/settings')}>Settings</li>
          <li onClick={() => handleLinkClick('/im-drinking')}>I'm Drinking</li>
        </ul>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
}
