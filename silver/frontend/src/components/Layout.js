import React, { useState, useCallback } from 'react';
import Navbar from './Navbar';
import SideNav from './SideNav';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="layout-container">
      <SideNav isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar isSidebarOpen={isSidebarOpen} />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;