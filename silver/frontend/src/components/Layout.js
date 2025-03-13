import React, { useState, useCallback } from 'react'; // Add useCallback
import Navbar from './Navbar';
import SideNav from './SideNav';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Memoize the toggleSidebar function
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

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