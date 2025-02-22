import React from 'react';
import { Link } from 'react-router-dom';
import Logout from './Logout';
import {
  FaUser,       // Profile icon
  FaCalendarAlt, // Calendar icon
  FaImages,      // Gallery icon
  FaCog,         // Settings icon
  FaSignOutAlt,  // Logout icon
} from 'react-icons/fa';
import '../styles/SideNav.css';

const SideNav = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <aside className={`side-nav ${isSidebarOpen ? '' : 'collapsed'}`}>
      {/* Toggle Button */}
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
          <Link to="/settings" className="nav-link">
            <FaCog className="nav-icon" />
            <span className="nav-text">Settings</span>
          </Link>
        </li>
        <li>
          <Logout />
        </li>
      </ul>
    </aside>
  );
};

export default SideNav;