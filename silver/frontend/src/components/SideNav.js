import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logout from './Logout';
import {
  FaUser, FaCalendarAlt, FaImages, FaCog, FaChartLine, FaInfoCircle,
} from 'react-icons/fa';
import '../styles/SideNav.css';

const SideNav = ({ isSidebarOpen, toggleSidebar, setToggleMobileSidebar }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchMove, setTouchMove] = useState(null);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    setToggleMobileSidebar(() => toggleMobileSidebar);
  }, [setToggleMobileSidebar]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        toggleSidebar();
        if (isSidebarOpen) toggleSidebar();
      } else {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [toggleSidebar, isSidebarOpen]);

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
        setIsMobileSidebarOpen(true);
      } else if (distance < -50 && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    }
    setTouchStart(null);
    setTouchMove(null);
  };

  const handleOverlayClick = () => {
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 576) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={handleOverlayClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}

      <aside
        className={`side-nav ${isSidebarOpen ? '' : 'collapsed'} ${
          isMobileSidebarOpen ? 'mobile-open' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          {isSidebarOpen ? '✖' : '☰'}
        </button>

        <ul>
          <li>
            <Link to="/profile" className="nav-link" onClick={handleLinkClick}>
              <FaUser className="nav-icon" />
              <span className="nav-text">Profile</span>
            </Link>
          </li>
          <li>
            <Link to="/calendar" className="nav-link" onClick={handleLinkClick}>
              <FaCalendarAlt className="nav-icon" />
              <span className="nav-text">Calendar</span>
            </Link>
          </li>
          <li>
            <Link to="/gallery" className="nav-link" onClick={handleLinkClick}>
              <FaImages className="nav-icon" />
              <span className="nav-text">Gallery</span>
            </Link>
          </li>
          <li>
            <Link to="/mood-tracker" className="nav-link" onClick={handleLinkClick}>
              <FaChartLine className="nav-icon" />
              <span className="nav-text">Mood Tracker</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className="nav-link" onClick={handleLinkClick}>
              <FaCog className="nav-icon" />
              <span className="nav-text">Settings</span>
            </Link>
          </li>
          <li>
            <Link to="/about" className="nav-link" onClick={handleLinkClick}>
              <FaInfoCircle className="nav-icon" />
              <span className="nav-text">About</span>
            </Link>
          </li>
          <li>
            <Logout />
          </li>
        </ul>
      </aside>

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