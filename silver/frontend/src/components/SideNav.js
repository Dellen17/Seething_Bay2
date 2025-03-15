import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logout from './Logout';
import {
  FaUser, FaCalendarAlt, FaImages, FaCog, FaChartLine, FaInfoCircle,
} from 'react-icons/fa';
import '../styles/SideNav.css';

const SideNav = ({ isSidebarOpen, toggleSidebar }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Mobile-specific state
  const [touchStart, setTouchStart] = useState(null);
  const [touchMove, setTouchMove] = useState(null);

  // Handle screen resize for desktop sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        toggleSidebar(); // Use toggleSidebar to collapse if currently open
        if (isSidebarOpen) toggleSidebar(); // Ensure it collapses on mobile
      } else {
        setIsMobileSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [toggleSidebar, isSidebarOpen]); // Add isSidebarOpen to dependencies

  // Swipe detection for mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchMove(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart && touchMove) {
      const distance = touchMove - touchStart;
      if (distance > 50 && !isMobileSidebarOpen) {
        setIsMobileSidebarOpen(true); // Swipe right to open
      } else if (distance < -50 && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false); // Swipe left to close
      }
    }
    setTouchStart(null);
    setTouchMove(null);
  };

  // Close mobile sidebar when clicking outside
  const handleOverlayClick = () => {
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={handleOverlayClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`side-nav ${isSidebarOpen ? '' : 'collapsed'} ${
          isMobileSidebarOpen ? 'mobile-open' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Toggle Button (Desktop Only) */}
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          {isSidebarOpen ? '✖' : '☰'}
        </button>

        {/* Navigation Links */}
        <ul>
          <li>
            <Link to="/profile" className="nav-link">
              <FaUser className="nav-icon" />
              <span className="nav-text">Profile</span>
            </Link>
          </li>
          <li>
            <Link to="/calendar" className="nav-link">
              <FaCalendarAlt className="nav-icon" />
              <span className="nav-text">Calendar</span>
            </Link>
          </li>
          <li>
            <Link to="/gallery" className="nav-link">
              <FaImages className="nav-icon" />
              <span className="nav-text">Gallery</span>
            </Link>
          </li>
          <li>
            <Link to="/mood-tracker" className="nav-link">
              <FaChartLine className="nav-icon" />
              <span className="nav-text">Mood Tracker</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className="nav-link">
              <FaCog className="nav-icon" />
              <span className="nav-text">Settings</span>
            </Link>
          </li>
          <li>
            <Link to="/about" className="nav-link">
              <FaInfoCircle className="nav-icon" />
              <span className="nav-text">About</span>
            </Link>
          </li>
          <li>
            <Logout />
          </li>
        </ul>
      </aside>

      {/* Mobile Trigger (Swipe Area) */}
      {!isMobileSidebarOpen && window.innerWidth < 576 && (
        <div
          className="mobile-swipe-area"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}
    </>
  );
};

export default SideNav;