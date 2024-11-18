import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/">Ric'Ochat</Link>
        </div>

        {/* Links for larger screens */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/profile" className="navbar-link">Profile</Link>
          <Link to="/calendar" className="navbar-link">Calendar</Link>
          <Link to="/logout" className="navbar-link">Logout</Link>
        </div>

        {/* Hamburger menu for smaller screens */}
        <div className="navbar-menu" onClick={toggleMobileMenu}>
          <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;