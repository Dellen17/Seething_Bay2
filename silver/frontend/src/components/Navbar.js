import React from 'react';
import '../styles/Navbar.css';

const Navbar = ({ isSidebarOpen }) => {
  return (
    <header className={`navbar ${isSidebarOpen ? '' : 'collapsed'}`}>
      <h1 className="navbar-logo">Seething Bay</h1>
      {/* Add other navbar controls here */}
    </header>
  );
};

export default Navbar;