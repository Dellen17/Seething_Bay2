import React from 'react';
import '../styles/Navbar.css';

const Navbar = ({ isSidebarOpen, toggleMobileSidebar }) => {
  return (
    <header className={`navbar ${isSidebarOpen ? '' : 'collapsed'}`}>
      <button className="mobile-hamburger" onClick={toggleMobileSidebar}>
        ☰
      </button>
      <h1 className="navbar-logo">Seething Bay</h1>
    </header>
  );
};

export default Navbar;