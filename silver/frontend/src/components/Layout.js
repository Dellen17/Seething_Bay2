import React, { useState } from 'react';
import Navbar from './Navbar';
import SideNav from './SideNav';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout-container">
      {/* Side Navigation */}
      <SideNav isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        {/* Top Navbar */}
        <Navbar isSidebarOpen={isSidebarOpen} />

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;