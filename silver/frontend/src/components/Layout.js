import React, { useState, useCallback } from 'react';
import Navbar from './Navbar';
import SideNav from './SideNav';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toggleMobileSidebar, setToggleMobileSidebar] = useState(() => () => {});

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="layout-container">
      <SideNav
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        setToggleMobileSidebar={setToggleMobileSidebar}
      />
      <div className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Navbar
          isSidebarOpen={isSidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;