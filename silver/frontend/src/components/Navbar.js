import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../styles/Navbar.css';

const Navbar = ({ isSidebarOpen, toggleMobileSidebar }) => {
  return (
    <header className={`navbar ${isSidebarOpen ? '' : 'collapsed'}`}>
      <button className="mobile-hamburger" onClick={toggleMobileSidebar}>
        ☰
      </button>
      <Link to="/" className="navbar-logo">
        <h1>Seething Bay</h1>
      </Link>
    </header>
  );
};

export default Navbar;