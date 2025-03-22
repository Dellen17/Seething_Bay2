import React from 'react';
import '../styles/Navbar.css';

const Navbar = ({ isSidebarOpen, toggleMobileSidebar }) => {
  return (
    <header className={`navbar ${isSidebarOpen ? '' : 'collapsed'}`}>
      {/* Hamburger Menu Icon (Mobile Only) */}
      <button className="mobile-hamburger" onClick={toggleMobileSidebar}>
        ☰
      </button>
      <h1 className="navbar-logo">Seething Bay</h1>
      {/* Add other navbar controls here */}
    </header>
  );
};

export default Navbar;